# Task: Audit, Fix, and Modernize Admin Panel Settings & Configurations

**Status:** IN_PROGRESS  
**Created:** 2026-11-18  
**Owner:** Orchestrator  

---

## 1. Overview & Objectives

Comprehensive audit and modernization of the Cabi Africa Admin Panel settings and configuration subsystem (`web/admin_panel`) and backend microservices (`backend/dispatch-service`, `auth-gateway`, and `libs/backend/settings`).

### Key Deliverables:
1. **Fix Critical Environment & Auth Header Bugs:**
   - Resolve `VITE_DISPATCH_API_URL` vs `VITE_DISPATCH_SERVICE_URL` disconnect across `AppSettingsManagement`, `WelfareSchemeManagement`, and `LegacyPrograms.tsx`.
   - Ensure all `fetch` and Axios requests attach `Authorization: Bearer <token>` from `localStorage.getItem('authToken') || localStorage.getItem('token')`.
   - Fix auth token key mismatch in `SaccoIntegrationHub`.
2. **Eliminate Non-Persistent Mocks:**
   - Connect `PromotionalConfig.tsx` to real backend APIs via `adminService.getPromoConfig()` and `adminService.updatePromoConfig()`.
   - Connect `GamificationManagement.tsx` to real persistent settings with proper authorization and UI feedback.
   - Add missing `saccoMatchingPool.enabled` toggle in `ReferralConfiguration.tsx`.
3. **Backend Optimization:**
   - Expose bulk `@Get('system')` in `libs/backend/settings/src/settings.controller.ts` so all system settings load in a single batch.
4. **App Settings Overhaul (`AppSettingsManagement.tsx`):**
   - Transform `AppSettingsManagement` into a modern, multi-tab configuration hub:
     - **General & External:** Tours URL, app links, default currency/locales.
     - **Dispatch & Radius:** Search radius (km), bid/offer timeout (sec), max reassignment retries.
     - **Fares, Pricing & Safety:** Wait time fee & grace period, max surge multiplier cap, platform commission rate.
     - **Cancellations & Penalties:** Free cancellation window, passenger cancellation fee, driver cancellation penalty.
     - **Safety & Hotlines:** Police emergency number, Cabi 24/7 incident control room phone & WhatsApp desk, auto-record toggle.
     - **System Maintenance & App Version:** Maintenance mode toggle, maintenance banner message, minimum supported mobile app version.
5. **Quality Assurance & Verification:**
   - Type-check and verify code integrity.
   - Run linter/validator tests.

---

## 2. Impact Analysis & Blast Radius

| Component / File | Changes | Callers / Dependencies | Risk Level |
|---|---|---|---|
| `libs/backend/settings/src/settings.controller.ts` | Add `@Get('system')` before `@Get('system/:key')` | Admin Panel settings fetch, Dispatch service | LOW (additive endpoint) |
| `web/admin_panel/src/services/dispatchApiClient.ts` | New unified client for dispatch service | `AppSettingsManagement`, `WelfareSchemeManagement`, etc. | LOW (isolated helper) |
| `web/admin_panel/src/components/settings/AppSettingsManagement.tsx` | Full redesign with multi-tab configs, auth headers, error handling | Route `/app-settings`, Admin layout | MEDIUM (UI & API interaction) |
| `web/admin_panel/src/components/settings/WelfareSchemeManagement.tsx` | Fix URL resolution and add Bearer auth headers | Route `/welfare-schemes` | LOW (bugfix only) |
| `web/admin_panel/src/pages/LegacyPrograms.tsx` | Fix URL resolution and add Bearer auth headers | Route `/legacy-programs` & `/wealth-programs` | LOW (bugfix only) |
| `web/admin_panel/src/pages/sacco/SaccoIntegrationHub.tsx` | Fix `token` -> `authToken` key lookup | Route `/sacco-integration` | LOW (bugfix only) |
| `web/admin_panel/src/components/PromotionalConfig.tsx` | Connect to `adminService` promo config API | Route `/promo-config` | LOW (replace mock with API) |
| `web/admin_panel/src/components/settings/GamificationManagement.tsx` | Connect save and data fetch to persistent settings | Route `/gamification` | LOW (replace mock with persistent API) |
| `web/admin_panel/src/components/ReferralConfiguration.tsx` | Add UI switch for `saccoMatchingPool.enabled` | Route `/referral-config` | LOW (UI field addition) |

---

## 3. Step-by-Step Implementation Plan

### Step 1: Backend Settings Controller Update
- Update `libs/backend/settings/src/settings.controller.ts` to add `@Get('system')` to return all settings via `this.settingsService.getAllSystemSettings()`.

### Step 2: Create Unified Dispatch API Helper in Admin Panel
- Create `web/admin_panel/src/services/dispatchApiClient.ts`:
  - Resolves base URL dynamically: `import.meta.env.VITE_DISPATCH_SERVICE_URL || import.meta.env.VITE_DISPATCH_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3334/api'`.
  - Normalizes `/api` suffix.
  - Automatically attaches `Authorization: Bearer <token>` from `localStorage.getItem('authToken') || localStorage.getItem('token')`.

### Step 3: Fix Welfare Schemes & Wealth Creation Pages
- In `WelfareSchemeManagement.tsx`:
  - Use the unified client or authenticated fetch helper to pass Bearer token and resolved base URL.
- In `LegacyPrograms.tsx`:
  - Use authenticated fetch helper for all `${DISPATCH_API_BASE}` calls.
- In `SaccoIntegrationHub.tsx`:
  - Update token retrieval to `localStorage.getItem('authToken') || localStorage.getItem('token')`.

### Step 4: Overhaul App Settings (`AppSettingsManagement.tsx`)
- Implement comprehensive settings management:
  - Tab 1: Dispatch & Search Parameters (Search radius, offer timer, max retries).
  - Tab 2: Pricing & Wait Fees (Wait fee per minute, grace period, max surge cap, commission rate).
  - Tab 3: Cancellation Policies (Passenger grace period, passenger cancel fee, driver penalty).
  - Tab 4: Safety & Emergency (SOS hotline, WhatsApp desk, control room phone, auto-audio recording).
  - Tab 5: Platform & App Version (Maintenance mode, banner message, minimum supported app version, external tours URL).
  - Include batch load from `/settings/system` with fallback defaults, single-click save, dirty-state indicators, and clear toast feedback.

### Step 5: Connect Promotional & Gamification Configs
- In `PromotionalConfig.tsx`:
  - Replace mock `setTimeout` with `adminService.getPromoConfig()`, `adminService.updatePromoConfig()`, and `adminService.getBadges()`.
- In `GamificationManagement.tsx`:
  - Update `fetchSaccoData` and `handleSave` to authenticate and persist settings via backend endpoints (`/settings/system/gamification_config`).
- In `ReferralConfiguration.tsx`:
  - Add UI switch for `saccoMatchingPool.enabled`.

### Step 6: Testing & Verification
- Verify build and types in `web/admin_panel`.
- Confirm all files are clean, no leftover mocks, no missing auth headers.
