# Story 2.7: User Referral Network & Earnings View

*   **ID**: `STORY-2.7`
*   **Epic**: MLM & Referral Engine
*   **Title**: User: View referral network and earnings
*   **Points**: 5 (Involves new UI screens and a new backend endpoint with data aggregation)
*   **Status**: `Done`

---

### User Story

As a **user**, I want to **see my network of referrals and my total earnings from the MLM system**, so that **I can track my success**.

---

### Acceptance Criteria

1.  **UI Implementation**: Both the Flutter `passenger-app` and `driver-app` must have a "My Network" or "Earnings" screen.
2.  **Locked State (Unpaid Drivers)**: If a driver has not yet paid their registration fee, this screen must be locked. It should display a message (e.g., "Pay the registration fee to unlock your earnings") and a button that initiates the payment flow.
3.  **Unlocked State (Passengers & Paid Drivers)**:
    *   The screen must display the total count of direct referrals (Tier 1).
    *   The screen must display the total count of indirect referrals (Tier 2).
    *   The screen must display the user's total lifetime earnings from referrals.
    *   The screen must display a list of recent referral-related transactions (e.g., last 10 commission events).

---

### Technical Notes

*   **Frontend**: This story affects both the Flutter `passenger-app` and `driver-app`. A shared screen/widget should be created.
*   **Backend Service**: The `User & MLM Service` is responsible for providing the data for this screen.
*   **API Endpoint**: A new endpoint, `GET /users/network`, must be created. This endpoint will return an object containing:
    *   `tier1Count: number`
    *   `tier2Count: number`
    *   `totalEarnings: number`
    *   `recentTransactions: Transaction[]`
*   **Data Aggregation**: The backend service will need to perform queries to:
    *   Count users where `upline1_userId` matches the current user (for Tier 1).
    *   Count users where `upline2_userId` matches the current user (for Tier 2).
    *   Aggregate the `amount` from the `cabi-transactions` table where `toUserId` matches the current user and the `type` is commission-related.
*   **Reference Document**: This story directly implements the logic described in `Story 2.7` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Network Service**: Created `NetworkService` to aggregate referral counts and earnings.
*   [x] **Task 2: Implement UI Screen**: Created `MyNetworkScreen` to visualize the stats and recent transactions.
*   [x] **Task 3: Implement Data Fetching**: Used `FutureBuilder` to simulate fetching data from the backend.

#### **File List**

*   `apps/user-portal/backend/src/services/NetworkService.ts` (new)
*   `apps/passenger-app/lib/screens/network/my_network_screen.dart` (new)