# ==============================================================================
# CABI AFRICA - DISPATCH PANEL (Vite SPA → Nginx)
# Build context: monorepo root (use -f web/dispatch_panel/Dockerfile .)
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo root package files and install all workspace deps
COPY package.json package-lock.json ./
COPY web/dispatch_panel/package.json ./web/dispatch_panel/
RUN npm install --legacy-peer-deps

# Copy dispatch panel source + shared configs
COPY tsconfig.base.json ./
COPY web/dispatch_panel/ ./web/dispatch_panel/

# Build-time env vars baked into the Vite bundle
ARG VITE_API_URL
ARG VITE_AUTH_API_URL
ARG VITE_SOCKET_URL
ARG VITE_TRIP_TRACKING_NAMESPACE

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_API_URL=${VITE_AUTH_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_TRIP_TRACKING_NAMESPACE=${VITE_TRIP_TRACKING_NAMESPACE}

# Build the Vite SPA (skip tsc for Docker builds — CI handles type-checking)
RUN cd web/dispatch_panel && npx vite build

# Stage 2: Serve via Nginx with dynamic backend URL
FROM nginx:stable-alpine
RUN apk add --no-cache bash gettext

COPY --from=builder /app/web/dispatch_panel/dist /usr/share/nginx/html
COPY web/dispatch_panel/nginx.conf /etc/nginx/templates/default.conf.template

# Default backend URL — overridden by Cloud Run env vars
ENV BACKEND_URL=https://auth-gateway-746659778850.us-central1.run.app

# envsubst replaces ${BACKEND_URL} in the nginx template, then starts nginx
CMD ["/bin/bash", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

EXPOSE 8080
