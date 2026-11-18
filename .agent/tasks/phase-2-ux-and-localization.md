# Phase 2: UX, Localization & Hardware Polish Task Plan

**Status:** Completed  
**Owner:** @mobile-developer  
**Date:** 2026-11-18  

---

## 1. Objectives

1. **Full Localization Across All 8 Languages (`core_ui`)**:
   - Added new localized getters in `cabi_localizations.dart` for settings headers and tiles: `externalNavigation`, `safetyCommandCenter`, `deleteAccount`, `tripAudioChimes`, `biometricIdentity`, `dataPrivacy`, `soundPresetCharacter`.
   - Populated translations for English (`en`), Swahili (`sw`), French (`fr`), Arabic (`ar`), Portuguese (`pt`), Amharic (`am`), Yoruba (`yo`), and Hausa (`ha`).
   - Wired all settings section headers and navigation tiles to `l10n` in both `passenger_app` and `driver_app`.

2. **Turn-by-Turn External Navigation App Selector (Driver App)**:
   - Added `_buildExternalNavSelector` to Driver Settings with options for Google Maps, Waze, and Cabi In-App HUD.
   - Persisted driver navigation choice in `SharedPreferences` (`cabi_driver_external_nav`).

3. **Vehicle Fleet & Shift Management Integration**:
   - Linked `VehicleAccountScreen` directly inside Driver Settings under `VEHICLE & FLEET MANAGEMENT`.
   - Allows captains to view active vehicle assignments, maintenance ledger, and shift incentives directly from Settings.

4. **Audio Preset Differentiation (Fix Placebo Bug)**:
   - Updated `AudioNotificationService.play()` in both apps so presets produce distinct acoustic and haptic feedback:
     - `modern`: Crisp harmonic click + alert with dual haptic feedback.
     - `bell`: Soft resonant chime with lingering double alert and heavy impact.
     - `digital`: Fast tactical pulse sequence with rhythmic haptic bursts.

---

## 2. Implementation Progress

- [x] Task 1: Add new settings localization keys and 8-language translations to `libs/core_ui/lib/src/localization/cabi_localizations.dart`.
- [x] Task 2: Implement External Navigation App Selector in `mobile/driver_app/lib/screens/settings_screen.dart`.
- [x] Task 3: Link `VehicleAccountScreen` into Driver Settings.
- [x] Task 4: Fix audio preset placebo bug in `AudioNotificationService` across both mobile apps.
- [x] Task 5: Wire full `l10n` localization to Passenger and Driver Settings screens.
- [x] Task 6: Master checklist validation.
