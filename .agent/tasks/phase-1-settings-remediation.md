# Phase 1: Settings Screen Audit & Hardening Task Plan

**Status:** Completed  
**Owner:** @mobile-developer & @backend-specialist  
**Date:** 2026-11-18  

---

## 1. Objectives

Remediated critical compliance risks, missing backend synchronization, theme breaks, and developer diagnostic leaks identified in the Settings screens audit:

1. **Self-Service Account Deletion (Apple Guideline 5.1.1(v) & Kenya DPA Compliance)**:
   - Backend: Implemented soft-delete `DELETE /users/:id` and `DELETE /users/me` on `user-service` with immediate PII anonymization, active trip guards, token invalidation, and 30-day grace period.
   - Passenger App: Connected `privacy_settings_screen.dart` and `settings_screen.dart` to `AccountDeletionScreen`. Updated `AccountDeletionScreen` to call real deletion API, clear secure tokens, and follow Obsidian/Porcelain design tokens.
   - Driver App: Connected `AccountDeletionScreen` into Driver Settings under `DRIVER SAFETY & SUPPORT`. Updated to call real deletion API and follow Obsidian/Porcelain design tokens.

2. **Driver Back-to-Back Dispatch Synchronization**:
   - Backend: Added `PATCH /dispatch/drivers/:driverId/preferences` and `GET /dispatch/drivers/:driverId/preferences` to `dispatch-service` to persist `allowBackToBack` in driver preferences.
   - Driver App: Updated `SettingsScreen` in `driver_app` to call `PATCH /dispatch/drivers/me/preferences` with local cache fallback.

3. **Design System & Dark Mode Consistency**:
   - Passenger App: Modernized `privacy_settings_screen.dart` to eliminate hardcoded light colors and support Obsidian Night / Porcelain Day themes.
   - Driver App: Modernized `support_screen.dart` to eliminate hardcoded white background/appbar and support Obsidian/Porcelain themes.

4. **Production Cleanliness & Developer Diagnostics**:
   - Passenger App: Removed public `QR Integration Test` from Settings list; gated behind 7-tap gesture on version footer.

---

## 2. Implementation Progress

- [x] Task 1: Backend `user-service` account deletion logic (`deleteAccount`) in `user.service.ts` and `user.controller.ts`.
- [x] Task 2: Backend `dispatch-service` driver preferences endpoint and matching support.
- [x] Task 3: Mobile `passenger_app` account deletion screen, privacy settings modernization, and 7-tap QR test gating.
- [x] Task 4: Mobile `driver_app` account deletion screen, settings integration, and support screen theme modernization.
- [x] Task 5: Mobile `driver_app` back-to-back preference API client sync.
- [x] Task 6: Audit checklist validation & documentation.
