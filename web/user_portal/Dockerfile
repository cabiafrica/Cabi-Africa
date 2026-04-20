# ==============================================================================
# CABI AFRICA - USER PORTAL (Next.js SSR → Standalone Node.js)
# ==============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
COPY web/user_portal/package.json ./web/user_portal/
COPY libs/backend/database/prisma/ ./libs/backend/database/prisma/

RUN npm install --legacy-peer-deps --ignore-scripts

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/user_portal/node_modules ./web/user_portal/node_modules

# Copy source
COPY package.json ./
COPY tsconfig.base.json ./
COPY web/user_portal/ ./web/user_portal/
COPY libs/ ./libs/

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time env signature
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DRIVER_LEAD_SERVICE_URL
ARG NEXT_PUBLIC_DISPATCH_SERVICE_URL
ARG NEXT_PUBLIC_SACCO_SERVICE_URL
ARG NEXT_PUBLIC_REFERRAL_SERVICE_URL
ARG NEXT_PUBLIC_SOCKET_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_DRIVER_LEAD_SERVICE_URL=${NEXT_PUBLIC_DRIVER_LEAD_SERVICE_URL}
ENV NEXT_PUBLIC_DISPATCH_SERVICE_URL=${NEXT_PUBLIC_DISPATCH_SERVICE_URL}
ENV NEXT_PUBLIC_SACCO_SERVICE_URL=${NEXT_PUBLIC_SACCO_SERVICE_URL}
ENV NEXT_PUBLIC_REFERRAL_SERVICE_URL=${NEXT_PUBLIC_REFERRAL_SERVICE_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}

# Generate Prisma explicitly in the builder stage where all libs are present
RUN npx prisma generate --schema=libs/backend/database/prisma/schema.prisma

# Build FROM THE ROOT to preserve monorepo paths in standalone
RUN npm run build -w user-portal
# Diagnostic: List files to find server.js
RUN ls -R web/user_portal/.next/standalone

# Stage 3: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy the entire standalone output
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/standalone ./
# Standard Next.js standalone expects static and public in their original sub-paths
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/static ./web/user_portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/public ./web/user_portal/public

USER nextjs
EXPOSE 8080

# In Next.js monorepos, the standalone entry point (server.js) location can vary.
# This script finds the server.js file, moves to its directory (important for relative paths), and starts it.
CMD ["sh", "-c", "SERVER_PATH=$(find . -name server.js | head -n 1); if [ -z \"$SERVER_PATH\" ]; then echo 'FATAL: server.js not found in /app'; ls -R /app; exit 1; fi; SERVER_DIR=$(dirname \"$SERVER_PATH\"); cd \"$SERVER_DIR\"; echo \"Auto-detected server.js at: $SERVER_PATH. Starting from $SERVER_DIR...\"; node server.js"]
