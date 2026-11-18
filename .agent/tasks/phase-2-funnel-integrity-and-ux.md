# Phase 2: Funnel Integrity, Routing & UX Partitioning Task Plan

**Status:** Completed  
**Owner:** @frontend-specialist & @backend-specialist  
**Date:** 2026-11-18  
**Scope:** `web/user_portal` P1 Funnel & UX Hardening  

---

## 1. Objectives & Implemented Enhancements

Remediated the funnel data loss, route stub confusion, and dashboard role conflicts identified in the Driver and Passenger Web Portals audit:

1. **Driver Onboarding Funnel Persistence (`/drivers/register`)**:
   - Created [/api/driver-leads/complete-application.ts](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/src/pages/api/driver-leads/complete-application.ts) to persist Step 2 documents and Step 3 vehicle details (`plateNumber`, `make`, `model`, `year`, `logbookUrl`, `insuranceUrl`, `inspectionUrl`) to `prisma.vehicle` and `prisma.driverProfile`.
   - Replaced fake client-side `setTimeout` with real database submission and generated official reference code (`CABI-DRV-...`).
   - Implemented `localStorage` draft auto-save and restore (`cabi_driver_reg_draft`) ensuring applicant inputs survive network interruptions or accidental navigation.

2. **Unified Dashboard Partitioning & Contextual Role Switcher (`/dashboard`)**:
   - Configured `/dashboard` to default to Passenger/Rider View (`userRole === 'passenger'`).
   - Enforced authentication redirect: unauthenticated visitors are automatically routed to `/login?redirect=/dashboard`.
   - Added interactive Contextual Role Switcher pill in the dashboard header: **Rider View** ⇋ **Captain View**.
   - Rider View: Removed "My Vehicles" and "Driver Analytics" from sidebar and mobile navigation; added 1-Tap Passenger Booking Callout leading to ride creation; displays ride wallet, passenger stats, and frequent routes.
   - Captain View: Provides driver metrics (net earnings, rating, driving performance, SACCO wealth connection, and full vehicle fleet management).

3. **Orphaned Stub Elimination & Route Redirects (`/driver` & `/passenger`)**:
   - Added permanent HTTP 308 redirects in [next.config.js](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/next.config.js):
     - `/driver` -> `/drivers`
     - `/passenger` -> `/passengers`
   - Updated [driver.tsx](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/src/pages/driver.tsx) and [passenger.tsx](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/src/pages/passenger.tsx) with immediate router replacement and `<meta httpEquiv="refresh">` tags for zero-delay transition.

4. **Dynamic Driver Prospect Status & Auth Guard in `/drivers/dashboard.tsx`**:
   - Removed hardcoded `driver@example.com` query; dynamically resolves to the authenticated driver's email (`user?.email`).
   - Added auth guard redirecting unauthenticated visitors to `/login?redirect=/drivers/dashboard`.

5. **Passenger Booking Verification Upgrade (`BookingSection.tsx` & `/api/rides/book`)**:
   - Connected SMS/email OTP trigger via `/api/auth/send-otp` with dev fallback.
   - Allowed authenticated passengers with valid signed JWTs to confirm trips seamlessly without redundant manual OTP re-verification.

---

## 2. Implementation Checklist

- [x] **Task 1:** Create `/api/driver-leads/complete-application.ts` and update `/drivers/register.tsx` to persist Step 2/3 data.
- [x] **Task 2:** Partition `/dashboard/index.tsx` by role: default to Passenger view, hide vehicle tabs for riders, add commuter booking CTA.
- [x] **Task 3:** Update `next.config.js` with permanent redirects for `/driver` and `/passenger`.
- [x] **Task 4:** Fix `/drivers/dashboard.tsx` to query prospect status dynamically for the logged-in driver and enforce auth guards.
- [x] **Task 5:** Verify UX & build with automated scripts.
