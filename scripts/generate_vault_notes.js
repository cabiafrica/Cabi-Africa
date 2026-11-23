const fs = require('fs');
const path = require('path');

const VAULT_DIR = process.env.VAULT_DIR || (process.platform === 'win32' ? 'D:/IBN/iBN-Cabi Vault' : path.resolve(__dirname, '..', '..', 'iBN-Cabi Vault'));
const ENG_DIR = path.join(VAULT_DIR, '01-System Architecture & Engineering');

if (!fs.existsSync(ENG_DIR)) {
  fs.mkdirSync(ENG_DIR, { recursive: true });
}

// -------------------------------------------------------------
// 1. MOC — Engineering & Codebase Hub.md
// -------------------------------------------------------------
const mocContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: map-of-content
created: 2026-09-19
updated: 2026-09-19
tags:
  - project/cabi
  - engineering/moc
  - status/production-ready
aliases:
  - Engineering Hub
  - Cabi Tech Hub
  - Codebase MOC
---

# 🗺️ MOC — Engineering & Codebase Hub

> **System Overview:** High-scale, multi-platform ride-hailing & driver empowerment ecosystem built specifically for the East African transport sector. Managed as an enterprise **Nx Monorepo** powering **NestJS Microservices**, **Flutter iOS/Android clients**, **Next.js & Vite web portals**, and an **NTSA/ODPC-compliant driver SACCO financial engine**.

---

## 📌 Master Architecture Index

\`\`\`mermaid
graph TD
    subgraph "Clients Layer"
        GO["📱 [[Mobile Applications — CABI Go & CABI Drive#CABI Go Passenger App|CABI Go (Passenger)]]"]
        DRIVE["📱 [[Mobile Applications — CABI Go & CABI Drive#CABI Drive Driver App|CABI Drive (Driver)]]"]
        ADM["💻 [[Web Applications — Admin, Dispatch & User Portals#1 Admin Panel|Admin Dashboard]]"]
        DSP["📡 [[Web Applications — Admin, Dispatch & User Portals#2 Dispatch Panel|Dispatch Center]]"]
        USR["🌐 [[Web Applications — Admin, Dispatch & User Portals#3 User Portal|User & Driver Web Portal]]"]
    end

    subgraph "Gateway & Microservices Layer"
        GW["🛡️ [[Backend — Microservices Catalog#1 Auth Gateway|Auth Gateway (Port 3333 / 8080)]]"]
        SACCO["🤝 [[SACCO & Financial Integration Engine|SACCO & Welfare Service]]"]
        DISP["⚡ [[Backend — Microservices Catalog#3 Dispatch Service|Dispatch & Geolocation Service]]"]
        LEAD["🎯 [[Backend — Microservices Catalog#4 Driver Lead Service|Driver Lead & Onboarding Service]]"]
        REF["🌳 [[Backend — Microservices Catalog#5 Referral & MLM Service|Referral & Commission Service]]"]
        VERIF["🔍 [[Backend — Microservices Catalog#6 Verification Service|Verification & Biometric Service]]"]
    end

    subgraph "Persistence Layer"
        DB[("🗄️ [[Database — Prisma Models & Ledger Schema|PostgreSQL (Supabase)]]")]
        REDIS["⚡ Redis (Geo Radius & Cache)"]
        S3["📦 Supabase Storage (KYC Documents)"]
    end

    GO & DRIVE & ADM & DSP & USR --> GW
    GW --> SACCO & DISP & LEAD & REF & VERIF
    SACCO & DISP & LEAD & REF & VERIF --> DB
    DISP --> REDIS
\`\`\`

---

## 📚 Technical Knowledge Graph

### 1. [[Architecture — Monorepo & System Design]]
* **Nx Monorepo Topology:** Workspace configuration (\`nx.json\`, \`package.json\`), project graph, target caching, shared dependency graph.
* **Microservices Design:** Decoupled NestJS microservices communicating over REST APIs and WebSockets.
* **GCP Cloud Run Infrastructure:** Serverless container deployment model, regional setup (\`us-central1\`), autoscaling configurations.
* **Security Perimeter:** CORS whitelisting, JWT asymmetric token rotation, rate limiting, and RBAC guards.

### 2. [[Backend — Microservices Catalog]]
* **Auth Gateway (\`auth-gateway\`):** Central authentication, OTP validation (Email & SMS), Two-Factor Authentication (2FA/TOTP), Swagger documentation.
* **SACCO Service (\`backend/sacco-service\`):** Cooperative onboarding, welfare deductions, credit partner integrations.
* **Dispatch Service (\`backend/dispatch-service\`):** Spatial driver matching within 3km radius, Redis caching, real-time WebSocket ride-matching pipeline.
* **Driver Lead Service (\`backend/driver-lead-service\`):** Driver acquisition pipeline, funnel analytics, onboarding stage transitions.
* **Referral & MLM Service (\`backend/referral-service\`):** Sponsor trees, multi-level commission payouts, platform ledger splits.
* **Verification Service (\`backend/verification-service\`):** National ID, DL, NTSA PSV checks, facial biometrics matching.

### 3. [[Database — Prisma Models & Ledger Schema]]
* **Prisma Schema Architecture:** PostgreSQL with Supabase pooling (\`DATABASE_URL\`) and direct migrations (\`DIRECT_URL\`).
* **Identity & Roles:** \`User\`, \`Role\`, \`UserRole\`, \`UserPermission\`, \`LoginHistory\`.
* **Driver & Fleet Management:** \`DriverProfile\`, \`Vehicle\`, \`FleetManager\`, \`driver_groups\`, \`organizations\`.
* **Rides & Safety Incidents:** \`Ride\`, \`RideStop\`, \`Occurrence\`, \`OccurrenceObjection\`, \`OccurrenceAuditLog\`.
* **Financial Ledgers:** \`TransactionLedger\`, \`CommissionLedger\`, \`SaccoLedger\`, \`WelfareDeduction\`.

### 4. [[SACCO & Financial Integration Engine]]
* **Institutional Partners:** \`SaccoPartner\` model for Banks, SACCOs, and Microfinance lenders.
* **Driver Financial Consent:** Granular, ODPC-compliant financial data-sharing consent engine (\`DriverFinancialConsent\`).
* **Welfare Deduction Rules:** Dynamic deduction engines (\`WelfareScheme\`, \`WelfareEnrollment\`, \`FinancialIncentiveRule\`).
* **Admin Integration Hub:** Full UI control via \`SaccoIntegrationHub.tsx\` on the Admin Panel.

### 5. [[Web Applications — Admin, Dispatch & User Portals]]
* **Admin Dashboard (\`web/admin_panel\`):** Vite SPA + React 18 + Tailwind v4 + Tremor/MUI. Complete oversight of KYC, occurrences, fare rules, and SACCO accounts.
* **Dispatch Panel (\`web/dispatch_panel\`):** Live Leaflet driver tracking, active trip interception, and emergency dispatch console.
* **User Portal (\`web/user_portal\`):** Next.js 14 App Router, passenger web-booking, responsive driver registration funnel, blog & marketing pages.

### 6. [[Mobile Applications — CABI Go & CABI Drive]]
* **Framework:** Flutter (Dart 3.x) with Riverpod distributed state management.
* **CABI Go (Passenger App):** Dynamic map booking, real-time vehicle movement, passenger verification badges, safety toolkit (SOS, ride sharing).
* **CABI Drive (Driver App):** Turn-by-turn navigation, trip acceptance modal with pickup/dropoff previews, daily earnings ledger, SACCO savings toggle.
* **Build & Release Pipelines:** PowerShell automation (\`scripts/build-mobile-release.ps1\`), Shorebird OTA update capabilities.

### 7. [[DevOps, Security & Deployment Runbook]]
* **Cloud Build CI/CD:** Parallel multi-stage Docker builds with \`cloudbuild.yaml\`.
* **Production Environment:** Secret Manager bindings for \`DATABASE_URL\`, \`JWT_SECRET\`, \`DIRECT_URL\`.
* **Regulatory Compliance:** NTSA TNO data retention & ODPC user privacy controls.
* **Observability & Diagnostics:** Sentry error monitoring, structured Winston logging, database connection health checks.

---

## 🔗 Cross-Links to Business & Strategy Vault Notes
* [[CABi Africa — Master Index]] ← Strategic vision, pitch decks, and unit economics.
* [[Driver Welfare & SACCO]] ← Strategic policy on cooperative benefits & loan guarantees.
* [[Tech Architecture & Mobile Apps]] ← High-level product requirements and tech stack overview.
* [[Financial Projections & Models]] ← Revenue share models, unit economics, and 24-month horizon.
* [[NTSA Compliance Roadmap]] ← Transport Network Operator (TNO) legal clearance.
`;

