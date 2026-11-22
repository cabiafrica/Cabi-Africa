# Cabi Africa — Production Release & Architecture Runbook

**Release Date:** November 22, 2026  
**Status:** 100% Live & Operational  
**Infrastructure Target:** DigitalOcean Droplet (`104.248.168.68`)  
**Database:** Supabase EU-West-1 (`pvpqeselzpzmxjoaopit`)  
**CI/CD Pipeline:** GitHub Actions (`deploy-production.yml`) with `appleboy/ssh-action`

---

## 1. Executive Summary

Cabi Africa has transitioned into complete live market launch. All customer-facing portals, real-time command dispatch consoles, administrative control planes, database migrations, and microservice APIs are operating on custom HTTPS subdomains with automated Let's Encrypt SSL certificates.

Continuous integration and continuous deployment (CI/CD) is fully automated: any commit pushed to branch `main` executes unit tests, performs Prisma database schema synchronization, connects to the production Droplet via SSH, rebuilds Docker containers, and validates health checks.

---

## 2. Production Domain Architecture

| Application | Public URL | Container Name | Internal Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Portal** | `https://cabi.africa` | `cabi_user_portal` | `8080` | HTTPS (HTTP/2) | Public landing page, booking engine, fleet showcase, captain APK downloads |
| **Web App** | `https://app.cabi.africa` | `cabi_user_portal` | `8080` | HTTPS (HTTP/2) | Direct web passenger application |
| **Super Admin** | `https://admin.cabi.africa` | `cabi_admin_panel` | `8081` | HTTPS (HTTP/2) | Operations control plane, RBAC, KYC verification, finance & SACCO ledger |
| **Dispatch Console** | `https://dispatch.cabi.africa` | `cabi_dispatch_panel` | `8082` | HTTPS (HTTP/2) | Real-time multi-screen command center, surge zones, driver management |
| **API Gateway** | `https://api.cabi.africa` | `cabi_auth_gateway` | `3030` | HTTPS (HTTP/2) | Unified authentication, passenger/captain endpoints, microservice routing |
| **Dispatch Microservice** | `cabi.africa/socket.io` | `cabi_dispatch` | `3334` | WSS / Socket.IO | Real-time GPS driver tracking, ride matching, emergency SOS gateway |
| **Verification Engine** | Internal IPC | `cabi_verification` | `3003` | TCP | Captain biometric and document OCR validation |
| **Reverse Proxy** | Ports 80 & 443 | `cabi_caddy` | `80`, `443` | Caddy 2 | Automated Let's Encrypt SSL, WebSocket upgrades, route proxying |
| **In-Memory Cache** | Port 6379 | `cabi_redis` | `6379` | Redis 7 | Geospatial driver indexing, rate limiting, pub/sub state |

---

## 3. Production Credentials & Secrets

- **Super Admin Account:** `mailtosamkaranja@gmail.com`
- **Initial Password:** `Admin@2026`
- **Permissions:** 102 active administrative permissions (`SUPER_ADMIN`)
- **Supabase Cloud Project:** `pvpqeselzpzmxjoaopit` (`eu-west-1`, owner: `ke.africabi@gmail.com`)
- **Droplet Host:** `104.248.168.68` (`ubuntu-s-2vcpu-4gb-lon1`)
- **Droplet User:** `root`
- **GitHub Repository:** `cabiafrica/Cabi-Africa`
- **CI/CD Deployment Secret:** `DROPLET_SSH_KEY` (4096-bit RSA PEM key)

---

## 4. Reverse Proxy & Routing Rules (`Caddyfile`)

Caddy handles SSL certificates and dynamic microservice routing:
- **`api.cabi.africa`:** Routes dispatch microservices (`/api/safety*`, `/api/dispatch*`, `/api/rides*`, `/api/wealth*`, `/api/corporate*`, `/api/lost-and-found*`, `/api/disputes*`, `/api/welfare*`, `/api/pricing*`, `/api/badges*`, `/api/commissions*`) directly to `dispatch-service:3334`. All auth and user management routes fall through to `auth-gateway:3030`.
- **`dispatch.cabi.africa`:** Serves the Vite React single page application, while proxying `/socket.io*` to `dispatch-service:3334` and `/api/*` to `auth-gateway:3030`.
- **`cabi.africa`:** Serves Next.js standalone User Portal on port `8080`, proxying real-time WebSockets (`/socket.io*`) to `dispatch-service:3334`.

---

## 5. Maintenance & Operational Procedures

### Automated Deployment
Pushes to `main` trigger `.github/workflows/deploy-production.yml`. Deployment status can be checked at:
`https://github.com/cabiafrica/Cabi-Africa/actions`

### Manual Deployment via Server Console
```bash
ssh root@104.248.168.68
cd /opt/cabi-africa
git pull origin main
docker compose up -d --build
docker compose restart caddy
```

### Inspect Container Health
```bash
docker compose ps
docker compose logs -f --tail=50 [service-name]
```

### Memory Management
The Ubuntu Droplet has an active 4GB persistent swap file (`/swapfile`), providing 8GB total virtual memory to prevent memory starvation during concurrent Next.js / NestJS builds.
