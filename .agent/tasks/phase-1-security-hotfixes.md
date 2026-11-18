# Phase 1: User Portals Security & Access Control Hotfixes Task Plan

**Status:** Completed  
**Owner:** @security-auditor & @backend-specialist  
**Date:** 2026-11-18  
**Scope:** `web/user_portal` P0 Security Hardening  

---

## 1. Objectives & Implemented Hardening

Remediated the four Critical security vulnerabilities, two High auth/crypto vulnerabilities, and integration key mismatches identified in the Driver and Passenger Web Portals audit:

1. **IDOR & Profile Overwrite Guard (`/api/users/profile`)**:
   - Enforced caller JWT authentication via `requireAuth(req, res)`.
   - Restricted profile updates (email, phone, fullName) strictly to the authenticated `caller.id`/`caller.sub`.
   - Updated [settings/profile.tsx](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/src/pages/settings/profile.tsx) to supply `Authorization: Bearer ${token}` headers.

2. **Driver Concierge PII & Ticket Isolation (`/api/concierge`)**:
   - Replaced public dump of all tickets and driver phone numbers with strict role-based filtering.
   - Drivers can now only view tickets matching their own authenticated account.
   - Updated [drivers/concierge.tsx](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/src/pages/drivers/concierge.tsx) to attach driver auth tokens and bind tickets to the caller.

3. **Passenger Lost & Found PII Masking & Access Control (`/api/lost-and-found`)**:
   - Implemented `maskPhoneNumber()` to redact contact phones (e.g. `+254 7*** **78`) in public listings.
   - Restricted full unmasked details and status updates to Admins, Dispatchers, and verified item owners.

4. **Cryptographic Token Signing & Verification (`/api/login` & `/api/auth/me`)**:
   - Created centralized [serverAuth.ts](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/user_portal/src/lib/serverAuth.ts) module.
   - In direct DB fallback login, replaced predictable plaintext `cabi-session-...` with cryptographically signed `jwt.sign(...)`.
   - In `/api/auth/me`, replaced unverified `jwt.decode` with strict `jwt.verify(token, JWT_SECRET)`.
   - Invalidated legacy unverified session strings per the Immediate Clean Cutover policy.

5. **Payout & Disbursement Endpoint Hardening (`/api/payments/airtel-money` & `/api/payments/payout`)**:
   - Enforced JWT authentication on both collection and disbursement actions.
   - Bound transaction accounts strictly to `caller.sub`/`caller.id`, preventing unauthorized balance drainage across driver earnings and passenger referral balances.
   - Updated [wallet.tsx](file:///Users/user/Downloads/Cabi%20Africa Final/web/user_portal/src/pages/wallet.tsx) to provide Bearer token headers during wallet state sync and transaction submission.

6. **Driver SACCO Token Key Integration Fix (`/drivers/sacco/manage`)**:
   - Fixed token retrieval to look up `localStorage.getItem('authToken') || localStorage.getItem('token')`, eliminating 401 Unauthorized errors in SACCO wealth management.

---

## 2. Implementation Checklist

- [x] **Task 1:** Secure `/api/users/profile.ts` with JWT authentication and caller ID matching.
- [x] **Task 2:** Secure `/api/concierge.ts` to restrict ticket listings to authenticated driver ownership.
- [x] **Task 3:** Secure `/api/lost-and-found.ts` with PII sanitization/phone masking and auth checks.
- [x] **Task 4:** Harden `/api/login.ts` and `/api/auth/me.ts` with signed JWTs and `jwt.verify`.
- [x] **Task 5:** Harden `/api/payments/airtel-money.ts` and `/api/payments/payout.ts` with JWT auth and phone ownership checks.
- [x] **Task 6:** Run security scanner script `.agent/skills/vulnerability-scanner/scripts/security_scan.py` to verify all critical findings are resolved.
