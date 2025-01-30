FROM node:20.18.0 AS base

ARG WORKDIR_PATH

WORKDIR $WORKDIR_PATH

COPY package.json yarn.lock ./

RUN yarn add sharp --ignore-engines

RUN yarn install

COPY . .

# Development
FROM base AS development

ENV NODE_ENV=development

CMD ["yarn", "dev"]

# Production
FROM base AS production

ENV NODE_ENV=production

RUN yarn build

RUN yarn install --prod --ignore-engines

CMD ["yarn", "start"]