# Implementation Plan: Cabi Multi-Tier Referral Program & Fraud Detection Engine

> **Objective**: Implement an end-to-end, multi-tier referral distribution and fraud prevention system for Cabi Africa. Fulfill role-based referral constraints (driver-to-driver only, passenger-to-both), trip-activity funded commissions (2% L1 / 1% L2 driver earnings from platform fees, 2% L1 / 1% L2 passenger spending, passenger-referring-driver trip milestone rewards), 24-48h escrow delay, hardware device fingerprinting, collusion detection (>30% rides), badge qualification with grandfathering, and an auditable notification system.

---

## 1. Executive Summary & Audit Findings

### A. Critical Bugs Identified in Existing Codebase
1. **Upline Disconnect (`User.referredById` vs `DriverProfile.referrerId`)**:
   - `applyReferralCode` only updates `User.referredById`. `DriverProfile.referrerId` is never set during registration or code application, breaking driver upline tree queries.
2. **Missing Role Validation**:
   - Rule 1 requires *Drivers can refer drivers only*. The current endpoint allows drivers to refer passengers without restriction.
3. **Broken Passenger Earnings Pipeline**:
   - Mobile passenger app calls `/admin/referral/my-commissions?driverId=$userId`. The query requires a `driverId` foreign key on `CommissionLedger`, causing passenger referral earnings to fail or return 0.
4. **Invalid Funding Source (Registration Fees vs Trip Activities)**:
   - Current logic computes commissions from driver registration fees (`processRegistrationFee`). Business requirement states: *No welcome discount; 100% of money is distributed from trip activities*.
5. **No Escrow or Dispute Buffer**:
   - Commission entries are marked final immediately, with no `PENDING_REVIEW` escrow window (24–48 hours) to handle refunds, chargebacks, or fraudulent collusion.

### B. Structural Gaps
1. **Prisma Schema Gaps**:
   - `CommissionLedger` is driver-only and lacks `status`, `releaseAt`, `tripId`, `disqualificationReason`, and `isFraudSuspended`.
   - No `ReferralRelationship` table tracking attribution timestamp, level (L1/L2), user role pair, and grandfathered status.
   - No `InAppNotification` table for persisting disqualification/badge-drop events for conflict resolution.
   - No hardware fingerprint (`deviceId`, `imei`) tracking on `User` or `LoginHistory`.
2. **Missing Commission Hook in Ride Completion**:
   - `backend/dispatch-service/src/commission/commission.service.ts` calculates platform commission (18%) and driver net, but does not deduct referral rewards or invoke the referral engine.
3. **Missing Fraud Detection Interceptor**:
   - No check for hardware device collision on signup/referral.
   - No check for trip collusion (>30% of driver trips taken with referrer).

---

## 2. Work Breakdown & Implementation Roadmap

### Phase 1: Database Schema & Entity Modeling
- **Location**: `libs/backend/database/prisma/schema.prisma` and `web/user_portal/prisma/schema.prisma`
- **Tasks**:
  1. Add `ReferralStatus` enum: `PENDING_REVIEW`, `AVAILABLE`, `DISQUALIFIED`, `CANCELLED`, `FROZEN_FRAUD`.
  2. Add `ReferralType` enum: `DRIVER_TO_DRIVER`, `PASSENGER_TO_PASSENGER`, `PASSENGER_TO_DRIVER`.
  3. Create `ReferralRelationship` model:
     - `id`, `referrerId`, `refereeId`, `type`, `level` (1 or 2), `isActive`, `isGrandfathered`, `qualifiedBadgeId`, `driverMilestoneTripsCompleted`, `driverMilestoneTripsRequired`, `isMilestoneAwarded`, `createdAt`.
  4. Upgrade `CommissionLedger` (or create unified `ReferralCommissionLedger`):
     - Support both `userId` (for passengers) and `driverProfileId` (for drivers).
     - Fields: `amount`, `status`, `releaseAt`, `relatedTripId`, `level`, `calculationBasis` (driver earnings or passenger spending), `platformFeeDeducted`, `disqualificationReason`.
  5. Add hardware identifiers to `User`:
     - `deviceId`, `imeiHash`, `registrationIp`.
  6. Create `NotificationLog` model:
     - `id`, `userId`, `title`, `body`, `type` (`BADGE_DISQUALIFICATION`, `COMMISSION_EARNED`, `FRAUD_ALERT`), `channel` (`IN_APP`, `EMAIL`), `metadata` (JSON), `createdAt`.
  7. Create `ReferralFraudAlert` model:
     - `id`, `userId`, `relatedUserId`, `ruleViolated` (`DEVICE_FINGERPRINT_MATCH`, `COLLUSIVE_TRIP_DENSITY`, `CYCLIC_REFERRAL`), `severity`, `status`, `createdAt`.

---

