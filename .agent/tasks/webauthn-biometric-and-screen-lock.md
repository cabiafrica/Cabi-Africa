# Task: WebAuthn Biometric Passkeys & Zero-Trust Screen Lock

## Overview
Implement:
1. **Adaptive WebAuthn / FIDO2 Passkeys:**
   - Platform authenticator detection (`isUserVerifyingPlatformAuthenticatorAvailable`).
   - Registration challenge and assertion verification (`/auth/webauthn/challenge`, `/auth/webauthn/register`, `/auth/webauthn/verify`).
   - 1-click biometric passkey enrollment in Admin Profile Settings.
   - 1-second biometric unlock with Touch ID, Face ID, or Windows Hello (`/auth/webauthn/quick-unlock`).
   - Dual-channel OTP (Email + SMS) and PIN fallbacks for unsupported workstations.
2. **Zero-Trust Screen Blur Lock:**
   - At 8 minutes idle: 2-minute countdown warning toast.
   - At 10 minutes idle: Full UI blur lock (`backdrop-blur-2xl bg-black/90`) obscuring all PII and map data.
   - Quick-unlock via Touch ID biometric or 6-digit PIN preserves working context (active rides, map state, unsaved forms).
   - At 30 minutes idle: Hard token eviction, cross-tab BroadcastChannel logout, and redirect to login.

## Implementation Details
- Backend:
  - [`libs/backend/user-service/src/user.service.ts`](file:///Users/user/Downloads/Cabi%20Africa%20Final/libs/backend/user-service/src/user.service.ts): `generateWebAuthnChallenge`, `registerWebAuthnCredential`, `verifyWebAuthnAssertion`, `quickUnlockScreen`.
  - [`libs/backend/user-service/src/auth.controller.ts`](file:///Users/user/Downloads/Cabi%20Africa%20Final/libs/backend/user-service/src/auth.controller.ts): Endpoints exposed with `@Public()` decorator.
- Dispatch Panel Client:
  - [`web/dispatch_panel/src/lib/webauthn.ts`](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/dispatch_panel/src/lib/webauthn.ts): Client WebAuthn helper library.
  - [`web/dispatch_panel/src/components/InactivitySentinel.tsx`](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/dispatch_panel/src/components/InactivitySentinel.tsx): Inactivity watcher with biometric and PIN unblur.
- Admin Panel Client:
  - [`web/admin_panel/src/lib/webauthn.ts`](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/admin_panel/src/lib/webauthn.ts): Client WebAuthn helper library.
  - [`web/admin_panel/src/components/common/InactivitySentinel.tsx`](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/admin_panel/src/components/common/InactivitySentinel.tsx): Zero-trust screen lock and eviction.
  - [`web/admin_panel/src/pages/ProfilePage.tsx`](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/admin_panel/src/pages/ProfilePage.tsx): Passkey enrollment UI button and flow.
  - [`web/admin_panel/src/pages/api/profileService.ts`](file:///Users/user/Downloads/Cabi%20Africa%20Final/web/admin_panel/src/pages/api/profileService.ts): WebAuthn challenge and registration client methods.

## Status
Completed & Verified
