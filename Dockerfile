# =============================================================================
# Multi-stage Production Dockerfile for SkillSwap
# =============================================================================

# --- Stage 1: Build & Bundle ---
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for pnpm support
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml patches* ./
COPY patches/ ./patches/

# Install all dependencies (including devDependencies required for Vite/esbuild)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Set production env during build
ENV NODE_ENV=production

# Compile client SPA and server bundle to /app/dist
RUN pnpm run build

# Prune devDependencies for a lean production runtime
RUN pnpm prune --prod

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: Create non-root user
USER node

# Copy built artifacts and production dependencies from builder
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Expose HTTP port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

# Start the optimized Node.js server
CMD ["node", "dist/index.js"]
