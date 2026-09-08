# Base image with security updates
FROM node:24-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ARG PORTFOLIO_WORKDIR_PATH
WORKDIR $PORTFOLIO_WORKDIR_PATH

# Copy package files first for better layer caching
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Development stage
FROM base AS development

ENV NODE_ENV=development

# postgresql-client for backup restore from the admin dashboard
RUN apk add --no-cache postgresql-client

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

CMD ["yarn", "dev"]

# Builder stage - builds the application
FROM base AS builder

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production dependencies only stage
FROM base AS prod-deps

ENV NODE_ENV=production

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Production runner stage - minimal image
FROM node:24-alpine AS production

# Install dumb-init for proper signal handling + postgresql-client for backup restore
RUN apk add --no-cache dumb-init postgresql-client

# Create non-root user for security.
# -G nodejs matters: without it adduser drops nextjs into gid 65533 (nogroup),
# which is why the shared /backups volume previously needed chmod 777 for the
# admin dashboard to write to it. With a real group, 775 is enough.
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

ARG PORTFOLIO_WORKDIR_PATH
WORKDIR $PORTFOLIO_WORKDIR_PATH

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# package.json is required for `yarn start` to resolve the "start" script;
# next.config.mjs is read at runtime (e.g. by the /_next/image route), not
# just baked into .next at build time, so it must ship in the image too.
COPY --from=builder --chown=nextjs:nodejs $PORTFOLIO_WORKDIR_PATH/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs $PORTFOLIO_WORKDIR_PATH/next.config.mjs ./next.config.mjs

# Copy production dependencies
COPY --from=prod-deps --chown=nextjs:nodejs $PORTFOLIO_WORKDIR_PATH/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs $PORTFOLIO_WORKDIR_PATH/public ./public
COPY --from=builder --chown=nextjs:nodejs $PORTFOLIO_WORKDIR_PATH/.next ./.next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["yarn", "start"]