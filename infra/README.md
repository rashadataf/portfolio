# Infrastructure for my Portfolio (Pulumi + Docker)

This folder contains the infrastructure-as-code for my personal portfolio. It is Docker-only and managed with Pulumi YAML. The goals are:
- Single reverse proxy (Traefik) for routing and automatic TLS (Let’s Encrypt) — no certbot or extra runtimes on the host
- Apps (portfolio and future projects) run as Docker containers and are routed by domain/subdomain via labels
- Environment-driven and stack-driven: dev (HTTP) vs prod (HTTPS) controlled by config
- Clean persistence via Docker volumes (e.g., Postgres) and a shared application network

## What this deploys (initial)

- Docker network: `app-network` (shared by proxy, app, and database)
- Traefik v2 reverse proxy with the Docker provider
- Postgres 17 with a named Docker volume for data
- The portfolio app container, fronted by Traefik

## Key configuration (Pulumi config keys)

- Networking
  - `HTTP_PORT` (default `80`) and `HTTPS_PORT` (default `443`)
  - `ROUTER_ENTRYPOINT` (dev: `web`, prod: `websecure`)
- TLS
  - `ENABLE_TLS`: `false` (dev) / `true` (prod)
  - `ACME_EMAIL`: contact email used by Let’s Encrypt
- Portfolio app
  - `PORTFOLIO_HOST`: hostname to route (e.g., `example.com`)
  - `APP_PORT`: internal app port (default `3000`)
  - Image/build:
    - `PORTFOLIO_IMAGE_NAME`: image tag or local build name
    - `PORTFOLIO_BUILD_CONTEXT`, `PORTFOLIO_WORKDIR_PATH`, `PORTFOLIO_BUILD_PHASE_TARGET`
- Database
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
  - `POSTGRES_VOLUME_NAME` (default `portfolio_postgres_data`)

See `infra/pulumi.yaml` for the full schema and defaults.

## How routing works

Traefik watches Docker and creates routes based on labels attached to containers. The portfolio app sets:
- `traefik.http.routers.portfolio.rule = Host(${PORTFOLIO_HOST})`
- `traefik.http.routers.portfolio.entrypoints = ${ROUTER_ENTRYPOINT}`
- `traefik.http.routers.portfolio.tls = ${ENABLE_TLS}` (and `certresolver=letsencrypt`)

Access the app at:
- Dev (HTTP): `http://${PORTFOLIO_HOST}` (often `localhost`)
- Prod (HTTPS): `https://${PORTFOLIO_HOST}` (DNS must point to the server)

If you see a Traefik 404, it usually means the Host header didn’t match `PORTFOLIO_HOST`.

## Data persistence (Postgres)

Postgres stores data in a Docker named volume (configurable by `POSTGRES_VOLUME_NAME`). This keeps the repo clean and is production-friendly. Docker manages the volume lifecycle; you can back it up separately.

If you prefer a host path bind mount, we can add a toggle later; named volumes are the default here for safety and portability.

## Add another project (subdomain example)

1) Build/push an image for your project (e.g., GHCR), or build locally via Pulumi’s image resource.
2) Add a new `docker:RemoteImage` and `docker:Container` to `infra/pulumi.yaml` with Traefik labels similar to the portfolio app:
   - `traefik.enable = true`
   - `traefik.http.services.myapp.loadbalancer.server.port = <internal_port>`
   - `traefik.http.routers.myapp.entrypoints = ${ROUTER_ENTRYPOINT}`
   - `traefik.http.routers.myapp.rule = Host(myapp.${PORTFOLIO_HOST})` or a separate config like `MYAPP_HOST`
   - `traefik.http.routers.myapp.tls = ${ENABLE_TLS}` and `certresolver=letsencrypt`

## Stacks and TLS

- Dev stack: `ENABLE_TLS=false`, `ROUTER_ENTRYPOINT=web`
- Prod stack: `ENABLE_TLS=true`, `ROUTER_ENTRYPOINT=websecure`, `ACME_EMAIL` set to a real email

Certificates and ACME account details are stored by Traefik in a Docker volume (`traefik-data`). Ensure DNS records point to the server for production issuance.

## Quick start (example)

```bash
# From repo root
cd infra
pulumi stack init dev || true
pulumi config set PORTFOLIO_HOST localhost
pulumi config set ENABLE_TLS false
pulumi config set ROUTER_ENTRYPOINT web
# Required DB secrets (sample)
pulumi config set --secret POSTGRES_USER postgres
pulumi config set --secret POSTGRES_PASSWORD example
pulumi config set --secret POSTGRES_DB portfolio
pulumi up
```

For production, switch `PORTFOLIO_HOST` to your real domain, set `ENABLE_TLS=true`, `ROUTER_ENTRYPOINT=websecure`, and set `ACME_EMAIL`. Make sure DNS A/AAAA records point to the server first.

## Notes

- Traefik dashboard is disabled by default. We can add a secure route if needed.
- You only need Docker and the Pulumi CLI on the host. Pulumi fetches provider plugins automatically.
- Monitoring stack (OTEL, Prometheus, Grafana) is easy to add as Docker resources in the same Pulumi program if/when needed.

---

If you spot mismatches between this README and `pulumi.yaml`, the YAML is the source of truth—open an issue and I’ll align the docs.