fs.writeFileSync(path.join(ENG_DIR, 'MOC — Engineering & Codebase Hub.md'), mocContent, 'utf8');
console.log('Created: MOC — Engineering & Codebase Hub.md');

// -------------------------------------------------------------
// 2. Architecture — Monorepo & System Design.md
// -------------------------------------------------------------
const archContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: system-architecture
created: 2026-09-19
tags:
  - project/cabi
  - engineering/architecture
  - architecture/monorepo
  - architecture/cloud-run
aliases:
  - Monorepo Architecture
  - System Design
---

# 🏗️ Architecture — Monorepo & System Design

> **Core Philosophy:** Cabi Africa solves the dual challenges of high-volume ride-hailing and strict regional transport regulations by leveraging an enterprise **Nx Monorepo**. This enables type-safe code sharing between microservices, centralized data governance, and rapid deployment of web and mobile clients.

---

## 🏛️ Monorepo Topology (Nx Workspace)

The repository root is managed via \`cabi-monorepo\` using **Nx** with npm workspaces:

\`\`\`
Cabi Africa/
├── auth-gateway/             # Central Security & JWT Gateway (Port 3333 / 8080)
├── backend/                  # NestJS Microservices
│   ├── dispatch-service/     # Trip matching & Redis spatial engine (Port 3335)
│   ├── driver-lead-service/  # Driver acquisition & funnel analytics (Port 3336)
│   ├── referral-service/     # Sponsor tree & MLM commission engine (Port 3337)
│   ├── sacco-service/        # SACCO integration & welfare deductions (Port 3338)
│   └── verification-service/ # Document KYC & facial biometrics (Port 3334)
├── web/                      # Web Applications & Portals
│   ├── admin_panel/          # Vite + React 18 Admin Dashboard
│   ├── dispatch_panel/       # Vite + React 18 Real-time Dispatch Map
│   └── user_portal/          # Next.js 14 App Router User/Marketing Portal
├── mobile/                   # Flutter Multiplatform Clients
│   ├── passenger_app/        # CABI Go (Dart 3.x / Riverpod)
│   └── driver_app/           # CABI Drive (Dart 3.x / Riverpod)
├── libs/                     # Shared Business Logic & Domain Libraries
│   ├── backend/              # NestJS Domain Modules (database, rbac, cache, mpesa, etc.)
│   ├── core_auth/            # Shared client auth interfaces & tokens
│   ├── core_location/        # GPS & coordinate calculations
│   └── cabi_maps/            # Map rendering & routing components
└── cloudbuild.yaml           # Automated Google Cloud Run CI/CD Pipeline
\`\`\`

### Key Monorepo Capabilities
1. **Parallel Execution:** \`npm run build:backend\` runs builds in parallel with intelligent dependency graph caching.
2. **Atomic Schema Updates:** Changes in \`libs/backend/database/prisma/schema.prisma\` immediately reflect across all backend microservices upon running \`prisma generate\`.
3. **Strict Boundaries:** Frontend applications consume shared contract interfaces without duplicating DTOs.

---

## 🌐 Network & Access Layer

Traffic flows through a multi-tier ingress routing model:

\`\`\`mermaid
flowchart TD
    subgraph Internet ["Public Internet"]
        MobileClient["📱 Flutter Mobile Apps (CABI Go & Drive)"]
        WebBrowsers["💻 Web Clients (Admin, Dispatch, User)"]
    end

    subgraph CDN ["Global Edge / CDN Layer"]
        DNS["DNS & Cloudflare / Vercel Edge"]
    end

    subgraph CloudRun ["Google Cloud Run (us-central1)"]
        AuthGW["🛡️ Auth Gateway (Reverse Proxy / CORS / JWT)"]
        
        subgraph InternalServices ["Internal Container Network"]
            SaccoSvc["🤝 Sacco Service"]
            DispSvc["⚡ Dispatch Service"]
            LeadSvc["🎯 Driver Lead Service"]
            RefSvc["🌳 Referral Service"]
            VerifSvc["🔍 Verification Service"]
        end
    end

    subgraph DataPlane ["Persistence & Messaging"]
        SupabasePostgres[("🗄️ Supabase PostgreSQL 15+")]
        RedisCluster["⚡ Managed Redis (Coordinates & BullMQ)"]
        StorageS3["📦 Supabase Storage (KYC Documents)"]
    end

    MobileClient --> DNS
    WebBrowsers --> DNS
    DNS --> AuthGW
    AuthGW --> SaccoSvc
    AuthGW --> DispSvc
    AuthGW --> LeadSvc
    AuthGW --> RefSvc
    AuthGW --> VerifSvc

    DispSvc <--> RedisCluster
    InternalServices --> SupabasePostgres
    VerifSvc --> StorageS3
\`\`\`

---

## 🔒 Security & Gateway Specifications

### 1. Dynamic CORS Architecture
Configured in \`auth-gateway/src/main.ts\`, the security gateway enforces strict origin validation supporting local development, staging environments, and production domains:
* \`https://cabi.africa\` & \`https://www.cabi.africa\`
* \`https://admin.cabi.africa\`
* \`https://dispatch.cabi.africa\`
* \`https://user.cabi.africa\`
* Regex patterns matching \`*.cabi.africa\`, \`*.run.app\`, and \`*.vercel.app\`.

### 2. Authentication & Session Strategy
* **JWT Tokens:** Signed using asymmetric secrets managed in Google Cloud Secret Manager.
* **OTP Multi-Factor:** Dual-channel OTP via Email (Nodemailer/SendGrid) and SMS (Twilio/Africa's Talking).
* **Two-Factor Authentication (2FA):** Speakeasy TOTP authenticator app support with encrypted recovery codes.
* **Role-Based Access Control (RBAC):** Hierarchical permissions enforced via custom NestJS guards:
  * \`SUPER_ADMIN\`, \`ADMIN\`, \`DISPATCHER\`, \`SACCO_MANAGER\`, \`FLEET_MANAGER\`, \`DRIVER\`, \`PASSENGER\`.

---

## ⚡ Real-Time Communications Pipeline

1. **Driver Geolocation Streaming:**
   * CABI Drive streams GPS coordinates over persistent WebSockets every 3–5 seconds.
   * Dispatch Service updates Redis geospatial indexes (\`GEOADD drivers:online <lng> <lat> <driverId>\`).
2. **Trip Matching & Dispatch:**
   * Passenger requests trip via \`POST /api/rides\`.
   * Dispatch service executes \`GEORADIUS\` query for available drivers within 3.0km radius.
   * Socket.io room notification triggers a 15-second countdown offer on the targeted driver's phone.
3. **Emergency SOS Broadcast:**
   * When rider or driver taps SOS in-app, an alert is broadcast to the Dispatch Console with live audio/GPS telemetry.

---

## 🔗 Related Documentation
* [[Backend — Microservices Catalog]]
* [[Database — Prisma Models & Ledger Schema]]
* [[DevOps, Security & Deployment Runbook]]
`;

