# STAGE 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps

# STAGE 2: Build the Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time environment variables (required for Next.js client-side injection)
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

# Build the Next.js app via Nx
# Build the Next.js app directly bypassing Nx
# Build the Next.js app using the hoisted node_modules
RUN npm run build -w user-portal

# STAGE 3: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone build lives in dist/web/user_portal/.next/standalone
# when using Nx + next output:standalone
# Next.js standalone build from native location
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/user_portal/.next/static ./web/user_portal/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
