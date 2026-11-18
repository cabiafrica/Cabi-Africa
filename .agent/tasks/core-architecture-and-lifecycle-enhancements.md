# Implementation Plan: Core Architecture & Lifecycle Enhancements

> **Objective**: Implement category-aware User Identifier Codes, collision-free Trip Codes, a multi-factor Driver Selection Formula, a multi-rail Mobile Money payment abstraction, and Occurrence Book bug fixes.

---

## 1. Work Breakdown

### Task 1: Human-Readable User Identifier Codes (`userCode`)
- Implement category-aware user code generator:
  - `CB-PAX-XXXXX` (Passenger)
  - `CB-DRV-XXXXX` (Chauffeur)
  - `CB-SAC-XXXXX` (SACCO Official)
  - `CB-FLT-XXXXX` (Fleet Owner)
  - `CB-CRP-XXXXX` (Corporate)
  - `CB-ADM-XXXXX` (Admin)
- Add utility generator with mod-31 checksum avoiding ambiguous characters (`0/O`, `1/I/L`).
- Expose `userCode` in User data returned by APIs and preview mocks.

### Task 2: Collision-Free Trip Identifier & Boarding PIN
- Upgrade `tripCode` generation in `backend/dispatch-service/src/ride/ride.service.ts`.
- Format: `CB-TRP-[YY][HEX_MONTH]-[SEQUENCE]` (e.g. `CB-TRP-26B-48192`) + 4-digit boarding PIN (`4819`).
- Ensure `startRide` verifies either the 4-digit PIN or the full trip code.

### Task 3: Multi-Factor Driver Selection Formula
- In `backend/dispatch-service/src/matching/matching.service.ts`:
  - Calculate fitness score:
    - 35% Distance / Proximity
    - 20% Driver Rating Quality
    - 15% 30-Day Acceptance Rate
    - 15% FIFO Idle Waiting Time (anti-starvation)
    - 10% Badge Tier Priority (Rookie, Star, Road Master, Elite)
    - 5% SACCO Hub Affiliation
    - Minus 50 penalty points for recent driver cancellations
  - Sort candidate drivers by fitness score.

### Task 4: Occurrence Booking System Fixes
- In `backend/dispatch-service/src/ride/ride.service.ts`:
  - Fix `category` ternary bug (eliminate hardcoded `POLICY_VIOLATION`).
  - Add keyword parser for smart category detection (`CRIME`, `HARASSMENT`, `TRAFFIC_OFFENSE`, `SAFETY_VIOLATION`, `FRAUD`, `PROPERTY_DAMAGE`, `MEDICAL_EMERGENCY`, `DISPUTE`, `VEHICLE_ISSUE`).
  - Exclude peaceful 4-5 star ratings from incident logging.
  - Automatically log an Occurrence on cancelled rides with chargeable wait fees or safety dispute reasons.
  - Set default `DISPATCH_TIMEOUT_SECONDS` to 25s (aligning with mobile 20s offer card).
  - Protect pending wait fees so they are only cleared upon successful trip completion/payment.

### Task 5: Multi-Provider Mobile Money Engine
- In `libs/backend/payment-service/src/lib/payment.service.ts` and `backend/dispatch-service/src/ride/ride.service.ts`:
  - Support `MPESA`, `AIRTEL`, `TKASH`, and `MTN_MOMO`.
  - Add phone prefix detector for automatic carrier selection.
  - Add multi-rail payment processing simulation/dispatch.

---

## 2. Verification Criteria
- [x] Driver matching formula outputs prioritized driver rankings based on distance, rating, acceptance, and idle time.
- [x] Trip codes and user codes format correctly with human-readable prefixes.
- [x] Routine 5-star ratings do not create `POLICY_VIOLATION` occurrences.
- [x] Negative feedback with keywords (e.g. "speeding", "overcharge") correctly classifies under `TRAFFIC_OFFENSE` or `FRAUD`.
- [x] Cancellation with wait fee creates an auditable `DISPUTE` occurrence.
- [x] 300m geofence validation on driver arrival with high-drift/legacy bypass.
- [x] Pending wait fee protected across trip lifecycle and restored on cancellation.
- [x] Occurrence Book filters (Category, Severity, Status) active in Admin Panel.
- [x] Lost & Found reports officially registered in Occurrence Book.
