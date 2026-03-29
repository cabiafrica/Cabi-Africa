# STAGE 1: Dependency Management
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# STAGE 2: Build the Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build time (if needed by Next.js)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Nx build for production
RUN npx prisma generate --schema=libs/backend/database/prisma/schema.prisma
RUN npx nx build user-portal --configuration=production

# STAGE 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add security user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy the standalone build from Nx output
# Next.js standalone outputs into the .next/standalone/ inside the build target
COPY --from=builder /app/dist/web/user_portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/dist/web/user_portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/web/user_portal/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Cloud Run uses the server.js produced by standalone mode
CMD ["node", "server.js"]
