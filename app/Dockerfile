FROM node:20.18.0 AS base

ARG WORKDIR_PATH
WORKDIR $WORKDIR_PATH

RUN useradd --create-home --shell /bin/bash appuser

COPY package.json yarn.lock ./

RUN chown -R appuser:appuser $WORKDIR_PATH

USER appuser

RUN yarn add sharp --ignore-engines

RUN yarn install

COPY . .

USER root

RUN chown -R appuser:appuser $WORKDIR_PATH

USER appuser

# Development Stage
FROM base AS development

ENV NODE_ENV=development

CMD ["yarn", "dev"]

# Production Stage
FROM base AS production

ENV NODE_ENV=production

USER appuser

RUN yarn install --prod --ignore-engines

RUN yarn build

CMD ["yarn", "start"]