fs.writeFileSync(path.join(ENG_DIR, 'Architecture — Monorepo & System Design.md'), archContent, 'utf8');
console.log('Created: Architecture — Monorepo & System Design.md');

// -------------------------------------------------------------
// 3. Backend — Microservices Catalog.md
// -------------------------------------------------------------
const backendContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: service-catalog
created: 2026-09-19
tags:
  - project/cabi
  - engineering/backend
  - nestjs/microservices
aliases:
  - Backend Services
  - Microservices Catalog
---

# ⚙️ Backend — Microservices Catalog

> **Framework Standards:** All backend services are built using **NestJS 10.x** on **Node.js 20+**, structured with modular domain controllers, services, DTO validation pipes via \`class-validator\`, and type-safe database queries via **Prisma Client**.

---

## 📋 Microservices Matrix

| Microservice | Path | Port | Deployment Image | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Gateway** | \`auth-gateway\` | \`3333\` | \`auth-gateway:latest\` | Central Ingress, JWT issuance, OTP, 2FA, RBAC, Swagger Docs |
| **SACCO Service** | \`backend/sacco-service\` | \`3338\` | \`sacco-service:latest\` | Driver organizations, welfare schemes, deduction engine, financial partners |
| **Dispatch Service** | \`backend/dispatch-service\` | \`3335\` | \`dispatch-service:latest\` | Real-time driver matching, trip lifecycle, Redis geospatial tracking |
| **Driver Lead Service** | \`backend/driver-lead-service\` | \`3336\` | \`driver-lead-service:latest\` | Driver prospect capture, marketing funnels, status progression |
| **Referral Service** | \`backend/referral-service\` | \`3337\` | \`referral-service:latest\` | Referral sponsor tree, commission calculation, multi-tier payouts |
| **Verification Service** | \`backend/verification-service\` | \`3334\` | \`verification-service:latest\` | Document OCR, NTSA/DL validity, facial biometrics, KYC tiers |

---

## 1. 🛡️ Auth Gateway (\`auth-gateway\`)

* **Source Directory:** \`auth-gateway/src\`
* **Swagger Documentation:** Available at \`/api/docs\`
* **Core Modules:**
  * \`AuthModule\`: Login, Registration, Refresh Token Rotation, Password Reset.
  * \`SecurityModule\`: Rate limiting, IP throttling, Login history auditing.
  * \`OtpModule\`: Phone & Email OTP verification.
  * \`TwoFactorModule\`: Speakeasy TOTP QR generation & validation.
* **Core Endpoints:**
  * \`POST /api/auth/register\` — Passenger / Driver registration.
  * \`POST /api/auth/login\` — User authentication returning JWT & Refresh tokens.
  * \`POST /api/auth/verify-otp\` — OTP code validation.
  * \`POST /api/auth/2fa/generate\` — Generates TOTP secret & QR code.
  * \`POST /api/auth/2fa/verify\` — Activates 2FA.

---

## 2. 🤝 SACCO & Welfare Service (\`sacco-service\`)

* **Source Directory:** \`backend/sacco-service/src/app\`
* **Domain Focus:** Empowers drivers through cooperative banking, savings schemes, emergency funds, and financial partner integrations.
* **Key Services:**
  * \`SaccoService\` (\`sacco.service.ts\`): SACCO organization management, driver assignment, welfare deduction processing.
  * \`FinancialPartnerService\` (\`financial-partner.service.ts\`): Bank & Microfinance partner integration, API keys, webhook handling.
  * \`FinancialConsentService\` (\`financial-consent.service.ts\`): ODPC-compliant driver consent capture for credit scoring and financial data sharing.
* **Core Endpoints:**
  * \`GET /api/sacco/organizations\` — List registered driver SACCOs.
  * \`POST /api/sacco/welfare/deduct\` — Process trip welfare contribution deductions.
  * \`GET /api/sacco/partners\` — View approved institutional financial partners.
  * \`POST /api/sacco/consent\` — Record driver explicit financial consent.

---

## 3. ⚡ Dispatch Service (\`dispatch-service\`)

* **Source Directory:** \`backend/dispatch-service/src\`
* **Domain Focus:** High-concurrency geospatial dispatching and live trip tracking.
* **Core Capabilities:**
  * **Redis Spatial Indexes:** Driver locations stored in geospatial sets.
  * **Socket.io Gateways:** Real-time event channels:
    * \`/trip-tracking\`: Broadcasts driver movement to passenger app.
    * \`/driver-offers\`: Delivers dispatch bids to nearby drivers.
  * **State Machine:** Governs ride transitions:
    * \`REQUESTED\` → \`SEARCHING\` → \`ACCEPTED\` → \`ARRIVED\` → \`IN_PROGRESS\` → \`COMPLETED\` / \`CANCELLED\`.

---

## 4. 🎯 Driver Lead Service (\`driver-lead-service\`)

* **Source Directory:** \`backend/driver-lead-service/src\`
* **Domain Focus:** Acquisition pipeline for new drivers prior to formal document verification.
* **Key Capabilities:**
  * Lead capture from marketing campaigns, referral links, and partner SACCO drives.
  * Multi-stage qualification scoring (Vehicle ownership, PSV license validity, smartphone readiness).
  * Automated SMS/WhatsApp nudge sequences to complete KYC document submission.

---

## 5. 🌳 Referral & MLM Service (\`referral-service\`)

* **Source Directory:** \`backend/referral-service/src\`
* **Domain Focus:** Growth viral loop through driver and rider referral bonuses.
* **Key Capabilities:**
  * **Role-Based Attribution:**
    * Drivers can refer fellow **Drivers ONLY** (attempts to refer passengers throw 403 Forbidden).
    * Passengers can refer both **Passengers** and **Drivers**.
  * **Onboarding Registration Incentive Campaign:**
    * Active 90-day attribution window per referred user (not an indefinite annuity).
  * **Driver Activation Deposit:**
    * Ksh 1,000 onboarding activation deposit, with 100% value-back credited directly into driver platform wallet for rides and platform commissions (non-refundable as cash).
  * **7-Day (168-Hour) Dispute Clearance Escrow:**
    * Commissions credited into \`PENDING_REVIEW\` / \`ESCROW\` for 168 hours before moving to \`AVAILABLE\` to protect against trip disputes, chargebacks, and collusion.
  * **Withdrawal Threshold & Weekly Schedule:**
    * Minimum withdrawal threshold of **KES 500**, disbursed on a weekly cycle via carrier-neutral **Mobile Money** or Bank.
  * **Hierarchical Referral Trees:**
    * Multi-tier referral calculations and platform commission ledger allocations.

---

## 6. 🔍 Verification Service (\`verification-service\`)

* **Source Directory:** \`backend/verification-service/src\`
* **Domain Focus:** Passenger and Driver trust, regulatory compliance, and fraud prevention.
* **Key Capabilities:**
  * **Document Processing:** Drivers upload National ID, Driving License, Good Conduct Certificate, and Vehicle Inspection Report.
  * **Facial Biometrics:** Compares live driver selfie with ID photo using facial landmark recognition.
  * **Passenger Verification Tiers:**
    * \`BASIC\`: Unverified phone/email.
    * \`VERIFIED\`: National ID or Corporate ID validated.
    * \`CORPORATE\`: Enterprise account with verified billing.

---

## 🔗 Related Documentation
* [[SACCO & Financial Integration Engine]]
* [[Database — Prisma Models & Ledger Schema]]
* [[Architecture — Monorepo & System Design]]
`;

