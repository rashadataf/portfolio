# Rashad Ataf's Portfolio

This repository contains the source code and infrastructure for my personal portfolio website.  
The stack is:

- **Next.js** (app UI) under [`app/`](app)
- **Postgres** (data)
- **Pulumi + Docker** (infrastructure-as-code) under [`infra/`](infra)
- **Traefik** (reverse proxy, routing, TLS)
- Additional projects under [`projects/`](projects)

The site is served behind Traefik with optional automatic TLS (Let’s Encrypt).

---

## Repository structure

```text
app/                      # Next.js portfolio app
  src/...
infra/                    # Pulumi "portfolio-infra" project (Traefik, Postgres, portfolio, observability)
  Pulumi.yaml
  Pulumi.dev.yaml
  Pulumi.prod.yaml
  README.md
projects/
  hello-world-react/      # Example sub-project
    src/
    infra/                # Pulumi stack attached to portfolio-infra (via Traefik)
    infra-standalone/     # Pulumi stack to run this project alone (no portfolio, no Traefik)
scripts.sh                # Legacy Docker Compose helpers (see "Legacy scripts" section)
```

For more infrastructure details, see [infra/README.md](infra/README.md).

---

## Local development (without Docker / Pulumi)

You can develop the portfolio and projects directly with their dev servers.

### Portfolio app (Next.js)

```bash
cd app
yarn install
yarn dev
```

This starts Next.js on `http://localhost:3000`.

### Example project: hello-world-react

```bash
cd projects/hello-world-react
yarn install
yarn dev
```

This starts Vite on `http://localhost:3001` (see [projects/hello-world-react/vite.config.ts](projects/hello-world-react/vite.config.ts)).

In this mode there is **no Traefik, no Postgres, no Pulumi** – just app-only development.

---

## Full stack with Pulumi (Traefik + Postgres + portfolio)

The full environment is managed by the Pulumi project in [infra/Pulumi.yaml](infra/Pulumi.yaml) (`name: portfolio-infra`).

Two stacks are preconfigured:

- **dev** – HTTP, no TLS, `DOMAIN_NAME=localhost`
- **prod** – HTTPS, real `DOMAIN_NAME` and TLS enabled

### Prerequisites

- Docker
- Pulumi CLI (`pulumi`)

### Bring up the core stack (portfolio-infra)

From repo root:

```bash
cd infra

# Dev stack (HTTP on localhost)
pulumi stack select dev
pulumi up

# Prod stack (HTTPS on rashadataf.com, for example)
pulumi stack select prod
pulumi up
```

The dev and prod stack configs are stored in:

- [infra/Pulumi.dev.yaml](infra/Pulumi.dev.yaml)
- [infra/Pulumi.prod.yaml](infra/Pulumi.prod.yaml)

Core stack provisions:

- Docker network `app-network` (see `APP_NETWORK_NAME` in [infra/Pulumi.yaml](infra/Pulumi.yaml))
- Postgres 17 container with a named volume
- Traefik reverse proxy
- Portfolio app container built from [app/Dockerfile](app/Dockerfile)
- Observability stack via the [`observability:Observation`](infra/Pulumi.yaml) component

Access:

- Dev: `http://localhost` (or `http://localhost:80`)
- Prod: `https://rashadataf.com` (and `https://www.rashadataf.com`), depending on `DOMAIN_NAME`

---

## Deploying a project under the portfolio (Traefik subdomain)

Projects live under [`projects/`](projects). Each project is:

- A standalone app (with its own `package.json`, dev server, Dockerfile)
- Optionally attached to the shared infra via a **project-specific Pulumi stack** under `projects/<name>/infra`

The example project is [`projects/hello-world-react`](projects/hello-world-react).

### How the hello-world project integrates

The Pulumi program at  
[projects/hello-world-react/infra/Pulumi.yaml](projects/hello-world-react/infra/Pulumi.yaml):

- Uses a `StackReference` to the core stack:

  - `coreStack` → `CORE_STACK_NAME` (e.g. `your-org/portfolio-infra/dev`)
  - Reads `appNetworkName`, `domainName`, `routerEntrypoint`, `enableTls` from [infra/Pulumi.yaml](infra/Pulumi.yaml) outputs

- Builds a Docker image from the project:

  - [projects/hello-world-react/Dockerfile](projects/hello-world-react/Dockerfile)

- Runs a container on the same network as the portfolio
- Adds Traefik labels so it’s reachable at:

  - `http://hello-world.${DOMAIN_NAME}` (dev, no TLS)
  - `https://hello-world.${DOMAIN_NAME}` (prod, with TLS)

