# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps

# Build args — baked into the frontend bundle
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_TRIP_TRACKING_NAMESPACE

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_TRIP_TRACKING_NAMESPACE=${VITE_TRIP_TRACKING_NAMESPACE}

# Build the application directly bypassing Nx to avoid internal exports issues
# Build the application using the hoisted node_modules
RUN npm run build -w dispatch-panel -- --emptyOutDir --outDir ../../dist/web/dispatch_panel

# Final stage — Nginx with dynamic backend URL substitution
FROM nginx:stable-alpine
RUN apk add --no-cache bash gettext

# Copy static build output
COPY --from=builder /app/dist/web/dispatch_panel /usr/share/nginx/html

# Copy nginx template (uses ${BACKEND_URL} placeholder)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Startup: envsubst replaces ${BACKEND_URL} then starts nginx
ENV BACKEND_URL=http://localhost:3333
CMD ["/bin/bash", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

EXPOSE 80
