# Task Plan: Comprehensive Security Vulnerabilities Audit & Remediation

> **Goal**: Conduct an in-depth security vulnerability test across the Cabi Africa codebase (OWASP Top 10:2025, zero-trust architecture, access control, input validation, authentication/authorization gaps, secrets, and DoS resilience) and remediate identified vulnerabilities and bugs.
> **Assigned Agent**: `@[security-auditor]`
> **Skills**: `clean-code`, `vulnerability-scanner`, `red-team-tactics`, `api-patterns`

---

## 1. Attack Surface & Threat Model

| Asset / Boundary | Threat Actor | Vectors | Business Risk |
| :--- | :--- | :--- | :--- |
| **Auth Gateway & User Service** | External Attacker / Malicious User | Brute-force OTP, replay OTP, credential stuffing, unauthenticated profile mutation, JWT secret fallback | Account takeover, identity theft, privilege escalation |
| **Verification Service & Driver Leads** | Fraudulent Drivers / Syndicates | Unguarded admin review endpoints (`/api/v1/verification/document/review`), unauthenticated driver approvals (`/driver-leads/:id/approve`), path traversal in uploads, arbitrary PII harvesting | Unvetted drivers operating, fake licenses accepted, mass PII leak |
| **Dispatch & Ride Controller** | Malicious Passenger / Rogue Driver | Unauthenticated ride lifecycle endpoints (`/rides/:id/cancel`, `/rides/:id/complete`, `/rides/:id/confirm-cash`), IDOR on trip query | Financial fraud, driver starvation, unauthorized cancellations, cash theft |
| **Referral & SACCO Ledger** | Dishonest Actors / Attackers | Unguarded ledger credit endpoint (`/admin/referral/adjust-ledger`), unauthenticated group deletion, timing attacks on webhook secrets | Unbacked ledger creation, financial loss, money laundering |
| **Web Frontends (User Portal & Dispatch)** | Malicious Authors / Web Attackers | Ineffective regex HTML sanitization in blog, innerHTML injections in undockable monitors | Stored XSS, session hijacking, defacement |

---

## 2. Identified Vulnerabilities & Severity Classification

### Critical (P0) - Immediate Remediation
1. **Unguarded Document & Biometric Review Endpoints (`backend/verification-service`)**:
   - `POST /api/v1/verification/document/review` has no authentication or admin authorization. Anyone can approve fake IDs and licenses.
   - `GET /api/v1/verification/document/user/:userId` exposes all driver verification docs and extracted PII to unauthenticated callers.
   - `POST /api/v1/verification/document/upload` accepts arbitrary `userId` in body without verifying that the caller owns the account.
2. **Unguarded Driver Approval & Simulation Endpoints (`backend/driver-lead-service`)**:
   - `POST /driver-leads/:id/approve` and `POST /driver-leads/:id/reject` have no authentication or admin role check.
   - `GET /driver-leads/pending` dumps all pending driver leads and PII without authentication.
   - `PUT /api/users/:userId/profile`, `PUT /api/users/:userId/privacy`, and `POST /api/users/:userId/2fa/disable` allow anyone to modify any user's profile and disable their 2FA without auth!
3. **Unguarded Referral Ledger Adjustment (`backend/referral-service`)**:
   - `POST /admin/referral/adjust-ledger` and `POST /admin/referral/process-registration-fee` have no authentication or role check. Anyone can credit drivers with arbitrary funds.
   - `backend/referral-service/src/app/driver-groups/driver-groups.controller.ts` allows unauthenticated creation, assignment, and deletion of driver groups.

### High (P1)
4. **XSS in Blog Rendering & Ineffective Regex Sanitizer (`web/user_portal/src/pages/blog/[slug].tsx`)**:
   - Replaced weak regex sanitizer with `isomorphic-dompurify` (already installed in package dependencies) to prevent XSS payloads (`<svg/onload=...>`, attribute bypasses, encoded schemes).
   - Sanitize JSON-LD structured data against script tags (`</script>`).
5. **DOM XSS Hygiene in Undockable Monitors (`web/dispatch_panel/src/hooks/useUndockableWindow.ts`)**:
   - Replaced `childDoc.head.innerHTML` and `topBar.innerHTML` with safe DOM element creation (`createElement`, `textContent`, `setAttribute`).
6. **Timing Attacks & Insecure Webhook Signature Verification (`libs/backend/mpesa-service`)**:
   - Webhook secret check uses plain `!==` instead of constant-time `crypto.timingSafeEqual`.
   - Fail-open condition when `MPESA_WEBHOOK_SECRET` is unset in non-prod.
7. **OTP Replay & Brute Force Gaps (`backend/driver-lead-service/src/driver-leads/user-management.service.ts`)**:
   - `verifyForgotEmail` does not invalidate OTP after successful verification, allowing OTP replay until expiry.
   - No rate limiting or max attempt counter on OTP verification.
8. **Insecure JWT Default Secrets (`backend/driver-lead-service/src/driver-leads.module.ts`)**:
   - Hardcoded fallback secret `'your-super-secret-key-that-is-long'`. Must enforce strong secret verification and forbid default secrets in production.
