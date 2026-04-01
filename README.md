# Cabi Africa

**Ride-Hailing Platform | Monorepo Architecture**

---

## ⚡ **NEW: Performance Optimized (85-90% Faster!)**

This project has been optimized for **maximum performance**:

- ✅ **Dev servers** start in 5-10 seconds (was 30-60s)
- ✅ **Production builds** complete in 1-2 minutes (was 5-10 min)
- ✅ **Database queries** 70% faster
- ✅ **Git operations** are instant
- ✅ **TypeScript compilation** 70% faster

**👉 See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for commands and usage**  
**👉 See [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md) for details**

---

## 🚀 Quick Start

```powershell
# Install dependencies (we use npm)
npm install

# Start Admin Panel
cd web/admin_panel
npm run dev  # Opens at http://localhost:3001

# Start Dispatch Panel
cd web/dispatch_panel
npm run dev  # Opens at http://localhost:3002

# Start User Portal  
cd web/user_portal
npm run dev  # Opens at http://localhost:3000
```

---

## 📁 Project Structure

```
/
├── backend/          # Backend services (NestJS)
├── libs/             # Shared libraries & utilities
│   └── backend/database/src/prisma.config.ts  # ⚡ Optimized Prisma client
├── mobile/           # Mobile applications (Flutter)
│   ├── driver_app/       # Driver app
│   └── passenger_app/    # Passenger app
├── web/              # Web applications
│   ├── admin_panel/      # Admin dashboard (Vite + React)
│   ├── dispatch_panel/   # Dispatcher tools (Vite + React)
│   └── user_portal/      # User portal (Next.js)
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

**File Placement:** All files should be saved in their logically appropriate directories within this structure.

---

## 🛠️ Tech Stack

### Frontend:
- **Admin Panel:** Vite + React + Material-UI
- **Dispatch Panel:** Vite + React + Socket.io
- **User Portal:** Next.js + React

### Backend:
- **Framework:** NestJS
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma (with optimizations)
- **Real-time:** Socket.io

### Mobile:
- **Framework:** Flutter
- **Platform:** iOS & Android

### Build System:
- **Nx:** Parallel builds, caching, task orchestration

---

## 📚 Key Documentation

### Getting Started:
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands, usage examples, troubleshooting
- **[.env.example](.env.example)** - Environment setup guide

### Performance:
- **[OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)** - Performance improvements overview
- **[PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md)** - Technical deep dive

### Architecture:
- **[SOURCE_TREE.md](docs/architecture/SOURCE_TREE.md)** - Detailed project structure
- **[Templates](docs/templates)** - Code generation templates

---

## 🗄️ Database

We use **optimized Prisma** for database queries:

```typescript
// Import the optimized client
import { optimizedPrisma, paginatedQuery } 
  from '@cabi/backend/database/prisma.config';

// Auto-limited queries (prevents full table scans)
const users = await optimizedPrisma.user.findMany({
  where: { role: 'DRIVER' }
});

// Use pagination for better UX
const result = await paginatedQuery(prisma.user, {
  page: 1,
  pageSize: 20
});
```

---

## 🏗️ Building for Production

```powershell
# Build all projects in parallel (fast!)
npx nx run-many --target=build --projects=admin-panel,dispatch-panel,user-portal --parallel=3

# Build single project
npx nx build admin-panel
```

---

## 🐛 Common Issues

### Dev server slow?
```powershell
# Clear Vite cache
rm -rf web/admin_panel/node_modules/.vite
npm run dev
```

### Module not found?
```powershell
rm -rf node_modules
npm install
```

### More help?
See [QUICK_REFERENCE.md](QUICK_REFERENCE.md#-common-issues--solutions)

---

## 👥 Team Resources

- **Onboarding Guide:** See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Code Standards:** See [docs/templates](docs/templates)
- **Performance Guide:** See [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)

---

## 📊 Performance Stats

**After optimization (2026-01-16):**
- File operations: 90% faster ⚡
- Dev server startup: 85% faster ⚡
- Production builds: 85% faster ⚡
- Database queries: 70% faster ⚡
- TypeScript compilation: 70% faster ⚡

---

## 🚀 Launch Preparation

**Ready to go live?** Prepare your project for production launch:

### Quick Launch Commands:
```bash
# Prepare for launch (clean all test data, keep only Super Admin)
npm run launch:prepare

# List all users in database
npm run launch:list-users

# Recreate Super Admin
npm run admin:recreate

# Verify Super Admin setup
npm run admin:verify
```

### Launch Documentation:
- **[QUICK_LAUNCH_GUIDE.md](QUICK_LAUNCH_GUIDE.md)** - Quick start guide
- **[LAUNCH_PREPARATION_SUMMARY.md](LAUNCH_PREPARATION_SUMMARY.md)** - Detailed preparation guide
- **[LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)** - Complete pre-launch checklist
- **[ADMIN_LOGIN_REFERENCE.md](ADMIN_LOGIN_REFERENCE.md)** - Super Admin credentials

### What Launch Preparation Does:
- ✅ Removes all test/demo data
- ✅ Cleans all user accounts except Super Admin
- ✅ Resets all rides, bookings, and occurrences
- ✅ Preserves RBAC roles and permissions
- ✅ Recreates Super Admin with fresh credentials

**Default Super Admin Credentials:**
```
Email:    ithrivebusinessnetworks@gmail.com
Password: Admin@2026
Username: superadmin
```

⚠️ **IMPORTANT:** Change the password immediately after first login!

---

## ☁️ Production Architecture (GCP)

The platform is architected for **Google Cloud Platform (GCP)** using a serverless microservices pattern:

### 🏗️ Service Ecosystem
- **Backends (6):** `auth-gateway`, `verification`, `referral`, `sacco`, `dispatch`, `driver-leads` (Cloud Run)
- **Frontends (3):** `admin-panel`, `dispatch-panel`, `user-portal` (Next.js/Vite on Cloud Run)
- **Database:** Supabase PostgreSQL (Managed)
- **CI/CD:** Google Cloud Build (Multistage Pipeline)

### 🚀 Deployment Command
The entire stack can be launched via our master CI/CD pipeline:
```bash
# Deploys Backend -> Discovers URLs -> Bakes URL to Frontend -> Deploys Frontend
gcloud builds submit --config cloudbuild.yaml .
```

### 📚 Production Documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & internal data flow
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Environment variables & GCP setup
- **[_docs_archive/](_docs_archive/)** - Historic test results & optimization logs

---

**Built with ❤️ for East Africa | Cabi Africa Engineering**