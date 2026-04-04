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

# Build args for production URLs
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_DRIVER_LEAD_SERVICE_URL
ARG VITE_DISPATCH_SERVICE_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_DRIVER_LEAD_SERVICE_URL=${VITE_DRIVER_LEAD_SERVICE_URL}
ENV VITE_DISPATCH_SERVICE_URL=${VITE_DISPATCH_SERVICE_URL}

# Build the application directly bypassing Nx to avoid internal exports issues
# Build the application using the hoisted node_modules
RUN npm run build -w admin-panel -- --emptyOutDir --outDir ../../dist/web/admin_panel

# Final stage - using Nginx to serve static files
FROM nginx:stable-alpine
COPY --from=builder /app/dist/web/admin_panel /usr/share/nginx/html
# Use the custom nginx config from the parent directory (passed during build context)
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
