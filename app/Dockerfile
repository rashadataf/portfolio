FROM node:20.18.0 AS base

ARG WORKDIR_PATH
WORKDIR $WORKDIR_PATH

# Create a non-root user
RUN useradd --create-home --shell /bin/bash appuser

COPY package.json yarn.lock ./

# Change ownership before switching users
RUN chown -R appuser:appuser $WORKDIR_PATH

USER appuser  # Switch to non-root user early

RUN yarn add sharp --ignore-engines
RUN yarn install

COPY . .

# Ensure all project files are owned by appuser (including .next, node_modules, public, uploads)
USER root  # Temporarily switch back to root to set permissions
RUN chown -R appuser:appuser $WORKDIR_PATH

USER appuser  # Switch back to appuser

# Development Stage
FROM base AS development

ENV NODE_ENV=development

CMD ["yarn", "dev"]

# Production Stage
FROM base AS production

ENV NODE_ENV=production

USER appuser  # Ensure we install dependencies as non-root!

RUN yarn install --prod --ignore-engines
RUN yarn build

CMD ["yarn", "start"]
