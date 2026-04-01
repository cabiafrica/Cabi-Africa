# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
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

RUN npm run build

# Final stage - using Nginx to serve static files
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Use the custom nginx config from the parent directory (passed during build context)
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
