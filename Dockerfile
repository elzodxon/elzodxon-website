# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production
FROM node:18-alpine AS production

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001

WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxt:nodejs /app/package.json ./package.json

# Copy content and server data directories (local content storage)
COPY --chown=nuxt:nodejs content ./content
COPY --chown=nuxt:nodejs server/data ./server/data

# Switch to non-root user
USER nuxt

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", ".output/server/index.mjs"]
