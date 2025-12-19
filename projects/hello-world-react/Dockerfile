FROM node:20.18.0-alpine AS base
WORKDIR /app
COPY package.json ./
COPY yarn.lock* ./
RUN yarn install

COPY . .

# Development
FROM base AS development
ENV NODE_ENV=development
CMD ["yarn", "dev", "--host"]

# Builder (Builds the static files)
FROM base AS builder
ENV NODE_ENV=production
RUN yarn build

# Production (Serves the static files with Nginx)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]