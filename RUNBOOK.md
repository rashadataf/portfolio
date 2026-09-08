# Production Runbook

This document provides operational procedures for the Portfolio application in production.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Deployment](#deployment)
3. [Monitoring & Alerting](#monitoring--alerting)
4. [Common Operations](#common-operations)
5. [Incident Response](#incident-response)
6. [Backup & Recovery](#backup--recovery)
7. [Scaling](#scaling)
8. [Security](#security)

---

## Architecture Overview

### Components
- **Frontend**: Next.js 15 application (React 19, TypeScript)
- **Database**: PostgreSQL 16 (managed via Docker/Pulumi)
- **Reverse Proxy**: Traefik (TLS termination, routing)
- **Observability**:
  - Prometheus (metrics collection)
  - Grafana (dashboards)
  - Loki (log aggregation)
  - Alertmanager (alerting)
  - Node Exporter / cAdvisor (system metrics)
- **Infrastructure**: Pulumi (IaC), Docker Compose

### Network Architecture
```
Internet → Traefik (80/443) → Next.js (3000)
                    ↘ Prometheus (9090)
                    ↘ Grafana (3001)
                    ↘ Alertmanager (9093)
                    ↘ Loki (3100)
PostgreSQL (5432) ← Next.js
```

---

## Deployment

### Prerequisites
- Docker & Docker Compose
- Pulumi CLI
- Access to production secrets (stored in Pulumi config)

### Deploy to Production
```bash
# 1. Select production stack
pulumi stack select prod

# 2. Preview changes
pulumi preview

# 3. Deploy
pulumi up

# 4. Verify deployment
curl -f https://your-domain.com/api/health
```

### Rollback
```bash
# Rollback to previous version
pulumi stack output PORTFOLIO_IMAGE_TAG  # Check current tag
pulumi config set PORTFOLIO_IMAGE_TAG <previous-tag>
pulumi up
```

### Blue/Green Deployment (Future Enhancement)
Currently single-instance. For zero-downtime deployments, consider:
- Running multiple replicas behind Traefik
- Using Docker Swarm or Kubernetes

---

## Monitoring & Alerting

### Key Dashboards (Grafana)
| Dashboard | Purpose |
|-----------|---------|
| Frontend Overview | Request rate, latency, error rate, uptime |
| System Resources | CPU, memory, disk, network |
| Database | Connections, query latency, cache hit ratio |
| Business Metrics | Page views, user actions |

### Critical Alerts
| Alert | Severity | Response Time | Runbook |
|-------|----------|---------------|---------|
| FrontendHealthCheckFailing | Critical | 5 min | Check database, restart app |
| FrontendDown | Critical | 5 min | Check container, Traefik, DNS |
| PostgresqlDown | Critical | 5 min | Check PostgreSQL container, disk |
| PostgresqlHighConnections | Warning | 15 min | Check connection pool, slow queries |
| HighDiskUsage | Warning | 30 min | Clean logs, expand volume |
| HighMemoryUsage | Warning | 15 min | Check for memory leaks, restart |

### Alert Channels
- **Critical**: Email + PagerDuty (if configured)
- **Warning**: Email
- **Info**: Slack (if configured)

---

## Common Operations

### Check Application Health
```bash
# Health endpoint (used by load balancer/k8s)
curl https://your-domain.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-...",
#   "uptime": 3600,
#   "checks": { "database": true },
#   "details": { "database": { "connected": true, "pool": {...} } }
# }
```

### View Logs
```bash
# Application logs
docker logs portfolio-infra-portfolio-prod --tail 100 -f

# All service logs
docker compose -f docker-compose.prod.yml logs -f --tail 100

# Loki/Grafana: Use Grafana Explore with LogQL
# {service="portfolio"} |~ "error"
```

### Check Metrics
```bash
# Prometheus metrics endpoint
curl https://your-domain.com/api/metrics

# Query Prometheus directly
curl "http://prometheus:9090/api/v1/query?query=up{job='frontend-prod'}"
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it portfolio-infra-postgres-prod psql -U rashad -d portfolio

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle' AND now() - pg_stat_activity.query_start > interval '30 seconds';

# Backup
docker exec portfolio-infra-postgres-prod pg_dump -U rashad portfolio > backup.sql

# Restore
docker exec -i portfolio-infra-postgres-prod psql -U rashad -d portfolio < backup.sql
```

### Restart Application
```bash
# Graceful restart (zero-downtime if multiple replicas)
docker compose -f docker-compose.prod.yml restart portfolio

# Or via Pulumi (recreates container)
pulumi up
```

### Update SSL Certificates
Traefik handles Let's Encrypt automatically. To force renewal:
```bash
# Remove ACME certificate files and restart Traefik
docker volume rm portfolio-infra_traefik-acme
docker compose -f docker-compose.prod.yml restart traefik
```

---

## Incident Response

### Incident Severity Levels
| Level | Definition | Response Time | Escalation |
|-------|------------|---------------|------------|
| SEV-1 | Complete outage, data loss | 15 min | Page on-call |
| SEV-2 | Major functionality degraded | 1 hour | Notify team |
| SEV-3 | Minor issue, workaround exists | 4 hours | Create ticket |

### Common Incident Scenarios

#### 1. Application Down (SEV-1)
**Symptoms**: Health check fails, 5xx errors
**Diagnosis**:
```bash
# Check container status
docker ps | grep portfolio

# Check logs
docker logs portfolio-infra-portfolio-prod --tail 50

# Check Traefik
docker logs portfolio-infra-traefik-prod --tail 50
```
**Resolution**:
- If container crashed: `docker compose restart portfolio`
- If database issue: Check PostgreSQL, restart if needed
- If OOM: Check memory limits, increase if needed

#### 2. Database Connection Exhausted (SEV-2)
**Symptoms**: "Too many connections" errors, high latency
**Diagnosis**:
```sql
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```
**Resolution**:
- Check for connection leaks in application
- Increase `DB_POOL_MAX` in Pulumi config
- Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND now() - state_change > interval '10 minutes';`

#### 3. High Latency (SEV-2/3)
**Symptoms**: P95 latency > 1s alert firing
**Diagnosis**:
- Check Grafana dashboard for bottleneck (DB, CPU, network)
- Check slow query log in PostgreSQL
- Check for upstream dependency delays
**Resolution**:
- Add database indexes
- Optimize queries
- Increase resources

#### 4. Disk Space Critical (SEV-2)
**Symptoms**: Disk usage > 85% alert
**Diagnosis**:
```bash
df -h
docker system df
```
**Resolution**:
- Reclaim images not used in the last week: `docker image prune -a --filter "until=168h"`
- Drop stopped containers: `docker container prune`
- Rotate/compress logs
- Expand volume (cloud provider specific)

> **Never run `docker system prune --volumes` here.** It deletes any volume not
> currently attached to a *running* container — so if Postgres happens to be
> stopped (which it is during exactly the kind of incident that makes you check
> disk), it destroys `portfolio_postgres_data_prod` and `portfolio_backups`
> together. Pulumi's `protect: true` guards those against Pulumi, not Docker.
>
> Avoid `docker builder prune -af` too: it throws away the layer cache, so the
> next deploy re-downloads every layer from scratch.

---

## Backup & Recovery

### Automated Backups
- **PostgreSQL**: Daily pg_dump via cron (configure in Docker)
- **Configuration**: Pulumi state backed up to Pulumi Cloud
- **Secrets**: Stored in Pulumi config (encrypted)

### Manual Backup Procedure
```bash
# 1. Backup database
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec portfolio-infra-postgres-prod pg_dump -U rashad portfolio | gzip > backup_${TIMESTAMP}.sql.gz

# 2. Backup uploads (if using local storage)
docker run --rm -v portfolio-infra-portfolio_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_${TIMESTAMP}.tar.gz -C /data .

# 3. Store in off-site location (S3, GCS, etc.)
aws s3 cp backup_${TIMESTAMP}.sql.gz s3://your-backup-bucket/
```

### Recovery Procedure
```bash
# 1. Stop application
docker compose -f docker-compose.prod.yml stop portfolio

# 2. Restore database
gunzip -c backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i portfolio-infra-postgres-prod psql -U rashad -d portfolio

# 3. Restore uploads (if needed)
docker run --rm -v portfolio-infra-portfolio_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_YYYYMMDD_HHMMSS.tar.gz -C /data

# 4. Start application
docker compose -f docker-compose.prod.yml start portfolio

# 5. Verify
curl -f https://your-domain.com/api/health
```

### Recovery Point Objective (RPO)
- **Database**: 24 hours (daily backup)
- **Uploads**: 24 hours (daily backup)
- **Configuration**: 0 (in Git/Pulumi)

### Recovery Time Objective (RTO)
- **Database restore**: ~10 minutes for 1GB
- **Full service recovery**: ~15 minutes

---

## Scaling

### Vertical Scaling (Current)
Increase resources in Pulumi config:
```bash
pulumi config set PORTFOLIO_CPU_LIMIT "2"
pulumi config set PORTFOLIO_MEMORY_LIMIT "2G"
pulumi up
```

### Horizontal Scaling (Future)
1. Add replicas in Docker Compose
2. Configure Traefik load balancing
3. Use Redis for session/rate-limit sharing
4. Consider PostgreSQL read replicas

### Database Scaling
- Connection pooling: PgBouncer (add to Docker Compose)
- Read replicas: PostgreSQL streaming replication
- Partitioning: For large tables

---

## Security

### SSL/TLS
- Traefik handles Let's Encrypt automatically
- HSTS enabled via Traefik labels
- Certificate transparency monitoring

### Secrets Management
- All secrets in Pulumi config (encrypted)
- Never commit `.env` files
- Rotate secrets quarterly:
  - `AUTH_SECRET`
  - `POSTGRES_PASSWORD`
  - `ADMIN_PASSWORD`
  - SMTP credentials

### Access Control
- Admin panel: Protected by NextAuth, admin role required
- Database: Only accessible from application network
- Monitoring: Grafana/Alertmanager behind Traefik auth (if exposed)

### Security Headers (Implemented in Middleware)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- X-XSS-Protection: 1; mode=block

### Vulnerability Scanning
```bash
# Scan Docker image
docker scan portfolio_image:latest

# Or use Trivy
trivy image portfolio_image:latest
```

---

## Useful Commands Reference

```bash
# Pulumi
pulumi stack ls
pulumi config --show-secrets
pulumi refresh

# Docker
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f [service]
docker compose -f docker-compose.prod.yml exec [service] sh

# Database
docker exec -it portfolio-infra-postgres-prod psql -U rashad -d portfolio

# Metrics
curl -s https://your-domain.com/api/metrics | head -50

# Health
curl -s https://your-domain.com/api/health | jq .

# Update image tag
pulumi config set PORTFOLIO_IMAGE_TAG v1.2.1
pulumi up
```

---

## Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Primary On-Call | [Name] | [Phone/Email] |
| Secondary On-Call | [Name] | [Phone/Email] |
| Infrastructure Lead | [Name] | [Phone/Email] |

---

## Changelog
| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2024-01-15 | 1.0 | [Author] | Initial runbook |