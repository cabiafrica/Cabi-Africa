# ==============================================================================
# CABI AFRICA - USER PORTAL (Next.js SSR → Standalone Node.js)
# Build context: monorepo root (use -f web/user_portal/Dockerfile .)
# ==============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

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

# Build-time env vars (required for Next.js client-side injection)
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

# Generate Prisma client
RUN npx prisma generate --schema=libs/backend/database/prisma/schema.prisma

# Build Next.js (uses output: 'standalone' from next.config.js)
RUN npm run build -w user-portal

# Stage 3: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy Next.js standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/static ./web/user_portal/.next/static

USER nextjs
EXPOSE 8080

# Start the server with path-detection safety
CMD ["sh", "-c", "if [ -f web/user_portal/server.js ]; then node web/user_portal/server.js; elif [ -f server.js ]; then node server.js; else echo 'Error: server.js not found'; exit 1; fi"]
