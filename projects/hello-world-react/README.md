# hello-world-react (example project)

This is a minimal React project used as an example of how to host additional apps under the portfolio infrastructure.

It demonstrates:

- Local development with Vite
- Integration with the shared Pulumi infra (`portfolio-infra`) and Traefik
- A standalone Pulumi stack that runs only this app

---

## Structure

```text
projects/hello-world-react/
  src/                    # React source
  index.html
  package.json
  vite.config.ts
  Dockerfile

  infra/                  # Pulumi stack attached to portfolio-infra (Traefik subdomain)
    Pulumi.yaml
    Pulumi.dev.yaml
    Pulumi.prod.yaml (optional)

  infra-standalone/       # Pulumi stack to run this app alone (no Traefik)
    Pulumi.yaml
    Pulumi.dev.yaml (optional)
```

Key files:

- App code: [projects/hello-world-react/src/main.tsx](src/main.tsx), [projects/hello-world-react/index.html](index.html)
- Vite config: [projects/hello-world-react/vite.config.ts](vite.config.ts)
- Dockerfile: [projects/hello-world-react/Dockerfile](Dockerfile)
- Attached infra: [projects/hello-world-react/infra/Pulumi.yaml](infra/Pulumi.yaml)
- Standalone infra: [projects/hello-world-react/infra-standalone/Pulumi.yaml](infra-standalone/Pulumi.yaml)

---

## Local development (no Docker / Pulumi)

```bash
cd projects/hello-world-react
yarn install
yarn dev
```

The app will be available at `http://localhost:3001` (configured in [vite.config.ts](vite.config.ts)).

---

## Pulumi infra attached to portfolio-infra (`infra/`)

The Pulumi project in [infra/Pulumi.yaml](infra/Pulumi.yaml):

- Name: `hello-world`
- Reads config:

  - `CORE_STACK_NAME` – Pulumi stack name for the core portfolio infra (e.g. `your-org/portfolio-infra/dev`)
  - `APP_PORT` – internal port inside the container (e.g. `80` for the Nginx production stage)
  - `BUILD_PHASE_TARGET` – Docker build target (`development` or `production`)

- Defines a `StackReference`:

  ```yaml
  coreStack:
    type: pulumi:pulumi:StackReference
    properties:
      name: "${CORE_STACK_NAME}"
  ```

- Uses `coreStack.outputs` to get:

  - `appNetworkName` – the Docker network name
  - `domainName` – the DOMAIN_NAME from the core infra
  - `routerEntrypoint` – `web` or `websecure`
  - `enableTls` – `false` (dev) / `true` (prod)

- Builds the Docker image from this project:

  ```yaml
  helloWorldReactImage:
    type: docker:Image
    properties:
      imageName: "hello-world-react:latest"
      build:
        context: ".."
        platform: "linux/amd64"
        target: "${BUILD_PHASE_TARGET}"
  ```

- Runs a container on the shared network with Traefik labels so this app is routed at:

  - `hello-world.${DOMAIN_NAME}`
  - `www.hello-world.${DOMAIN_NAME}`

### Dev deployment (attached to dev portfolio-infra)

1. Make sure the core dev stack is up:

   ```bash
   cd ../../infra
   pulumi stack select dev
   pulumi up
   ```

2. Deploy the hello-world dev stack:

   ```bash
   cd ../projects/hello-world-react/infra
   pulumi stack select dev || pulumi stack init dev
   pulumi up
   ```

   Dev config is in [infra/Pulumi.dev.yaml](infra/Pulumi.dev.yaml) and typically sets:

   ```yaml
   config:
     hello-world:APP_PORT: "80"                                # internal port exposed by production image
     hello-world:CORE_STACK_NAME: your-org/portfolio-infra/dev
     hello-world:BUILD_PHASE_TARGET: development               # or production
   ```

3. Access:

   - If `DOMAIN_NAME=localhost` in the core dev stack:
     - `http://hello-world.localhost`
   - Otherwise:
     - `http://hello-world.<your-domain>`

### Prod deployment (attached to prod portfolio-infra)

1. Core prod stack:

   ```bash
   cd ../../infra
   pulumi stack select prod
   pulumi up
   ```

2. Hello-world prod stack:

   ```bash
   cd ../projects/hello-world-react/infra
   pulumi stack select prod || pulumi stack init prod
   pulumi up
   ```

   Configure:

   - `hello-world:CORE_STACK_NAME: your-org/portfolio-infra/prod`
   - `hello-world:APP_PORT: "80"` (or whatever your Nginx stage listens on)
   - `hello-world:BUILD_PHASE_TARGET: production`

3. Access: `https://hello-world.${DOMAIN_NAME}`.

---

## Standalone Pulumi infra (`infra-standalone/`)

The Pulumi project in  
[infra-standalone/Pulumi.yaml](infra-standalone/Pulumi.yaml) runs **only this app**, without Traefik or the portfolio-infra stack.

Config keys:

- `APP_PORT` – container internal port (default `3001`, matching Vite dev or your app)
- `HOST_PORT` – host port exposed (default `3001`)
- `BUILD_PHASE_TARGET` – Docker build target (`development` or `production`)

It:

- Builds the image from this project
- Runs a container with a direct `ports` mapping
- Exposes an `url` output (e.g. `http://localhost:3001`)

### Example (dev, standalone)

```bash
cd projects/hello-world-react/infra-standalone
pulumi stack select dev || pulumi stack init dev
pulumi up
```

Then open the URL from the Pulumi output (by default `http://localhost:3001`).

This is useful if you want to test or demo a project completely independently from the portfolio and Traefik.

---

## Using this as a template for new projects

To integrate a new project under the portfolio:

1. Copy this entire folder to `projects/my-app`.
2. Adjust:

   - App code (`src/`, `Dockerfile`, `vite.config.ts` or equivalent)
   - Pulumi project under `projects/my-app/infra`:

     - Rename stack `name` and Docker image name
     - Update Traefik labels (subdomain and router names)

3. Set `CORE_STACK_NAME` to your portfolio-infra stack (dev/prod).
4. Run `pulumi up` from `projects/my-app/infra` after the core stack is up.

You can also copy and adapt `infra-standalone/` if you need standalone deployments for that project.