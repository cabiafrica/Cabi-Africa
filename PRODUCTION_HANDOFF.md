# 🏁 Cabi Africa — Production Handoff Report

## 🌍 Production Environment Overview

### **Frontends (GCP Cloud Run)**
| Application | Custom Domain | Cloud Run Service |
|:---|:---|:---|
| **User Portal** | [app.cabi.africa](https://app.cabi.africa) | `user-portal` (us-central1) |
| **Admin Panel** | [admin.cabi.africa](https://admin.cabi.africa) | `admin-panel` (us-central1) |
| **Dispatch Panel** | [dispatch.cabi.africa](https://dispatch.cabi.africa) | `dispatch-panel` (us-central1) |

### **Backends (GCP Cloud Run)**
| Service | Production API URL |
|:---|:---|
| **Auth Gateway** | `https://auth-gateway-746659778850.us-central1.run.app/api` |
| **Dispatch Service** | `https://dispatch-service-746659778850.us-central1.run.app/api` |
| **Referral Service** | `https://referral-service-746659778850.us-central1.run.app/api` |
| **Verification Service** | `https://verification-service-746659778850.us-central1.run.app/api/v1/verification` |
| **Sacco Service** | `https://sacco-service-746659778850.us-central1.run.app/api` |
| **Driver Lead Service** | `https://driver-lead-service-746659778850.us-central1.run.app/api` |

---

## 🔒 Security & Connectivity

### **CORS Policy**
*   **Allowed Origins**: `*.cabi.africa`, `*.cabi-africa.com`, `*.run.app`.
*   **Security**: WebSocket gateways are locked down to production domains in `NODE_ENV=production`.

### **Database (Supabase)**
*   **Access**: Through GCP Secret Manager (Secrets: `DATABASE_URL`, `DIRECT_URL`).
*   **Hardening**: RLS is enabled on all business-critical tables with `service_role` full access for the backends.

---

## 📱 Mobile Applications

### **Driver App (`africa.cabi.driver`)**
*   **Base API URL**: `https://www.cabi.africa/api` (with automatic Cloud Run proxy + Supabase Prisma fallback)
*   **Android Direct APK**: `https://www.cabi.africa/downloads/Cabi-Drive-Official.apk` (built & published via `.github/workflows/release_passenger_apk.yml`)
*   **iOS / iPhone PWA**: `https://www.cabi.africa/apps/driver/index.html` (Safari → Share → Add to Home Screen)
*   **Sockets**: Use `wss://` for secure production WebSocket communication.

### **Passenger App (`africa.cabi.passenger`)**
*   **Base API URL**: `https://www.cabi.africa/api` (with automatic Cloud Run proxy + Supabase Prisma fallback)
*   **Android Direct APK**: `https://www.cabi.africa/downloads/Cabi-Go-Official.apk`
*   **iOS / iPhone PWA**: `https://www.cabi.africa/apps/passenger/index.html` (Safari → Share → Add to Home Screen)

---

## 🚀 Post-Launch Maintenance

### **Adding Environment Variables**
*   **All Services**: Update using `gcloud run services update <service> --set-env-vars=KEY=VALUE --region=us-central1` or the GCP Console.
*   **Secrets**: Manage via GCP Secret Manager (`gcloud secrets`).
*   **Frontend Build-time**: For `VITE_*` or `NEXT_PUBLIC_*` variables, update the `--build-arg` values in `cloudbuild.yaml` and redeploy.

### **Triggering Builds**
*   **Web + Backend**: Push to the `main` branch triggers Cloud Build via GitHub Actions.
*   **Mobile**: Run `npm run mobile:build:prod` (or `flutter build apk --release --dart-define=IS_PRODUCTION=true` / `flutter build appbundle --release --dart-define=IS_PRODUCTION=true` from the app directory). Outputs are saved to `dist/mobile/`.

### **Custom Domain Mapping** (One-time setup)
```bash
# Map custom domains to Cloud Run services
gcloud run domain-mappings create --service=admin-panel --domain=admin.cabi.africa --region=us-central1
gcloud run domain-mappings create --service=dispatch-panel --domain=dispatch.cabi.africa --region=us-central1
gcloud run domain-mappings create --service=user-portal --domain=app.cabi.africa --region=us-central1
```

---

## 🏗️ System Architecture & Data Integrity

### **Zero-State Philosophy**
*   **Market Ready**: The platform operates under a strict **Zero-State Philosophy**. The system has been purged of mock data generators and will display `0` or empty UI states natively when no data exists. 
*   **Future Development**: All future front-end iterations and implementations **must** gracefully handle empty API responses without relying on statically injected mock data or fallbacks.

### **CI/CD Pipeline Details**
*   **Platform**: All services (backends + frontends) deploy to **GCP Cloud Run** via **Cloud Build**, triggered by GitHub Actions on push to `main`.
*   **Dependency Sync**: The monorepo uses `npm install --legacy-peer-deps` within the GitHub Action to account for package incompatibilities.
*   **Quality Checks**: Target linting configurations (`@nx/eslint:lint`) are attached across web components (`admin-panel`, `dispatch-panel`, `user-portal`) to block deployments on failing code.
*   **Frontend Builds**: Admin & Dispatch panels build as Vite SPAs served via Nginx. User Portal builds as a Next.js standalone Node.js server.

---
**Status**: 🟢 PRODUCTION-READY
**Author**: Antigravity AI
