# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY web/admin_panel/package*.json ./web/admin_panel/
COPY web/dispatch_panel/package*.json ./web/dispatch_panel/
COPY web/user_portal/package*.json ./web/user_portal/
COPY backend/content-service/package*.json ./backend/content-service/
COPY backend/dispatch-service/package*.json ./backend/dispatch-service/
COPY backend/driver-lead-service/package*.json ./backend/driver-lead-service/
COPY backend/referral-service/package*.json ./backend/referral-service/
COPY backend/sacco-service/package*.json ./backend/sacco-service/
COPY backend/verification-service/package*.json ./backend/verification-service/
COPY libs/backend/mpesa-service/package*.json ./libs/backend/mpesa-service/
COPY libs/backend/payment-service/package*.json ./libs/backend/payment-service/
COPY libs/backend/sacco-service/package*.json ./libs/backend/sacco-service/
RUN npm install --legacy-peer-deps
COPY . .

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