### Phase 2: Core Referral & Fraud Detection Engine
- **Location**: `backend/referral-service/src/app/`
- **Tasks**:
  1. **Attribution & Validation (`applyReferralCode`)**:
     - Check: User cannot refer themselves.
     - Check: Driver can ONLY refer drivers. Reject if referrer is DRIVER and referee is PASSENGER.
     - Check: Passenger can refer both passengers and drivers.
     - Fraud Check 1 (Hardware Fingerprint): Reject if `deviceId` or `imeiHash` matches referrer.
     - Fraud Check 2 (Cyclic Loop): Check downline tree to ensure referee does not already exist upstream.
     - Check: Driver L1 referral cap (max 10 drivers) and L2 referral cap (max 100 drivers).
     - Link both `User.referredById` and `DriverProfile.referrerId` when referee is a driver.
     - Record snapshot of referrer's active badge for grandfathering.
  2. **Trip-Activity Referral Processor (`processTripReferral`)**:
     - Input: `tripId`, `passengerId`, `driverProfileId`, `fare`, `platformCommission`, `driverEarnings`.
     - Check disqualifying criteria:
       - Fare below threshold (e.g. < KES 250).
       - Heavily discounted or zero platform commission.
     - **Driver Referral Split**:
       - L1 Referrer: 2% of `driverEarnings` (if referrer has < 10 active L1 drivers & badge qualified/grandfathered).
       - L2 Referrer: 1% of `driverEarnings` (if referrer has < 100 active L2 drivers & badge qualified/grandfathered).
       - Deducted from `platformCommission` (capped at max 40% of platform net to prevent negative platform margin).
     - **Passenger Referral Split**:
       - Only if `passengerPromo.enabled` is `true`.
       - L1 Referrer: 2% of passenger `fare` (uncapped).
       - L2 Referrer: 1% of passenger `fare` (uncapped).
       - Passenger CANNOT earn from driver earnings.
     - **Passenger Referring Driver Milestone Check**:
       - Increment `driverMilestoneTripsCompleted` on `ReferralRelationship`.
       - If driver reaches $N$ completed trips (e.g. 10 trips):
         - Issue flat wallet credit/voucher (e.g. KES 500) to passenger.
     - Create ledger entries in `PENDING_REVIEW` with `releaseAt = now() + 24 to 48 hours`.
  3. **Trip Diversity / Collusion Guard**:
     - Calculate ratio: `rides_between(driver, referrerPassenger) / driver.total_completed_rides`.
     - If ratio > 30% (and total trips >= 5):
       - Trigger `ReferralFraudAlert` (`COLLUSIVE_TRIP_DENSITY`).
       - Immediately suspend referral payouts for this pair.
  4. **Badge Qualification & Grandfathering Monitor**:
     - Compare referrer's current badge against `referral_config.requiredBadgeId`.
     - If badge dropped:
       - Pause rewards for non-grandfathered relationships.
       - Allow grandfathered relationships to continue earning.
       - Dispatch in-app notification & email via `NotificationService`.
       - Persist entry in `NotificationLog` table.
  5. **Escrow Release Scheduler (`releasePendingEscrow`)**:
     - Scheduled cron (e.g. every hour or nightly batch).
     - Finds all `PENDING_REVIEW` entries where `releaseAt <= now()` and `isFraudSuspended = false`.
     - Transitions status to `AVAILABLE` and credits user's spendable/withdrawable balance.

---

### Phase 3: Integration with Dispatch & Ride Settlement
- **Location**: `backend/dispatch-service/src/ride/ride.service.ts` & `backend/dispatch-service/src/commission/`
- **Tasks**:
  1. Update `CommissionService.calculateTripPayout` to account for referral commission reserve deducted from `platformCommission`.
  2. On ride status transitioning to `COMPLETED`:
     - Call `referralService.processTripReferral(...)`.
     - Log referral deductions in `TransactionLedger`.

---

### Phase 4: Admin Panel & Configuration Console
- **Location**: `web/admin_panel/`
- **Tasks**:
  1. Upgrade `ReferralConfiguration.tsx`:
     - Driver Program settings: L1 percentage (2%), L2 percentage (1%), L1 driver cap (10), L2 driver cap (100).
     - Passenger Program settings: Promotional toggle, L1 percentage (2%), L2 percentage (1%), active date range.
     - Passenger-referring-driver milestone: Required trips $N$ (e.g., 5 or 10) and reward amount (KES).
     - Qualification rules: Required badge selector for drivers and passengers.
     - Margin safety rules: Minimum qualifying fare (KES 250), max platform fee share cap.
     - Escrow release window: 24h vs 48h.
  2. Add `FraudAlerts` dashboard view:
     - View flagged accounts, device collisions, collusion ratios, and freeze/unfreeze actions.
  3. Add `NotificationLog` audit view for dispute resolution.

---

### Phase 5: Mobile App UI/UX
- **Location**: `mobile/driver_app/` and `mobile/passenger_app/`
- **Tasks**:
  1. Driver App:
     - Clarify "Driver-to-Driver only" invite messaging.
     - Display L1 (X/10) and L2 (Y/100) driver slots filled.
     - Display Pending Escrow balance vs Available balance.
     - Display grandfathered status indicator if badge requirements change.
  2. Passenger App:
     - Fix `getReferralHistory` to call dedicated passenger referral endpoint.
     - Display two referral tabs: "Invite Friends (Passengers)" and "Invite Drivers (Earn Milestone Bonus)".
     - Notification inbox showing badge status notices and referral updates.

---

## 3. Verification Criteria
- [ ] Drivers can only refer drivers; referring passengers is rejected with clear error message.
- [ ] Passengers can refer passengers (earning 2% L1, 1% L2 spending) and drivers (earning one-time milestone upon $N$ trips).
- [ ] Driver referral commissions (2% L1, 1% L2) are deducted from platform commission, strictly capping driver count at 10 (L1) and 100 (L2).
- [ ] Low-fare rides (< KES 250) or negative platform margin conditions are disqualified.
- [ ] Rewards enter `PENDING_REVIEW` and are automatically released after 24-48 hours.
- [ ] Referrals from duplicate `deviceId` or `imeiHash` are blocked.
- [ ] Drivers with >30% trips from their referrer are flagged and suspended from referral payouts.
- [ ] Badge drops send an email/in-app notification and persist in `NotificationLog`, keeping existing referrals grandfathered.
