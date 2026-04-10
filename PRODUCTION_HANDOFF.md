# 🏁 Cabi Africa — Production Handoff Report

## 🌍 Production Environment Overview

### **Frontends (Vercel)**
| Application | Custom Domain | Vercel Project URL |
|:---|:---|:---|
| **User Portal** | [app.cabi.africa](https://app.cabi.africa) | [cabi-user-portal.vercel.app](https://cabi-user-portal.vercel.app) |
| **Admin Panel** | [admin.cabi.africa](https://admin.cabi.africa) | [cabi-admin-panel.vercel.app](https://cabi-admin-panel.vercel.app) |
| **Dispatch Panel** | [dispatch.cabi.africa](https://dispatch.cabi.africa) | [cabi-dispatch-panel.vercel.app](https://cabi-dispatch-panel.vercel.app) |

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
*   **Allowed Origins**: `*.cabi.africa`, `*.cabi-africa.com`, `*.run.app`, `*.vercel.app`.
*   **Security**: WebSocket gateways are locked down to production domains in `NODE_ENV=production`.

### **Database (Supabase)**
*   **Access**: Through GCP Secret Manager (Secrets: `DATABASE_URL`, `DIRECT_URL`).
*   **Hardening**: RLS is enabled on all business-critical tables with `service_role` full access for the backends.

---

## 📱 Mobile Applications

### **Driver App**
*   **Base URL**: `auth-gateway-746659778850.us-central1.run.app`
*   **Sockets**: Use `wss://` for secure production WebSocket communication.

### **Passenger App**
*   **Base URL**: `auth-gateway-746659778850.us-central1.run.app`

---

## 🚀 Post-Launch Maintenance

### **Adding Environment Variables**
*   **Frontends**: Update in the [Vercel Dashboard](https://vercel.com/ibnkes-projects).
*   **Backends**: Update using `gcloud secrets` or the GCP Console under "Secret Manager".

### **Triggering Builds**
*   **Web**: Push to the `main` branch.
*   **Mobile**: Run `flutter build apk --release` from the corresponding `mobile/` subfolder.

---
**Status**: 🟢 PRODUCTION-READY
**Author**: Antigravity AI
