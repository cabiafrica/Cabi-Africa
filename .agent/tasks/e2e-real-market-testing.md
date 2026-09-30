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
1. **GitNexus Impact Analysis** on target backend symbols.
2. **Backend Dispatch Updates**:
   - Implement `submitRating` with Occurrence Book creation in `ride.service.ts`.
   - Update `ride.controller.ts`.
   - Adjust `assignmentExpiresAt` to 120s in `ride.service.ts`.
3. **Passenger App Updates**:
   - Implement rating submission in `rate_driver_screen.dart` and `ride_service.dart`.
   - Trigger rating screen on trip completion in `home_screen_logic.dart`.
4. **Driver App Updates**:
   - Connect `TripCompletionScreen` payment confirmation to `RatingScreen`.
5. **Network / Host Configuration Verification**:
   - Ensure local IP `192.168.100.35` is ready and accessible.
6. **Obsidian Vault Sync**:
   - Document new Occurrence booking registration and E2E testing architecture in `D:\IBN\iBN-Cabi Vault`.
7. **End-to-End Test Execution**:
   - Walk through the full market test on the Android device.