fs.writeFileSync(path.join(ENG_DIR, 'Backend — Microservices Catalog.md'), backendContent, 'utf8');
console.log('Created: Backend — Microservices Catalog.md');

// -------------------------------------------------------------
// 4. Database — Prisma Models & Ledger Schema.md
// -------------------------------------------------------------
const dbContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: database-schema
created: 2026-09-19
tags:
  - project/cabi
  - engineering/database
  - database/prisma
  - database/postgresql
aliases:
  - Database Schema
  - Prisma Models
  - Ledgers & Schema
---

# 🗄️ Database — Prisma Models & Ledger Schema

> **Database Infrastructure:** Hosted on **Supabase (PostgreSQL 15+)** using connection pooling for application services and direct TCP connection for schema migrations and CLI operations. Configured in \`libs/backend/database/prisma/schema.prisma\`.

---

## 📊 Core Entity Relationship Diagram

\`\`\`mermaid
erDiagram
    User ||--o| DriverProfile : "has profile"
    User ||--o{ UserRole : "assigned"
    User ||--o{ Ride : "passenger rides"
    User ||--o{ DocumentVerification : "submits"
    User ||--o{ BiometricVerification : "verifies"
    User ||--o{ Occurrence : "reports/involved"

    DriverProfile ||--o{ Document : "uploads"
    DriverProfile ||--o{ CommissionLedger : "earns"
    DriverProfile ||--o| DriverSavingsPreference : "configures"
    DriverProfile }o--|| organizations : "belongs to"
    DriverProfile ||--o{ DriverFinancialConsent : "grants consent"

    organizations ||--o{ SaccoLedger : "tracks funds"
    organizations ||--o{ WelfareScheme : "manages"

    Ride ||--o{ RideStop : "has waypoints"
    Ride ||--o{ Occurrence : "generates incidents"

    WelfareScheme ||--o{ WelfareEnrollment : "enrolls"
    WelfareEnrollment ||--o{ WelfareDeduction : "deducts per trip"

    SaccoPartner ||--o{ DriverFinancialConsent : "receives data"
\`\`\`

---

## 🔑 Core Domain Models

### 1. Identity & Permissions
* **\`User\` (\`users\` table):**
  * Primary identifier, \`email\`, \`phone\`, \`password\` (bcrypt hash).
  * KYC flags: \`isEmailVerified\`, \`isPhoneVerified\`, \`isIdentityVerified\`, \`isVerifiedPassenger\`.
  * Security: \`isTwoFactorEnabled\`, \`twoFactorSecret\`, \`recoveryCodes\`, \`lastActiveAt\`.
  * Passenger verification levels: \`BASIC\`, \`VERIFIED\`, \`CORPORATE\`.
* **\`Role\` & \`UserRole\`:** RBAC permission mapping for Super Admin, Admin, Dispatcher, Sacco Manager, Driver, and Passenger.

### 2. Driver & Fleet Hierarchy
* **\`DriverProfile\`:**
  * \`licenseNumber\`, \`isOnline\`, \`currentLocation\` (GeoJSON), \`isBiometricVerified\`.
  * Performance: \`averageRating\`, \`acceptanceRate\`, \`totalRidesCompleted\`.
  * Relations: \`organizationId\` (SACCO or Fleet owner), \`driverGroupId\`, \`referrerId\`.
* **\`Vehicle\` & \`VehicleDriver\`:**
  * Registration number, make, model, year, inspection status, insurance expiry.
  * Shift assignment tracking: \`VehicleShift\`, driver qualification requirements.

### 3. Rides & Real-Time Tracking
* **\`Ride\` (\`rides\` table):**
  * Pickup and dropoff latitude/longitude coordinates and address text.
  * Status: \`REQUESTED\`, \`SEARCHING\`, \`ACCEPTED\`, \`ARRIVED\`, \`IN_PROGRESS\`, \`COMPLETED\`, \`CANCELLED\`.
  * Pricing breakdown: \`baseFare\`, \`distanceFare\`, \`timeFare\`, \`surgeMultiplier\`, \`totalFare\`, \`platformFee\` (18% cap).
* **\`Occurrence\` & Safety Incidents:**
  * Incident reporting: Driver-rider disputes, safety issues, vehicle breakdown.
  * Resolution workflow: \`OccurrenceMedia\` (evidence uploads), \`OccurrenceObjection\` (driver appeals), \`OccurrenceAuditLog\`.

---

## 💰 Financial Ledgers & Auditing

Cabi Africa strictly enforces double-entry-style immutable financial records across four dedicated ledgers:

### 1. \`TransactionLedger\`
Records every user-facing balance movement:
* Trip fares, passenger card charges, M-Pesa STK push callbacks.
* Driver wallet balance credits and cash payments.

### 2. \`CommissionLedger\`
Governs the platform's 18% capped revenue cut:
* Splits the platform fee into platform operations and referral upline commissions.
* Tracks sponsor payouts across referral tree generations.

### 3. \`SaccoLedger\`
Dedicated financial ledger for SACCO cooperatives:
* Tracks driver member contributions, daily welfare pool deposits, and cooperative remittance payouts.

### 4. \`WelfareDeduction\`
Automated micro-deductions processed at trip completion:
* Deducts predetermined amounts (e.g., KSh 20 to KSh 50 per trip) into Driver Welfare, Emergency Insurance, and Retirement savings.

---

## 🔗 Related Documentation
* [[SACCO & Financial Integration Engine]]
* [[Backend — Microservices Catalog]]
* [[Architecture — Monorepo & System Design]]
`;

