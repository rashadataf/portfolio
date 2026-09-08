# Infrastructure for my Portfolio (Pulumi + Docker)

This folder contains the infrastructure-as-code for my personal portfolio. It is Docker-only and managed with Pulumi YAML. The goals are:
- Single reverse proxy (Traefik) for routing and automatic TLS (Let’s Encrypt) — no certbot or extra runtimes on the host
- Apps (portfolio and future projects) run as Docker containers and are routed by domain/subdomain via labels
- Environment-driven and stack-driven: dev (HTTP) vs prod (HTTPS) controlled by config
- Clean persistence via Docker volumes (e.g., Postgres) and a shared application network

## What this deploys

- Docker network: `portfolio-infra-network` (from `APP_NETWORK_NAME` – shared by Traefik, app, database, observability, and attached projects)
- Traefik v2 reverse proxy with the Docker provider
- Postgres 17 with a named Docker volume for data
- The portfolio app container, fronted by Traefik
- Observability stack (Prometheus, Loki, Promtail, Grafana, Alertmanager, exporters) via the `observability:Observation` component

## Key configuration (Pulumi config keys)

- Networking
  - `HTTP_PORT` (default `80`) and `HTTPS_PORT` (default `443`)
  - `ROUTER_ENTRYPOINT` (dev: `web`, prod: `websecure`)
  - `APP_NETWORK_NAME` (defaults to `portfolio-infra-network` via `${pulumi.project}-network`)
- TLS / domain
  - `ENABLE_TLS`: `false` (dev) / `true` (prod)
  - `DOMAIN_NAME`: base domain or host to route (e.g., `localhost`, `rashadataf.com`)
  - `ACME_EMAIL`: contact email used by Let’s Encrypt
- Portfolio app
  - `APP_PORT`: internal app port (default `3000`)
  - Image/build:
    - `PORTFOLIO_IMAGE_NAME`: image tag or local build name
    - `PORTFOLIO_BUILD_CONTEXT`, `PORTFOLIO_WORKDIR_PATH`, `PORTFOLIO_BUILD_PHASE_TARGET`
- Database
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
  - `POSTGRES_VOLUME_NAME` (default `portfolio_postgres_data`)
- Observability
  - `PROMETHEUS_*`, `GRAFANA_*`, `LOKI_*`, `PROMTAIL_*`, `ALERTMANAGER_*`, exporter ports, etc.

See `infra/Pulumi.yaml` for the full schema and defaults. Dev/prod values are usually managed via `Pulumi.dev.yaml` and `Pulumi.prod.yaml` in this folder.

## Deploying

Where the portfolio image comes from is controlled by `PORTFOLIO_IMAGE_SOURCE`:
`0` builds it locally, `1` pulls it from GHCR.

- **Dev (local):** `cd infra && pulumi stack select dev && pulumi up` — `PORTFOLIO_IMAGE_SOURCE=0`, so the image is built from `../app`. Dev bind-mounts the source and runs `yarn dev`, so this only needs to rebuild when dependencies change; force it with `pulumi up --replace $(pulumi stack --show-urns | grep portfolioImage | awk '{print $NF}')`.
- **Prod (VPS):** push a `v*` git tag. CI lints, tests, builds, then pushes `ghcr.io/<owner>/<repo>/portfolio:<tag>`. The self-hosted runner then runs `pulumi up` with `PORTFOLIO_IMAGE_SOURCE=1`, which **pulls** that image rather than rebuilding it.

  The VPS deliberately does **not** compile the app. It used to: `portfolioImage`
  was a `docker-build:Image`, so every deploy re-ran `next build` on the VPS,
  duplicating what CI had already done. A cold build took ~12 minutes and was
  eventually OOM-killed mid-`pulumi up` (`Killed`, SIGKILL from the kernel),
  failing the deploy on the 25-minute job timeout. Building once in CI and
  shipping that artifact removes both the duplicate work and the memory ceiling.

  For the same reason the deploy no longer runs `docker system prune -af` /
  `docker builder prune -af` — that wiped every cached layer before each deploy,
  guaranteeing a cold start. It now prunes dangling images older than a week.

## How routing works

Traefik watches Docker and creates routes based on labels attached to containers.

For the portfolio app, labels are based on `DOMAIN_NAME` and `ROUTER_ENTRYPOINT`:

- `traefik.http.routers.portfolio.rule = Host(${DOMAIN_NAME})` and `Host(www.${DOMAIN_NAME})`
- `traefik.http.routers.portfolio.entrypoints = ${ROUTER_ENTRYPOINT}`
- `traefik.http.routers.portfolio.tls = ${ENABLE_TLS}` (and `certresolver=letsencrypt`)

Access the app at:

