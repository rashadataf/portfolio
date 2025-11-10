FROM node:20.18.0 AS base

# Use absolute path for WORKDIR to avoid issues
WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install all dependencies including sharp
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Development stage
FROM base AS development

ENV NODE_ENV=development

EXPOSE 3000

CMD ["yarn", "dev"]

# Build stage
FROM base AS build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# Production stage
FROM node:20.18.0-slim AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/yarn.lock ./yarn.lock

# Copy standalone output if using standalone mode, otherwise copy .next
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Install only production dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Use non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]