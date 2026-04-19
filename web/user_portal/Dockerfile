# ==============================================================================
# CABI AFRICA - USER PORTAL (Next.js SSR → Standalone Node.js)
# ==============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Check: Does Alpine have what we need?
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
COPY web/user_portal/package.json ./web/user_portal/
COPY libs/backend/database/prisma/ ./libs/backend/database/prisma/

# Install dependencies (ignoring scripts to prevent prisma generate failure)
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

# Build-time env vars
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

# Build from app directory to ensure standalone root is correctly detected
WORKDIR /app/web/user_portal
RUN npm run build

# Stage 3: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy Next.js standalone build output
# Note: Since we built from /app/web/user_portal, the standalone folder is at .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/static ./web/user_portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/public ./public

USER nextjs
EXPOSE 8080

# The build from subfolder usually flattens the root server.js to /app/server.js
CMD ["node", "server.js"]
