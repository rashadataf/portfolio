# Backup service Dockerfile
# NOTE: keep this major version >= the postgres server version (Pulumi uses postgres:17.0).
# pg_dump cannot dump from a NEWER server than itself, so 16 would fail against 17.
FROM postgres:17-alpine

# Install required tools
# Note: postgres:16-alpine already includes pg_dump, so no postgresql-client needed
# dumb-init acts as PID 1 for proper signal handling
RUN apk add --no-cache \
    bash \
    gzip \
    tzdata \
    dumb-init

# Create backup user
RUN addgroup -g 1000 backup && \
    adduser -D -u 1000 -G backup backup

# Create backup directory
RUN mkdir -p /backups && chown backup:backup /backups

# Copy scripts
COPY backup-postgres.sh /usr/local/bin/backup-postgres.sh
COPY backup-scheduler.sh /usr/local/bin/backup-scheduler.sh
RUN chmod +x /usr/local/bin/backup-postgres.sh /usr/local/bin/backup-scheduler.sh

# Environment variables (set via Pulumi/docker-compose)
ENV BACKUP_DIR=/backups \
    POSTGRES_HOST=postgres \
    POSTGRES_PORT=5432 \
    POSTGRES_USER=rashad \
    POSTGRES_DB=portfolio \
    RETENTION_DAYS=30

# dumb-init as PID 1 for proper signal handling.
# The scheduler fixes /backups ownership, then loops: sleep until 02:00 UTC, run backup, repeat.
ENTRYPOINT ["dumb-init", "--"]
CMD ["/usr/local/bin/backup-scheduler.sh"]