fs.writeFileSync(path.join(ENG_DIR, 'Database — Prisma Models & Ledger Schema.md'), dbContent, 'utf8');
console.log('Created: Database — Prisma Models & Ledger Schema.md');

// -------------------------------------------------------------
// 5. SACCO & Financial Integration Engine.md
// -------------------------------------------------------------
const saccoContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: integration-architecture
created: 2026-09-19
tags:
  - project/cabi
  - engineering/sacco
  - fintech/kenya
  - compliance/odpc
aliases:
  - SACCO Engine
  - Driver Welfare Hub
  - Financial Partner Integration
---

# 🤝 SACCO & Financial Integration Engine

> **Mission & Moat:** While legacy ride-hailing apps treat drivers as disposable gig workers, CABi Africa embeds a **Driver Welfare & SACCO (Savings and Credit Cooperative)** engine into the core transactional flow. This turns everyday trip earnings into credit scores, healthcare coverage, and cooperative ownership.

---

## 🧩 Architectural Overview

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Driver as 👨‍✈️ Driver (CABI Drive)
    participant RideSvc as ⚡ Dispatch/Ride Service
    participant SaccoSvc as 🤝 SACCO Service
    participant Consent as 📜 Financial Consent Engine
    participant Partner as 🏦 Financial Partner (Bank/SACCO)
    participant Ledger as 🗄️ Welfare & Sacco Ledger

    Driver->>Consent: Grants ODPC consent for credit scoring
    Consent->>Consent: Stores signed DriverFinancialConsent record
    
    Note over Driver,RideSvc: Trip completed & fare calculated
    RideSvc->>SaccoSvc: Trigger post-trip financial settlement
    SaccoSvc->>SaccoSvc: Calculate platform fee (18% cap)
    SaccoSvc->>SaccoSvc: Query active WelfareEnrollment rules
    SaccoSvc->>Ledger: Insert WelfareDeduction (Savings / Health / Emergency)
    SaccoSvc->>Ledger: Insert SaccoLedger credit
    
    Partner->>SaccoSvc: Query Driver Creditworthiness Score
    SaccoSvc->>Consent: Verify unexpired consent & scope
    Consent-->>SaccoSvc: Consent Verified ✅
    SaccoSvc-->>Partner: Returns trip volume & average net earnings (Aggregated)
    Partner-->>Driver: Approves fuel micro-loan or vehicle financing!
