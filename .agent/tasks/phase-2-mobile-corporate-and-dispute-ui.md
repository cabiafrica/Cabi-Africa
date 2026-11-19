# Phase 2: Mobile UI Screens for Corporate Billing & Dispute Resolution

**Status:** Completed ✅  
**Owner:** @mobile-developer & @clean-code  
**Date:** 2026-11-19  
**Scope:** Passenger Corporate Profile Selection at Checkout, Trip Dispute & Trajectory Anomaly Resolution Screen, and Driver 48-Hour Dispute Appeal Screen  

---

## 1. Objectives & Scope

1. **Passenger Corporate Billing Selector Widget (`mobile/passenger_app/lib/widgets/corporate_billing_selector.dart`)**:
   - Seamless checkout component integrated into `ride_confirmation_panel.dart`.
   - Toggle between "Personal Payment" and "Corporate Account".
   - Dynamic Cost-Center dropdown with live remaining quota progress bar.
   - Business travel purpose input with validation.
   - Budget exceedance warnings (notifies user if trip exceeds quota and falls back to personal card).
2. **Passenger Trip Dispute & Detour Recalculation Screen (`mobile/passenger_app/lib/screens/trip_dispute_screen.dart`)**:
   - Entry point from `trip_detail_screen.dart` ("Dispute Fare / Report Detour").
   - Fetches trajectory analysis via `GET /api/disputes/assess/:tripId`.
   - Compares optimal Haversine route vs actual recorded GPS route with detour percentage badge.
   - Discloses recalculated fair fare and exact claimable overcharge.
   - Dispatches claim to `POST /api/disputes/file`.
   - Displays instantaneous Voucher reward card for Tier 1 claims ($\le 2$ claims in 30 days and $\le \text{KES } 500$) or Senior Adjudication SLA banner for Tier 2 claims.
3. **Driver Dispute Appeal Screen (`mobile/driver_app/lib/screens/driver_dispute_appeal_screen.dart`)**:
   - Real-time notification card and modal for flagged route detours.
   - Visual 48-hour SLA countdown indicator.
   - Justification selector (Traffic, Police Checkpoint, Road Closure, Passenger Request).
   - Detailed statement input and dispatch to `POST /api/disputes/:id/appeal`.

---

## 2. Implementation Roadmap

- [x] **Step 1: Corporate Billing Selector Widget** (`mobile/passenger_app/lib/widgets/corporate_billing_selector.dart`)
- [x] **Step 2: Integrate Corporate Selector into Ride Confirmation Panel** (`mobile/passenger_app/lib/widgets/ride_confirmation_panel.dart`)
- [x] **Step 3: Passenger Trip Dispute Screen** (`mobile/passenger_app/lib/screens/trip_dispute_screen.dart`)
- [x] **Step 4: Integrate Dispute Trigger into Passenger Trip Details** (`mobile/passenger_app/lib/screens/trip_detail_screen.dart`)
- [x] **Step 5: Driver Dispute Appeal Screen** (`mobile/driver_app/lib/screens/driver_dispute_appeal_screen.dart`)
- [x] **Step 6: Quality Control, Purple Ban Verification & Security Scan**
  - Zero purple/violet tokens (adheres strictly to Cabi green `#00A859`, charcoal `#1E2022`, amber `#FFB800`).
  - Zero critical/high security vulnerabilities.
