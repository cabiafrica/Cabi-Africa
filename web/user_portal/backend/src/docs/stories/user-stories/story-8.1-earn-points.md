# Story 8.1: Earn Points per Trip

**Epic:** Passenger Loyalty Program
**Status:** Done
**Priority:** High

## Description
As a passenger, I want to earn loyalty points for every trip I complete and pay for, so that I can accumulate rewards over time.

## Acceptance Criteria
1.  **Trigger Event**: Points calculation must trigger automatically when a trip is fully paid (listening for the `TripPaid` event).
2.  **Calculation Logic**: The system must calculate points based on the final fare amount.
    - Default rule: 1 Point per 10 KES spent (e.g., a 500 KES ride earns 50 points).
3.  **Balance Update**: The calculated points must be added to the passenger's total `loyaltyPoints` balance in the `User` profile.
4.  **History Log**: A record must be created in the `LoyaltyTransaction` table with type `EARN`, amount, timestamp, and the associated `tripId`.
5.  **Notification**: The passenger must receive a push notification immediately after payment: "You earned X points for this trip!".

## Technical Notes
- **Backend**: This logic resides in the `Loyalty Service`.
- **Data Model**:
    - Update `User` model: add `loyaltyPoints` (integer).
    - Create `LoyaltyTransaction` model.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `libs/backend/loyalty-service/src/lib/loyalty.service.ts`