\`\`\`

---

## 🏛️ Key Data Models

### 1. \`SaccoPartner\`
Represents external financial institutions, registered cooperatives, banks, and microfinance partners:
* Fields: \`partnerName\`, \`partnerType\` (\`SACCO\`, \`BANK\`, \`MICROFINANCE\`, \`INSURANCE\`), \`apiEndpoint\`, \`status\`, \`contactEmail\`.
* Security: API keys and webhook signing secrets for automated credit reporting.

### 2. \`DriverFinancialConsent\`
Complies with Kenya's **Office of the Data Protection Commissioner (ODPC)** guidelines:
* Drivers have full autonomy over which institutions can see their trip metrics.
* Fields: \`driverId\`, \`partnerId\`, \`consentType\` (\`CREDIT_SCORING\`, \`LOAN_DEDUCTION\`, \`INSURANCE_VERIFICATION\`), \`isGranted\`, \`grantedAt\`, \`expiresAt\`, \`ipAddress\`.
* Drivers can revoke consent anytime directly inside the CABI Drive mobile app.

### 3. \`WelfareScheme\` & \`WelfareDeduction\`
* Schemes include: Emergency Hospitalization, Vehicle Maintenance Pool, Fuel Micro-Advance Repayment, and Voluntary SACCO Shares.
* Deductions are triggered atomically at the end of each trip or on a daily threshold schedule.

---

## 🧮 Financial Policy Safeguards & Configuration (\`SaccoFinancialConfigDto\`)

The SACCO engine in \`sacco.service.ts\` enforces strict mathematical and contractual safeguards to guarantee that cooperative deductions never compromise driver livelihood:

\`\`\`typescript
export class SaccoFinancialConfigDto {
    mandatoryRemittancePct: number;       // Base SACCO contribution percentage
    cabiCommissionPct: number;            // 18% capped platform fee
    joiningIncentiveEnabled: boolean;     // Incentive toggle for new members
    joiningIncentivePct: number;          // e.g. 3% temporary platform fee discount
    joiningIncentiveDurationDays: number; // Duration of joining incentive window (e.g. 90 days)
    maxVoluntaryDeductionPct: number;     // 15% CAP (default 0.15) - prevents over-deduction
    minDriverTakeHomePct: number;         // 65% MINIMUM GUARANTEED take-home floor (default 0.65)
    optOutNoticeMonths: number;           // Notice cycle: 1, 3, 6, or 12 months
}

export class UpdateSaccoPartnerDto {
    name?: string;
    contactEmail?: string;
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType?: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    testMode?: boolean;
    isActive?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}
\`\`\`

### 🛡️ Driver Protection Guardrails
1. **Guaranteed Minimum Take-Home (65% Floor):** Regardless of accumulated loans, SACCO shares, or health insurance enrollments, total deductions can **never** exceed 35% of gross trip fare (\`minDriverTakeHomePct = 0.65\`).
2. **Voluntary Deduction Cap (15% Ceiling):** Discretionary savings and extra cooperative share purchases are hard-capped at 15% (\`maxVoluntaryDeductionPct = 0.15\`).
3. **Joining Incentive Window:** When enabled, new drivers receive a joining incentive discount (e.g. 3% fee reduction), tracked via \`saccoEnrolledAt\` and \`incentiveDaysRemaining\`.
4. **Partner Connector Architecture:**
   * \`REST_API\`: Direct bilateral synchronization with core banking and SACCO management software.
   * \`WEBHOOK\`: Real-time loan repayment and dividend notification events.
   * \`LEDGER_EXPORT\`: Automated reconciled CSV/JSON ledger exports for legacy SACCO auditing.
5. **Stackable Incentive Rules Evaluator (\`evaluateStackableIncentives\`):**
   * \`TENURE_DURATION\`: Rewards longevity (e.g., tenure <= 365 days).
   * \`BADGE_TIER\`: Automatic fee discounts for \`GOLD\`, \`PLATINUM\`, and \`ROAD_MASTER\` drivers.
   * \`TRIP_COUNT\`: High-volume bonus triggers (e.g., >= 30 trips completed in a weekly cycle).

---

## 🖥️ Admin SACCO Integration Hub

Implemented in \`web/admin_panel/src/pages/sacco/SaccoIntegrationHub.tsx\`:

1. **Partner Onboarding & API Key Management:**
   * Admins can create and authorize new SACCO and banking partners.
   * View live connection status and API request volume.
2. **Consent Auditing:**
   * Complete audit trail of driver consent approvals, updates, and revocations.
   * Direct export for NTSA and ODPC compliance inspections.
3. **Welfare Deduction Analytics:**
   * Total funds collected into driver welfare pools.
   * Reconciliation against SACCO bank transfers and M-Pesa B2C disbursements.

---

## 🛡️ Regulatory Compliance (ODPC & NTSA)

* **Explicit Purpose Limitation:** Financial data shared with partners is strictly aggregated (average monthly trips, net weekly income) and never exposes passenger identity, exact residential addresses, or raw route coordinates.
* **Audit Trail:** Every access request by a partner is logged in \`OccurrenceAuditLog\` with IP address, timestamp, and query parameters.

---

## 🔗 Related Documentation
* [[Database — Prisma Models & Ledger Schema]]
* [[Backend — Microservices Catalog]]
* [[Web Applications — Admin, Dispatch & User Portals]]
* [[Driver Welfare & SACCO]] (Strategic Vault Note)
`;

fs.writeFileSync(path.join(ENG_DIR, 'SACCO & Financial Integration Engine.md'), saccoContent, 'utf8');
console.log('Created: SACCO & Financial Integration Engine.md');

// -------------------------------------------------------------
// 6. Web Applications — Admin, Dispatch & User Portals.md
// -------------------------------------------------------------
const webContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: frontend-architecture
created: 2026-09-19
tags:
  - project/cabi
  - engineering/frontend
  - react/vite
  - nextjs/app-router
aliases:
  - Web Portals
  - Admin Panel
  - Dispatch Panel
  - User Portal
---

# 💻 Web Applications — Admin, Dispatch & User Portals

> **Frontend Suite:** Cabi Africa maintains three dedicated web applications in \`web/\`, purpose-built for administrators, dispatch center operators, and public riders/driver recruits.

---

## 🌐 Web Applications Overview

| Application | Technology | Path | Target URL | Primary Persona |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Panel** | React 18, Vite, Tailwind v4, Tremor, MUI | \`web/admin_panel\` | \`admin.cabi.africa\` | Super Admins, Operations, SACCO Managers |
| **Dispatch Panel** | React 18, Vite, Leaflet, Socket.io | \`web/dispatch_panel\` | \`dispatch.cabi.africa\` | Fleet Dispatchers, Call Center Support |
| **User Portal** | Next.js 14 App Router, Tailwind v4 | \`web/user_portal\` | \`cabi.africa\` / \`user.cabi.africa\` | Passengers, Prospective Drivers, Public |

---

## 1. 🛠️ Admin Panel (\`web/admin_panel\`)

* **Bundler & Tooling:** Vite with React 18, TypeScript, and Tailwind CSS v4.
* **UI Components:** Tremor metrics cards, Recharts time-series graphs, and Material-UI icon set.
* **Key Functional Modules:**
  * **Driver KYC Verification:** Review submitted Driving Licenses, Logbooks, Good Conduct Certificates, and run facial biometric checks.
  * **SACCO Integration Hub (\`SaccoIntegrationHub.tsx\`):** Partner onboarding, consent tracking, welfare scheme deduction configuration.
  * **Safety & Occurrences:** Review safety objections, arbitrate driver suspensions, examine audit logs.
  * **Fare & Commission Management:** Configure base fares, per-kilometer pricing, and enforce the 18% commission cap.
  * **Role-Based Access Control (RBAC):** Manage administrative staff permissions and system settings.

---

## 2. 📡 Dispatch Panel (\`web/dispatch_panel\`)

* **Bundler & Tooling:** Vite with React 18, Leaflet mapping engine, and Socket.io client.
* **Key Features:**
  * **Live Fleet Map:** Visualizes active drivers categorized by state (\`AVAILABLE\`, \`ON_TRIP\`, \`OFFLINE\`).
  * **Manual Phone Dispatch:** Allows telephone dispatchers to book rides for corporate clients or passengers without smartphones.
  * **Active Trip Interception:** Real-time monitoring of ongoing trips with route deviation alerts.
  * **Emergency SOS Center:** Pops up immediate audiovisual alarm when a driver or rider triggers an in-app emergency alert.
  * **Multi-Screen Undock & Dock Architecture (\`UndockablePanel.tsx\` & \`useUndockableWindow.ts\`):** Allows dispatchers and admins to detach telemetry displays (e.g. Trip Monitoring: complete vs cancelled trips, cancellation sources, and root cause distributions) into dedicated popout windows on secondary physical monitors or wallboards. Uses zero-desync React Portals to maintain live streaming, renders an interactive placeholder on the primary display, and supports bidirectional one-click docking.

---

## 3. 🌐 User & Marketing Portal (\`web/user_portal\`)

* **Framework:** Next.js 14 with App Router and Server-Side Rendering (SSR).
* **Internationalization:** \`next-i18next\` support for English and Swahili.
* **Key Routes & Pages:**
  * \`/\`: High-converting marketing landing page showcasing passenger safety, driver welfare, and transparent fares.
  * \`/onboarding\`: Responsive multi-step driver prospect registration funnel with instant vehicle pre-qualification.
  * \`/book\`: Web-based ride booking for desktop and kiosk environments.
  * \`/safety\`: Detailed explanation of passenger KYC tiers and driver screening standards.
  * \`/blog\`: Dynamic blog and news updates powered by the backend \`BlogPost\` model.

---

## 🔗 Related Documentation
* [[Architecture — Monorepo & System Design]]
* [[SACCO & Financial Integration Engine]]
* [[DevOps, Security & Deployment Runbook]]
`;