See [projects/hello-world-react/infra/Pulumi.yaml](projects/hello-world-react/infra/Pulumi.yaml) for the exact labels and config keys.

#### Deploy hello-world in dev

1. Ensure core stack is up:

   ```bash
   cd infra
   pulumi stack select dev
   pulumi up
   ```

2. Deploy the hello-world project stack:

   ```bash
   cd ../projects/hello-world-react/infra
   pulumi stack select dev || pulumi stack init dev
   pulumi up
   ```

   The dev configuration is in  
   [projects/hello-world-react/infra/Pulumi.dev.yaml](projects/hello-world-react/infra/Pulumi.dev.yaml) and typically sets:

   - `hello-world:CORE_STACK_NAME` – e.g. `your-org/portfolio-infra/dev`
   - `hello-world:APP_PORT` – container’s internal port (for prod image this is often `80`)
   - `hello-world:BUILD_PHASE_TARGET` – `development` or `production` (Dockerfile target)

3. Access:

   - If `DOMAIN_NAME=localhost`: `http://hello-world.localhost`
   - Otherwise: `http://hello-world.<your-domain>`

#### Deploy hello-world in prod

1. Bring up `portfolio-infra` prod stack:

   ```bash
   cd infra
   pulumi stack select prod
   pulumi up
   ```

2. Deploy hello-world prod stack:

   ```bash
   cd ../projects/hello-world-react/infra
   pulumi stack select prod || pulumi stack init prod
   pulumi up
   ```

   Configure `CORE_STACK_NAME` to point to your prod portfolio stack
   (e.g. `your-org/portfolio-infra/prod`) and `APP_PORT` to the internal port exposed by the production stage of the Dockerfile (often `80`).

3. Access: `https://hello-world.${DOMAIN_NAME}`.

#### How to add a new project (as if from its own repo)

Assume you have a completely separate repo for a project called `my-app`.

1. **Copy the app into `projects/`:**

   ```bash
   # In the portfolio repo root
   mkdir -p projects
   # Clone / copy your app here
   git clone <your-my-app-repo> projects/my-app
   ```

   Or just copy the built project files into `projects/my-app`.

2. **Ensure the app has:**

- A Dockerfile that can build and run the project (regardless of language or framework)
  - It must expose a clear internal port that your application listens on (e.g. `8080`, `3000`, `80`, etc.)
  - Optional: a separate development or build stage if you want different behavior per stack (e.g. `development` vs `production`)

3. **Create a Pulumi project under `projects/my-app/infra`:**

   The simplest path is to copy and adapt the hello-world infra:

   ```bash
   cp -R projects/hello-world-react/infra projects/my-app/infra
   ```

   Then in `projects/my-app/infra/Pulumi.yaml`:

   - Change:

     - `name: hello-world` → `name: my-app`
     - Image name from `hello-world-react` to something like `my-app`
     - Traefik labels:

       - Service name: `traefik.http.services.my-app.loadbalancer.server.port`
       - Routers: `traefik.http.routers.my-app.*`
       - Host rule: e.g. `Host(\`my-app.${DOMAIN_NAME}\`)`

   - Make sure the Docker build `context` points to `..` (the project root).

4. **Configure the new project stack:**

   Example dev stack config (`projects/my-app/infra/Pulumi.dev.yaml`):

   ```yaml
   config:
     my-app:APP_PORT: "80"                      # internal port exposed by your app’s Dockerfile (prod stage)
     my-app:CORE_STACK_NAME: your-org/portfolio-infra/dev
     my-app:BUILD_PHASE_TARGET: development     # or production
   ```

5. **Deploy:**

   - Core stack (once per environment):

     ```bash
     cd infra
     pulumi up -s dev
     ```

   - Project stack (per project):

     ```bash
     cd ../projects/my-app/infra
     pulumi up -s dev
     ```

   You can now update / destroy just `my-app` via its Pulumi stack without touching other projects.

---

## Standalone deployment of a project (no portfolio, no Traefik)

The example project also includes  
[projects/hello-world-react/infra-standalone/Pulumi.yaml](projects/hello-world-react/infra-standalone/Pulumi.yaml).

This stack:

- Builds the app Docker image
- Runs it in a single container
- Exposes it directly on a host port (`HOST_PORT`, default `3001`)
- **Does not** need the portfolio-infra stack or Traefik

Usage:

```bash
cd projects/hello-world-react/infra-standalone
pulumi stack select dev || pulumi stack init dev
pulumi up
```

App will be available at the `url` output (default `http://localhost:3001`).

You can replicate this pattern for other projects if you need them to run completely standalone.

---

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the MIT License.

## Author

**Rashad Ataf** – [Portfolio](https://www.rashadataf.com/)

Thank you for visiting my portfolio repository!