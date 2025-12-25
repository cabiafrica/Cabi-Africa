# Story 2.6: Promotional Passenger Fare Splitting

*   **ID**: `STORY-2.6`
*   **Epic**: MLM & Referral Engine
*   **Title**: System: Distribute promotional passenger fare split based on badge qualification
*   **Points**: 8 (Moderate complexity: involves event consumption, conditional logic, multiple service lookups, and financial transaction logging)
*   **Status**: `Done`

---

### User Story

As the **system**, I want to **distribute a portion of a passenger's fare to their upline based on badge qualification during promotional periods**, so that **we can incentivize passenger-to-passenger referrals**.

---

### Acceptance Criteria

1.  **Trigger**: This process must be triggered when the `Payment Service` consumes a `TripPaid` event from the Event Bus (published in Story 1.8).
2.  **Promotion Check**: The `Payment Service` must first query the `Admin Service` to check if the "Promotional Passenger Fare Split" is currently active. If it is not active, the process for this story terminates.
3.  **Upline & Badge Lookup**: If the promotion is active, the service must query the `User & MLM Service` to retrieve the *passenger's* `upline1_userId` and `upline2_userId`, and to verify if each of those upline users holds the required "Earning Badge".
4.  **Configuration Fetch**: The service must fetch the current "Promotional Fare" percentages from the configuration managed by the `Admin Service`.
5.  **Conditional Distribution**:
    *   If Upline 1 has the required badge, their share of the fare is credited to their wallet. If not, their share is credited to the System's account.
    *   If Upline 2 exists and has the required badge, their share of the fare is credited to their wallet. If not (or if they don't exist), their share is credited to the System's account.
6.  **Transaction Logging**: A new `Transaction` record must be created in the `cabi-transactions` table for each distributed amount, with a specific `type` like `COMMISSION_PROMO_PASSENGER`, linked to the `tripId`.

---

### Technical Notes

*   **Backend Service**: This logic is owned by the `Payment Service`.
*   **Asynchronous Flow**: This entire process is asynchronous and event-driven, initiated by the `TripPaid` event. It runs in parallel with other `TripPaid` consumers like standard commission splitting and SACCO savings.
*   **Inter-Service Communication**:
    *   `Payment Service` calls `Admin Service` to check promotion status and get percentages.
    *   `Payment Service` calls `User & MLM Service` to get the passenger's upline and their badge status.
*   **Data Model**: This story results in the creation of new `Transaction` records.
*   **Idempotency**: The event handler must be idempotent to prevent accidental double-crediting if the `TripPaid` event is processed more than once.
*   **Reference Document**: This story directly implements the logic described in `Story 2.6` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Promo Service**: Created `PromoService` class to handle the `TripPaid` event.
*   [x] **Task 2: Implement Promotion Check**: Added logic to check if the promotion is active via config.
*   [x] **Task 3: Implement Distribution Logic**: Implemented the math for splitting the passenger fare and checking upline badges.

#### **File List**

*   `apps/user-portal/backend/src/services/PromoService.ts` (new)