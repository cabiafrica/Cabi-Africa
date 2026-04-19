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
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x"

# Generate Prisma
RUN npx prisma generate --schema=libs/backend/database/prisma/schema.prisma

# Build FROM THE ROOT to preserve monorepo paths in standalone
RUN npm run build -w user-portal

# Stage 3: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone output (this includes node_modules and the web/user_portal/server.js)
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/static ./web/user_portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/public ./public

USER nextjs
EXPOSE 8080

# Ensure Prisma binaries are built for Alpine
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x"

# ... (other env vars) ...

# Discovery-based CMD to handle variable standalone pathing in monorepos
CMD ["sh", "-c", "SERVER=$(find . -name 'server.js' | head -n 1); if [ -n \"$SERVER\" ]; then echo \"Starting Next.js standalone at $SERVER\"; node \"$SERVER\"; else echo \"Error: server.js not found\"; exit 1; fi"]
