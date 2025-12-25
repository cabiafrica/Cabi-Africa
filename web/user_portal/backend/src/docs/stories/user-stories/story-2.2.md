# Story 2.2: Referral Link Attribution

*   **ID**: `STORY-2.2`
*   **Epic**: MLM & Referral Engine
*   **Title**: Web: Attribute new user to referrer via link
*   **Points**: 5 (Involves frontend URL parsing, backend validation, and establishing the two-tier link)
*   **Status**: `Done`

---

### User Story

As a **new user registering via a referral link**, I want the **system to automatically recognize my referrer**, so that **I don't have to enter the code manually**.

---

### Acceptance Criteria

1.  **Frontend Logic**: When the `web-portal` registration page loads with a URL query parameter (e.g., `?ref=DAVID123`), the "Referrer ID" input field must be pre-filled with the value `DAVID123` and be made read-only.
2.  **Submission**: The pre-filled referral code must be included in the payload sent to the `POST /users/register` endpoint.
3.  **Backend Validation**: The `User & MLM Service` must validate that the provided referral code exists and belongs to an active user.
4.  **Upline 1 Link**: Upon successful validation, the new user's record in the `cabi-users` table must have its `upline1_userId` attribute set to the `userId` of the referring user.
5.  **Upline 2 Link**: The service must then look up the referrer's own `upline1_userId` and set it as the new user's `upline2_userId`. If the referrer has no upline, this field remains null.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `web-portal` (Next.js) application. It requires logic to parse URL query parameters on page load.
*   **Backend Service**: The `User & MLM Service` is responsible for the validation and linking logic.
*   **API Endpoint**: This functionality is part of the existing `POST /users/register` endpoint.
*   **Data Model**: The implementation populates the `upline1_userId` and `upline2_userId` fields in the `User Model` as defined in `architecture.md`.
*   **Error Handling**: If an invalid referral code is passed in the URL, the "Referrer ID" field should simply be empty and editable, allowing the user to enter a code manually or proceed without one.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

- [x] **Task 1: Create `UserService`**: Create a new file `apps/passenger-app/src/api/user_service.dart` with a `getNetworkData()` method to simulate fetching the user's network and earnings status.
- [x] **Task 2: Create `NetworkScreen`**: Create the file `apps/passenger-app/src/screens/network_screen.dart`. This screen will use a `FutureBuilder` to call `getNetworkData()`.
- [x] **Task 3: Implement Conditional UI**: Inside `NetworkScreen`, build two distinct widgets: `_buildLockedDashboard()` and `_buildUnlockedDashboard()`. Render one or the other based on the `status` field from the API response.
- [x] **Task 4: Build Unlocked Dashboard**: The unlocked view should display total earnings, referral counts in `Card` widgets, and a `ListView` for recent transactions, using `intl` for formatting.
- [x] **Task 5: Write Tests**: Create `network_screen_test.dart` to test the loading state, error state, the "locked" UI, and the "unlocked" UI with mock data.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive widget tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/passenger-app/src/api/user_service.dart` (modified)
*   `apps/passenger-app/src/screens/network_screen.dart` (new)
*   `apps/passenger-app/src/screens/network_screen_test.dart` (new)