fs.writeFileSync(path.join(ENG_DIR, 'Web Applications — Admin, Dispatch & User Portals.md'), webContent, 'utf8');
console.log('Created: Web Applications — Admin, Dispatch & User Portals.md');

// -------------------------------------------------------------
// 7. Mobile Applications — CABI Go & CABI Drive.md
// -------------------------------------------------------------
const mobileContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: mobile-architecture
created: 2026-09-19
tags:
  - project/cabi
  - engineering/mobile
  - flutter/dart
  - state/riverpod
aliases:
  - Mobile Apps
  - CABI Go
  - CABI Drive
---

# 📱 Mobile Applications — CABI Go & CABI Drive

> **Framework:** Built with **Flutter (Dart 3.x)** using a single high-performance codebase targeting **Android** and **iOS**, with **Riverpod** for reactive state management.

---

## 📱 Mobile Architecture Matrix

| Application | Package Name | Target Audience | Primary Role | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **CABI Go** | \`africa.cabi.passenger\` | Passengers & Riders | Ride Booking & Trip Safety | Live tracking, Fare estimates, Verified KYC tier, SOS button |
| **CABI Drive** | \`africa.cabi.driver\` | Registered Drivers | Driver Operations & Earnings | Dispatch bids, Turn-by-turn routing, SACCO deductions, Wallet |

---

## 1. 🚖 CABI Go (Passenger App)

* **Path:** \`mobile/passenger_app\`
* **Key Features:**
  1. **Interactive Ride Booking:**
     * Google Places / Mapbox auto-complete for pickup and destination.
     * Fare breakdown showing base fare, distance, estimated time, and vehicle category (Boda, Standard, Comfort, XL).
  2. **Driver Live Tracking:**
     * Smooth vehicle rotation and coordinate interpolation over WebSockets.
     * Real-time ETA updates.
  3. **Passenger KYC Verification Badge:**
     * Displays \`BASIC\`, \`VERIFIED\`, or \`CORPORATE\` status, building mutual trust with drivers and preventing passenger anonymity.
  4. **Safety & Emergency Toolkit:**
     * One-tap SOS calling Police and dispatch center.
     * Share live trip link with trusted contacts via WhatsApp / SMS.

---

## 2. 👨‍✈️ CABI Drive (Driver OS)

* **Path:** \`mobile/driver_app\`
* **Key Features:**
  1. **Dispatch Offer Modal:**
     * 15-second countdown timer showing pickup distance, destination neighborhood, estimated fare, and passenger rating.
  2. **Turn-by-Turn Navigation:**
     * In-app Google Maps navigation or direct launch into Waze / Google Maps app.
  3. **Earnings & Commission Transparency:**
     * Immediate trip completion breakdown: Total Fare, 18% Platform Cut, Driver Payout (82%).
  4. **SACCO & Savings Controls:**
     * Toggle voluntary SACCO savings contribution per trip.
     * View accumulated welfare fund balance and credit eligibility.
  5. **Background Location Service:**
     * Battery-optimized background location tracking to maintain dispatch readiness when phone is locked.

---

## 🛠️ Build & Release Automation

Automated via PowerShell scripts located in the root repository:

* **Release Script:** \`scripts/build-mobile-release.ps1\`
* **Commands:**
  * Build APKs: \`npm run mobile:build:android\`
  * Build Android App Bundle (.aab): \`npm run mobile:build:bundle\`
* **Production Artifacts Generated:**
  * \`Cabi-Drive-Official.apk\` (Driver Release)
  * \`Cabi-Go-Official.apk\` (Passenger Release)
* **Over-The-Air (OTA) Updates:**
  * Shorebird integration configured for instant patch delivery without requiring full app store re-review.

---

## 🔗 Related Documentation
* [[Architecture — Monorepo & System Design]]
* [[Backend — Microservices Catalog]]
* [[SACCO & Financial Integration Engine]]
`;

fs.writeFileSync(path.join(ENG_DIR, 'Mobile Applications — CABI Go & CABI Drive.md'), mobileContent, 'utf8');
console.log('Created: Mobile Applications — CABI Go & CABI Drive.md');

