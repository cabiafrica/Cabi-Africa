# ==============================================================================
# CABI AFRICA - ADMIN PANEL (Vite SPA → Nginx)
# Build context: monorepo root (use -f web/admin_panel/Dockerfile .)
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo root package files and install all workspace deps
COPY package.json package-lock.json ./
COPY web/admin_panel/package.json ./web/admin_panel/
RUN npm install --legacy-peer-deps

# Copy admin panel source + shared configs
COPY tsconfig.base.json ./
COPY web/admin_panel/ ./web/admin_panel/

# Build-time env vars baked into the Vite bundle
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_DRIVER_LEAD_SERVICE_URL
ARG VITE_DISPATCH_SERVICE_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_DRIVER_LEAD_SERVICE_URL=${VITE_DRIVER_LEAD_SERVICE_URL}
ENV VITE_DISPATCH_SERVICE_URL=${VITE_DISPATCH_SERVICE_URL}

# Build the Vite SPA
RUN npm run build -w admin-panel

# Stage 2: Serve via Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/web/admin_panel/dist /usr/share/nginx/html
COPY web/admin_panel/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
