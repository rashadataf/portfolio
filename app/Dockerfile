FROM node:20.18.0 AS base

ARG PORTFOLIO_WORKDIR_PATH

WORKDIR $PORTFOLIO_WORKDIR_PATH

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

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