9. **AdminPermissionGuard Non-Admin Block Bug (`libs/backend/admin-service/src/admin-permission.guard.ts`)**:
   - Checked `user.identityVerified` before checking if the route actually requires permissions (`!required`), blocking non-admin authenticated users across the app.

### Medium (P2)
10. **Unbounded RateLimitMiddleware & Missing Application (`libs/backend/common`)**:
    - RateLimitMiddleware memory map grows indefinitely without eviction (OOM DoS risk).
    - Rate limiting not applied to Auth Gateway or sensitive endpoints.
11. **Path Traversal Risk in Verification Uploads (`backend/verification-service`)**:
    - File upload filename constructed using unvalidated inputs; ensure strict sanitization of filename, mimetype, and extension.

---

## 3. Remediation Roadmap

- [x] **Step 1: Fix Web Frontend XSS & DOM Security**
  - Implemented `DOMPurify.sanitize` in `web/user_portal/src/pages/blog/[slug].tsx` with strict tag and attribute whitelisting.
  - Escaped `<` characters in JSON-LD `dangerouslySetInnerHTML` output to eliminate script tag breakout attacks.
  - Replaced `innerHTML` with safe DOM element construction in `web/dispatch_panel/src/hooks/useUndockableWindow.ts`.
- [x] **Step 2: Fix Auth & Permission Guards in `admin-service` and `user-service`**
  - Fixed `AdminPermissionGuard` ordering bug so `identityVerified` is only enforced on admin routes requiring verification, not regular authenticated endpoints.
  - Replaced fallback JWT secret strings with production-enforced entropy validation in `resolveJwtSecret`.
  - Replaced hardcoded fallback secrets with `resolveJwtSecret()` in `backend/driver-lead-service/src/driver-leads.module.ts`.
- [x] **Step 3: Secure `verification-service` Endpoints & File Uploads**
  - Added strict path traversal defenses in `document-verification.service.ts` and `biometric-verification.service.ts` with alphanumeric sanitization, MIME-type whitelisting, and directory boundary verification.
  - Added JWT authentication & Admin RBAC verification to review, list, and user document endpoints in `document-verification.controller.ts`, `biometric-verification.controller.ts`, and `passenger-verification.controller.ts`.
  - Enforced that callers can only access or upload documents under their own user identity (`assertSelfOrAdmin`).
- [x] **Step 4: Secure `driver-lead-service` Endpoints**
  - Protected `/driver-leads/:id/approve`, `reject`, `pending`, and `simulate` with admin checks in `driver-leads.controller.ts`.
  - Protected `user-profile.controller.ts` with user identity ownership checks (`assertSelfOrAdmin`), preventing unauthorized profile modifications and 2FA deactivations.
  - Protected driver document management endpoints in `driver-document.controller.ts`.
  - Secured OTP generation with `crypto.randomInt`, implemented constant-time verification (`crypto.timingSafeEqual`), and immediate OTP invalidation upon verification in `user-management.service.ts` to eliminate replay attacks.
- [x] **Step 5: Secure `referral-service` & `sacco-service` Endpoints**
  - Protected `adjust-ledger`, `process-registration-fee`, `ledger`, `dashboard`, and configuration with administrative auth guards and timing-safe API key verification in `referral.controller.ts`.
  - Protected all driver group CRUD and driver assignment endpoints in `driver-groups.controller.ts`.
  - Protected driver organization endpoints (`driver-organization.controller.ts`) and all driver financial allocation, consent OTP, wealth programs, and remittance balance endpoints (`sacco.controller.ts`).
- [x] **Step 6: Secure `mpesa-service` Webhooks & Payment Rails**
  - Used constant-time buffer comparison (`crypto.timingSafeEqual`) for webhook secrets.
  - Enforced fail-closed behavior in production.
  - Added Kenyan MSISDN regex format validation and strict bounds checking (KES 1 to 250,000) in `initiateStkPush`.
- [x] **Step 7: Harden Rate Limiting, OWASP Security Headers & Dispatch Lifecycle**
  - Added bounded client tracking (`MAX_CLIENTS = 10000`), automatic pruning of expired entries, LRU/FIFO cleanup to prevent memory exhaustion (DoS) in `RateLimitMiddleware`.
  - Added route tiering (stricter 20 req/min for auth/OTP/financial routes vs 120 req/min standard).
  - Registered `RateLimitMiddleware` and OWASP security headers (`nosniff`, `SAMEORIGIN`, `X-XSS-Protection`, `Strict-Transport-Security`, removal of `X-Powered-By`) across all microservices (`auth-gateway`, `dispatch-service`, `sacco-service`, `referral-service`, `verification-service`, `driver-lead-service`).
  - Protected all ride dispatch lifecycle endpoints in `backend/dispatch-service/src/ride/ride.controller.ts`, `dispatch.controller.ts`, `safety.controller.ts`, `scheduled_ride.controller.ts`, and `badge.controller.ts` with caller authentication and ownership checks.
- [x] **Step 8: Verification & Automated Security Tests**
  - Automated security scan executed (`security_scan.py`): 0 Critical findings, 0 high findings in active application code.
  - Automated test runner executed (`test_runner.py`): Passed.
  - Automated lint runner executed (`lint_runner.py`): Passed.
  - Monorepo syntax and type checks verified.
