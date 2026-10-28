# Plan: End-to-End Real Market Testing & Mutual Rating / Occurrence System

## 1. Overview & Objective
Enable a full real-market end-to-end trip execution cycle across passenger and driver roles on physical Android devices connected via local Wi-Fi (`192.168.100.35`):
1. **Trip Request**: Passenger selects pickup & dropoff and requests a ride.
2. **Driver Matching & Dispatch**: Nearby online driver receives the dispatch request.
3. **Accept / Pass Option**: Driver can accept or reject/pass the trip. Offer timeout is relaxed to 120s for easy account switching.
4. **Pickup & Transit**: Driver arrives at pickup, starts trip, drives to destination, and completes trip.
5. **Mark as Paid**: Driver marks trip payment as confirmed (cash / external payment).
6. **Mutual Rating & Comment Registration**:
   - Both Passenger and Driver rate each other (1-5 stars) and write comments.
   - Every comment is formally registered in the **Occurrence Book** (`Occurrence` table) linked to the ride, driver, and passenger.
   - User and Driver average ratings and trip statistics are updated.

---

## 2. Technical Architecture & File Map

### A. Backend (`backend/dispatch-service`)
- **[ride.service.ts](file:///d:/IBN/PROJECTS/Cabi%20Africa/backend/dispatch-service/src/ride/ride.service.ts)**:
  - Extend dispatch acceptance timeout from hardcoded 20s to configurable 120s default (`process.env.DISPATCH_TIMEOUT_SECONDS || 120`).
  - Upgrade `ratePassenger` to unified `submitRatingAndFeedback`:
    - Handles both Passenger rating Driver and Driver rating Passenger.
    - Creates formal `Occurrence` record in database:
      - `obNumber`: `OB-REV-${Date.now()}`
      - `category`: `POLICY_VIOLATION` (if <= 2 stars), `SAFETY_VIOLATION`, or `DISPUTE`
      - `severity`: rating <= 1 ? `HIGH` : (rating <= 2 ? `MEDIUM` : `LOW`)
      - `title`: `Trip Rating & Feedback: ${raterRole} -> ${targetRole} (${rating}/5)`
      - `description`: Rating & comment details with timestamp and participants
      - `rideId`, `driverId`, `passengerId`, `registeredById`
      - `status`: rating <= 2 ? `OPEN` : `RESOLVED`
    - Recalculates and persists `averageRating` for `User` and `DriverProfile`.
- **[ride.controller.ts](file:///d:/IBN/PROJECTS/Cabi%20Africa/backend/dispatch-service/src/ride/ride.controller.ts)**:
  - Add/update `POST /rides/:id/rate` to accept `{ rating: number, comment?: string, role?: 'PASSENGER' | 'DRIVER', raterId?: string }`.

### B. Passenger Mobile App (`mobile/passenger_app`)
- **[app_config.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/passenger_app/lib/config/app_config.dart)**:
  - Default `customHost` fallback to `192.168.100.35` when running on physical device on local Wi-Fi.
- **[home_screen_logic.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/passenger_app/lib/screens/home_screen_logic.dart)**:
  - When backend status transitions to `COMPLETED`, prompt navigation to `RateDriverScreen`.
- **[rate_driver_screen.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/passenger_app/lib/screens/rate_driver_screen.dart)**:
  - Connect `_submit()` to `_rideService.submitRating(...)` with rating & comment.
- **[ride_service.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/passenger_app/lib/services/ride_service.dart)**:
  - Provide `submitRating({required String rideId, required double rating, String? comment, String role = 'PASSENGER'})`.

### C. Driver Mobile App (`mobile/driver_app`)
- **[app_config.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/driver_app/lib/config/app_config.dart)**:
  - Default `customHost` fallback to `192.168.100.35` for local Wi-Fi testing.
- **[trip_completion_screen.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/driver_app/lib/services/trip_completion_screen.dart)**:
  - After `confirmCashPayment` succeeds, transition or navigate to `RatingScreen` so the driver can rate and comment on the passenger.
- **[ride_service.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa/mobile/driver_app/lib/services/ride_service.dart)**:
  - Ensure `submitRating` transmits `role: 'DRIVER'` and comment to backend.

---

## 3. GitNexus Impact Analysis Strategy
Before modifying `ride.service.ts` or `ride.controller.ts`:
- Run impact analysis on `ratePassenger`, `confirmCashPayment`, `startMatching`.
- Verify callers and test suites to prevent regression on existing endpoints.

---

## 4. Step-by-Step Implementation Flow
1. ✅ **GitNexus Impact Analysis** on target backend symbols (`submitRating`, `confirmCashPayment`, `startMatching`). Verified LOW risk.
2. ✅ **Backend Dispatch Updates**:
   - `submitRating` with Occurrence Book creation in [ride.service.ts](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/backend/dispatch-service/src/ride/ride.service.ts).
   - Rating endpoint `@Post(':id/rate')` in [ride.controller.ts](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/backend/dispatch-service/src/ride/ride.controller.ts).
   - Configurable 120s dispatch acceptance timeout (`DISPATCH_TIMEOUT_SECONDS || 120`).
3. ✅ **Passenger App Updates**:
   - Implemented `rateDriver` and `submitRating` in [ride_service.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/mobile/passenger_app/lib/services/ride_service.dart).
   - Navigates to `RateDriverScreen` on trip completion in [home_screen_logic.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/mobile/passenger_app/lib/screens/home_screen_logic.dart).
4. ✅ **Driver App Updates**:
   - Connected `TripCompletionScreen` cash payment confirmation to `RatePassengerScreen` with `isCashConfirmed: true` in [trip_completion_screen.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/mobile/driver_app/lib/services/trip_completion_screen.dart).
   - Added `role: 'DRIVER'` in [ride_service.dart](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/mobile/driver_app/lib/services/ride_service.dart).
5. ✅ **Network / Host Configuration**:
   - `AppConfig` in both mobile apps verified with default local host `192.168.100.35`.
6. ✅ **Documentation Updated**:
   - Synced mutual rating Occurrence Book registration in [docs/OCCURRENCE_BOOK_SYSTEM.md](file:///d:/IBN/PROJECTS/Cabi%20Africa%20Final/docs/OCCURRENCE_BOOK_SYSTEM.md).
7. ✅ **End-to-End Test Execution**:
   - Executed live real-market testing across network `192.168.100.35` (`dispatch-service` port 3334 & `auth-gateway` port 3333).
   - Validated entire trip lifecycle with Ride `c1a1d7b3-5c65-4816-aba0-6e03ddea3311` (Trip Code `CB-1414`).
   - Verified Occurrence Book entry generation (`OB-RIDE-439267-2787`), cash settlement confirmation (KES 1,850), and mutual 5-star rating.
