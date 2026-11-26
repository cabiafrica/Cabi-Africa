# Dual-Channel (Email & SMS) Verification on Registration

## Problem Statement
When users register on any level (passengers, drivers, prospects, organizations), they need to receive a verification code via both Email and SMS (resilient multi-cast). Currently:
- Registration only issues an SMS OTP call and completely omits email dispatch.
- `UserModule` binds `SmsProvider` and `EmailProvider` to `MockSmsProvider` and `MockEmailProvider` (`console.log` only).
- `verifyOtp` strictly requires `phone` and only checks `phoneOtpCode`, ignoring `email` verification.
- Driver lead registration (`createProspect`) does not generate or dispatch verification codes.

## Status
✅ Complete & Fully Audited (2026-11-26)

- Production dual-channel providers implemented in `libs/backend/common` (`ProductionSmsProvider`, `ProductionEmailProvider`).
- Bound in `UserModule` (`libs/backend/user-service/src/user.module.ts`).
- Dual-channel multi-cast (SMS + Email) implemented across Passenger, Driver, Prospect, Organization, and Admin registration & login.
- Dual-channel verification implemented in `verifyOtp` and `verifyAdminIdentity`. Both `isPhoneVerified: true` and `isEmailVerified: true` are set on success.
- Admin Panel (`web/admin_panel`) and Dispatch Panel (`web/dispatch_panel`) enforce the 2FA PIN challenge for all staff accounts in any capacity.
- Interception in `POST /api/auth/login` redirects admin and dispatch operators into the 2FA challenge flow.

1. **Production Providers (`libs/backend/common`):**
   - Implement `ProductionSmsProvider` implementing `SmsProvider` with live Africa's Talking integration (`AT_USERNAME`, `AT_API_KEY`, `AT_SENDER_ID`) and fallback logging.
   - Implement `ProductionEmailProvider` implementing `EmailProvider` with Nodemailer SMTP transport (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) and Ethereal/JSON fallback.
   - Export both in `libs/backend/common/src/index.ts`.

2. **User Module Configuration (`libs/backend/user-service/src/user.module.ts`):**
   - Bind `SmsProvider` to `ProductionSmsProvider`.
   - Bind `EmailProvider` to `ProductionEmailProvider`.

3. **Dual-Channel Registration Dispatch (`libs/backend/user-service/src/user.service.ts`):**
   - In `registerPassenger`:
     - Generate cryptographically secure 6-digit OTP.
     - Store OTP in both `phoneOtpCode` + `phoneOtpExpires` AND `forgotEmailOtp` + `forgotEmailOtpExpires`.
     - Resiliently multi-cast OTP to BOTH Phone (SMS) and Email via `Promise.allSettled()`.
   - In `createProspect` (Driver Lead Registration):
     - Generate 6-digit OTP and populate `phoneOtpCode`, `phoneOtpExpires`, `forgotEmailOtp`, `forgotEmailOtpExpires`.
     - Dispatch dual-channel SMS and Email.

4. **Unified Verification Endpoint (`libs/backend/user-service`):**
   - Update `verify-otp.dto.ts` to allow `phone` OR `email` alongside `otpCode`.
   - Update `verifyOtp` in `user.service.ts` to look up user by either `phone` or `email`.
   - On successful OTP match, mark BOTH `isPhoneVerified: true` AND `isEmailVerified: true` and set status to `'ACTIVE'`.
   - In `auth.controller.ts`, update `@Post('verify-otp')` to pass the identifier (phone or email) and code.

5. **Synchronization with Obsidian Vault:**
   - Update notes in `01-System Architecture & Engineering` to document the unified dual-channel verification flow.