- Dev (HTTP, typical): `http://localhost` when `DOMAIN_NAME=localhost` and `ENABLE_TLS=false`
- Prod (HTTPS): `https://${DOMAIN_NAME}` and `https://www.${DOMAIN_NAME}` (DNS must point to the server)

If you see a Traefik 404, it usually means the Host header didn’t match `DOMAIN_NAME`.

## Data persistence (Postgres)

Postgres stores data in a Docker named volume (configurable by `POSTGRES_VOLUME_NAME`). This keeps the repo clean and is production-friendly. Docker manages the volume lifecycle; you can back it up separately.

If you prefer a host path bind mount, we can add a toggle later; named volumes are the default here for safety and portability.

## Attaching additional projects (subdomains) via separate Pulumi stacks

The core stack in this folder (`portfolio-infra`) is responsible for:

- Shared Docker network, Traefik, Postgres, observability, and the portfolio app.

Additional apps (projects) are managed in their **own Pulumi projects** under `projects/<name>/infra`, using a `StackReference` to read shared settings from this stack.

Example: `projects/hello-world-react/infra/Pulumi.yaml`:

- Uses `CORE_STACK_NAME` (e.g. `your-org/portfolio-infra/dev`) to reference this stack.
- Reads outputs such as `appNetworkName`, `domainName`, `routerEntrypoint`, `enableTls`.
- Builds its own Docker image and runs a container on the shared network.
- Adds Traefik labels so it is reachable at `hello-world.${DOMAIN_NAME}`.

To add a new project:

1. Place the project under `projects/my-app` with a Dockerfile that builds and runs it.
2. Create `projects/my-app/infra/Pulumi.yaml` by copying/adapting the hello-world example.
3. Configure its stack (e.g. `Pulumi.dev.yaml`) with:
  - `CORE_STACK_NAME` pointing to this core stack (e.g. `your-org/portfolio-infra/dev`).
  - An `APP_PORT` that matches the container's internal listening port.
4. Run `pulumi up` in this folder (core infra) first, then in `projects/my-app/infra`.

## Stacks and TLS

- Dev stack (`Pulumi.dev.yaml`): typically `ENABLE_TLS=false`, `ROUTER_ENTRYPOINT=web`, `DOMAIN_NAME=localhost`.
- Prod stack (`Pulumi.prod.yaml`): `ENABLE_TLS=true`, `ROUTER_ENTRYPOINT=websecure`, `DOMAIN_NAME` set to a real domain, `ACME_EMAIL` set to a real email.

Certificates and ACME account details are stored by Traefik in a Docker volume (`traefik-data`). Ensure DNS records point to the server for production issuance.

## Quick start (dev example)

```bash
# From repo root
cd infra
pulumi stack select dev   # assumes Pulumi.dev.yaml is committed
pulumi up
```

This brings up the dev stack using the configuration defined in `Pulumi.dev.yaml`.

For production, use:

```bash
cd infra
pulumi stack select prod  # uses Pulumi.prod.yaml
pulumi up
```

Ensure `DOMAIN_NAME`, `ENABLE_TLS`, `ROUTER_ENTRYPOINT`, `ACME_EMAIL`, and database/auth secrets are correctly set in the corresponding stack config file before running `pulumi up`.

## Notes

- Traefik's dashboard is **no longer published**. `TRAEFIK_API_INSECURE` has been removed and port `8080` is not mapped to the host — it previously served an unauthenticated view of every router, service and TLS cert to anyone who could reach the host. To inspect routing, either re-enable `TRAEFIK_API_INSECURE=true` temporarily or add a router for `api@internal` behind basic auth.
- Postgres is **not** published to the host either. Docker writes published ports straight into the iptables `nat` table, which bypasses `ufw`, so `external: 5432` exposes the database publicly unless a cloud firewall independently blocks it. Every consumer reaches it over the `postgres` network alias; use `docker exec … psql` for manual access.
- Container memory ceilings (`PORTFOLIO_MEMORY_MB`, `POSTGRES_MEMORY_MB`, `TRAEFIK_MEMORY_MB`, `BACKUP_MEMORY_MB`) default to `0` (unlimited). Set them per stack against `free -h` on the host — generous values are fine, the point is only to stop one container from consuming all RAM and letting the OOM-killer choose the victim.
- Observability images are pinned to explicit versions rather than `:latest`, so a redeploy cannot silently swap in a new Loki/Grafana major that rejects the config templates in `observation/templates/`.
- You only need Docker and the Pulumi CLI on the host. Pulumi fetches provider plugins automatically.
- An observability stack (Prometheus, Loki, Promtail, Grafana, Alertmanager, exporters) is already provisioned via the custom `observability:Observation` component.

---

If you spot mismatches between this README and `pulumi.yaml`, the YAML is the source of truth—open an issue and I’ll align the docs.