// -------------------------------------------------------------
// 8. DevOps, Security & Deployment Runbook.md
// -------------------------------------------------------------
const devopsContent = `---
project: CABi Africa
parent_company: iBN Kenya
type: devops-runbook
created: 2026-09-19
tags:
  - project/cabi
  - engineering/devops
  - gcp/cloud-run
  - ci-cd/cloud-build
aliases:
  - DevOps Runbook
  - Deployment Guide
  - Security & Operations
---

# 🚀 DevOps, Security & Deployment Runbook

> **Infrastructure Paradigm:** Serverless containers deployed on **Google Cloud Run (Region: us-central1)** orchestrated via **Google Cloud Build**, paired with **Supabase (PostgreSQL 15+)** and **Managed Redis**.

---

## 🏗️ Continuous Integration & Deployment (CI/CD)

The production deployment pipeline is defined in \`cloudbuild.yaml\`:

\`\`\`mermaid
flowchart LR
    GitPush["Git Push to 'main'"] --> CloudBuild["Google Cloud Build (32 Core Worker)"]
    
    subgraph BuildPhase ["Docker Build & Artifact Registry"]
        B1["Build auth-gateway"]
        B2["Build sacco-service"]
        B3["Build dispatch-service"]
        B4["Build driver-lead-service"]
        B5["Build referral-service"]
        B6["Build verification-service"]
        B7["Build admin-panel"]
        B8["Build dispatch-panel"]
        B9["Build user-portal"]
    end

    subgraph DeployPhase ["Cloud Run Deployment"]
        D1["Deploy to Cloud Run (us-central1)"]
    end

    CloudBuild --> BuildPhase
    BuildPhase --> DeployPhase
\`\`\`

### Optimized Multi-Stage Docker Builds
* Build caching leverages \`Dockerfile.backend.prebuilt\`.
* Build argument \`SERVICE_NAME\` dynamically targets individual microservices within the Nx monorepo.
* Cloud Run flags: \`--no-cpu-throttling\`, \`--min-instances=1\` on critical gateways to eliminate cold starts.

---

## 🔐 Secrets & Environment Variables

Production secrets are securely mounted from **Google Cloud Secret Manager**:

| Secret Key | Bound Environment Variable | Usage |
| :--- | :--- | :--- |
| \`DATABASE_URL:latest\` | \`DATABASE_URL\` | Supabase transaction pooler connection |
| \`DIRECT_URL:latest\` | \`DIRECT_URL\` | Supabase direct connection for migrations |
| \`JWT_SECRET:latest\` | \`JWT_SECRET\` | Asymmetric JWT token signing secret |
| \`MPESA_CONSUMER_KEY\` | \`MPESA_KEY\` | Safaricom Daraja API Consumer Key |
| \`MPESA_CONSUMER_SECRET\`| \`MPESA_SECRET\` | Safaricom Daraja API Consumer Secret |
| \`FCM_SERVER_KEY\` | \`FCM_KEY\` | Firebase Cloud Messaging push credentials |

---

## 📜 Regulatory & Compliance Operations

### 1. NTSA TNO Regulatory Compliance
* **Trip Record Retention:** Trip coordinates, passenger phone numbers, and driver license details are preserved in PostgreSQL for mandatory regulatory audit windows.
* **Vehicle Inspection Checks:** Scheduled cron job in \`backend/verification-service\` checks vehicle roadworthiness expiry dates and suspends drivers with expired documentation.

### 2. Kenya Data Protection Act (ODPC)
* **Granular Consent:** Data stored in \`DriverFinancialConsent\` records explicit opt-ins.
* **Right to Erasure:** Handled via \`User.privacySettings\` and automated anonymization jobs in compliance with local privacy frameworks.

---

## 🛠️ Operational Maintenance Commands

\`\`\`bash
# 1. Run all backend services locally
npm run serve:backend

# 2. Run all web portals concurrently
npm run dev:web

# 3. Clean and verify database seed roles
npm run db:seed-roles

# 4. Check TypeScript compiler diagnostics across all apps
powershell -ExecutionPolicy Bypass -File _check_ts.ps1

# 5. Build production Flutter APKs
npm run mobile:build:prod
\`\`\`

---

## 🔗 Related Documentation
* [[Architecture — Monorepo & System Design]]
* [[Backend — Microservices Catalog]]
* [[MOC — Engineering & Codebase Hub]]
`;

fs.writeFileSync(path.join(ENG_DIR, 'DevOps, Security & Deployment Runbook.md'), devopsContent, 'utf8');
console.log('Created: DevOps, Security & Deployment Runbook.md');

// -------------------------------------------------------------
// 9. Update CABi Africa — Master Index.md
// -------------------------------------------------------------
const masterIndexPath = path.join(VAULT_DIR, 'CABi Africa — Master Index.md');
if (fs.existsSync(masterIndexPath)) {
  let masterIndex = fs.readFileSync(masterIndexPath, 'utf8');
  
  if (!masterIndex.includes('MOC — Engineering & Codebase Hub')) {
    const insertBefore = '## 🔗 Related Notes & Links';
    const engineeringSection = `### 4. Technical Architecture & Engineering Hub
* [[01-System Architecture & Engineering/MOC — Engineering & Codebase Hub|MOC — Engineering & Codebase Hub]] — Complete technical overview of the Nx Monorepo, NestJS microservices, Flutter mobile apps, and Cloud Run infrastructure.
  * [[01-System Architecture & Engineering/Architecture — Monorepo & System Design|Architecture — Monorepo & System Design]]
  * [[01-System Architecture & Engineering/Backend — Microservices Catalog|Backend — Microservices Catalog]]
  * [[01-System Architecture & Engineering/Database — Prisma Models & Ledger Schema|Database — Prisma Models & Ledger Schema]]
  * [[01-System Architecture & Engineering/SACCO & Financial Integration Engine|SACCO & Financial Integration Engine]]
  * [[01-System Architecture & Engineering/Web Applications — Admin, Dispatch & User Portals|Web Applications — Admin, Dispatch & User Portals]]
  * [[01-System Architecture & Engineering/Mobile Applications — CABI Go & CABI Drive|Mobile Applications — CABI Go & CABI Drive]]
  * [[01-System Architecture & Engineering/DevOps, Security & Deployment Runbook|DevOps, Security & Deployment Runbook]]

`;
    if (masterIndex.includes(insertBefore)) {
      masterIndex = masterIndex.replace(insertBefore, engineeringSection + insertBefore);
    } else {
      masterIndex += '\n\n' + engineeringSection;
    }
    fs.writeFileSync(masterIndexPath, masterIndex, 'utf8');
    console.log('Updated: CABi Africa — Master Index.md with Engineering Hub link');
  }
}

// -------------------------------------------------------------
// 10. Update Tech Architecture & Mobile Apps.md
// -------------------------------------------------------------
const techArchPath = path.join(VAULT_DIR, 'Tech Architecture & Mobile Apps.md');
if (fs.existsSync(techArchPath)) {
  let techArch = fs.readFileSync(techArchPath, 'utf8');
  if (!techArch.includes('01-System Architecture & Engineering')) {
    const banner = `> [!NOTE] Production Implementation Update
> The technical architecture for Cabi Africa has transitioned from early specification to an active **Nx Monorepo with NestJS Microservices, Flutter Mobile Apps, and Google Cloud Run**.
> 
> 👉 **For the comprehensive, production-accurate engineering documentation, explore [[01-System Architecture & Engineering/MOC — Engineering & Codebase Hub|MOC — Engineering & Codebase Hub]].**

\n`;
    techArch = techArch.replace('# 🏗️ Tech Architecture & Mobile Apps\n\n', '# 🏗️ Tech Architecture & Mobile Apps\n\n' + banner);
    fs.writeFileSync(techArchPath, techArch, 'utf8');
    console.log('Updated: Tech Architecture & Mobile Apps.md with pointer banner');
  }
}

console.log('All notes successfully generated and linked!');
