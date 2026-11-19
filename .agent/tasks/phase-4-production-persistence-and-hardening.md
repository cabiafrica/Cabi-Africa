# Phase 4: Production Persistence & Security Hardening

**Status:** Completed ✅  
**Owner:** @backend-specialist & @security-auditor  
**Date:** 2026-11-19  
**Scope:** PostgreSQL/Prisma Schema Models (Disputes, Corporate Billing, Lost & Found), Redis-Backed Ephemeral TTL Store (USSD & VoIP), Write-Through Service Persistence, OWASP CSP/HSTS Hardening  

---

## 1. Objectives & Scope

1. **Prisma Schema Models (`libs/backend/database/prisma/schema.prisma`)**:
   - Add `DisputeClaim` (`dispute_claims`) with indexes on `tripId`, `passengerId`, `status`, and `createdAt`.
   - Add `LostItemIncident` (`lost_item_incidents`) with unique `obNumber`, 4-digit `handoverPin`, courier & reward escrow fields.
   - Add `CorporateAccount`, `CorporateCostCenter`, `CorporateEmployee`, and `CorporateInvoice` with KRA PIN & 16% VAT fields.
2. **Redis-Backed Ephemeral TTL Store (`backend/dispatch-service/src/common/ephemeral-store.util.ts`)**:
   - Connects to `REDIS_URL` via `ioredis` when present in production.
   - Gracefully degrades to an auto-expiring in-memory TTL store when running locally without Redis.
   - Wired into `UssdService` (5-min session drafts) and `VoiceService` (active WebRTC call sessions).
3. **Write-Through DB Persistence**:
   - Persist `DisputeService` claims/appeals/adjudications and `LostAndFoundService` incidents to Prisma with non-blocking fallback if table migration hasn't run yet in local dev.
4. **OWASP Security Header Hardening (`backend/dispatch-service/src/main.ts`)**:
   - Enforce `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `X-Frame-Options`, `X-Content-Type-Options`.

---

## 2. Implementation Roadmap

- [x] **Step 1: Add Prisma Models to `libs/backend/database/prisma/schema.prisma`**
- [x] **Step 2: Create `EphemeralStore` Redis/TTL Utility (`backend/dispatch-service/src/common/ephemeral-store.util.ts`)**
- [x] **Step 3: Wire Write-Through Persistence in `DisputeService`, `LostAndFoundService`, `UssdService`**
- [x] **Step 4: Harden Security Headers in `backend/dispatch-service/src/main.ts`**
- [x] **Step 5: Schema Validation, Bun Build, E2E Suite & Security Scan**
