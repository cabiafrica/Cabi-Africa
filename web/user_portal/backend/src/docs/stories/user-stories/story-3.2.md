# Story 3.2: Automatic Badge Assignment

*   **ID**: `STORY-3.2`
*   **Epic**: Fair Rating & Feedback System
*   **Title**: System: Define and automatically assign badges based on performance
*   **Points**: 8 (Moderate complexity: involves a scheduled job, inter-service communication, and dynamic rule evaluation)
*   **Status**: `Done`

---

### User Story

As the **system**, I want to **automatically assign and revoke performance-based badges to users on a periodic basis**, so that **we can gamify the user experience and enable features like commission earning**.

---

### Acceptance Criteria

1.  **Scheduled Trigger**: A scheduled job (e.g., a daily cron) must trigger the badge assignment process.
2.  **Fetch Badge Rules**: The system must fetch all available badge definitions and their qualification rules from the `Admin Service`.
3.  **Fetch All Users**: The system must iterate through all active users to evaluate them.
4.  **Evaluate Criteria**: For each user, the system must evaluate their performance against the rules for each badge. This requires fetching data from multiple services:
    *   `rating` from the user's own record.
    *   `completedTrips` from the `Ride Service`.
    *   `totalEarnings` from the `Payment Service`.
5.  **Assign/Revoke Badges**:
    *   If a user meets the criteria for a badge they do not currently have, the badge ID is added to their `badges` list.
    *   If a user has a badge but no longer meets its criteria, the badge ID is removed from their `badges` list.
6.  **Update User Record**: The user's record in the `cabi-users` table must be updated with the new list of badges. The process should be efficient to minimize unnecessary database writes.

---

### Technical Notes

*   **Backend Service**: This logic is owned by the `User & MLM Service`.
*   **Trigger**: The process will be triggered by an **AWS EventBridge Scheduler** rule that invokes a Lambda function.
*   **Inter-Service Communication**: The `User & MLM Service` will need to have clients to communicate with:
    *   `Admin Service`: To get badge definitions.
    *   `Ride Service`: To get trip counts for a user.
    *   `Payment Service`: To get total earnings for a user.
*   **Scalability**: For a large user base, the "Fetch All Users" step should be implemented using a batching mechanism (e.g., paginated queries or a stream) to avoid overwhelming the function's memory.
*   **Data Model**: The `User` model in the `cabi-users` table must have a `badges` attribute, which is a list of strings (e.g., `['EARNING_BADGE', 'TOP_DRIVER']`).

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Create Service Clients**: Create mock clients within the `user-service` for `AdminService`, `RideService`, and `PaymentService` to fetch necessary data.
*   [x] **Task 2: Implement Badge Assignment Handler**: Create a new `badge-assignment.handler.ts` in the `user-service` and implement the main logic: fetch users, fetch badge rules, and iterate.
*   [x] **Task 3: Implement Evaluation Logic**: For each user, fetch their performance metrics from the mock service clients, evaluate them against the badge rules, and determine if the user's badge list needs to be updated.
*   [x] **Task 4: Update User Repository**: Add a method to `user.repository.ts` to update the `badges` for a user and call it from the handler only when a change is detected.
*   [x] **Task 5: Write Tests**: Write unit tests for `badge-assignment.handler.ts` to verify the evaluation and update logic.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive unit tests have been written for the new backend logic.
*   [x] All tests are passing.

#### **File List**

*   `libs/backend/user-service/src/lib/admin.service.client.ts` (new)
*   `libs/backend/user-service/src/lib/badge-assignment.handler.ts` (new)
*   `libs/backend/user-service/src/lib/payment.service.client.ts` (new)
*   `libs/backend/user-service/src/lib/ride.service.client.ts` (new)
*   `libs/backend/user-service/src/lib/user.repository.ts` (modified)
*   `libs/backend/user-service/src/lib/badge-assignment.handler.test.ts` (new)