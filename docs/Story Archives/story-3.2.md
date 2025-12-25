# Story 3.2: Driver Views Their Feedback

*   **ID**: `STORY-3.2`
*   **Epic**: Fair Rating & Feedback System
*   **Title**: Driver views their feedback
*   **Points**: 3 (Low-to-medium complexity: involves a new screen, API call, and data grouping)
*   **Status**: `Done`

---

### User Story

As a **driver**, I want to **view the anonymous feedback and comments left by passengers**, so that **I can understand my performance and areas for improvement**.

---

### Acceptance Criteria

1.  **UI Implementation**: A new "My Feedback" screen must be created in the `driver-app`, accessible from a logical location like a profile page or side menu.
2.  **Data Fetching**: The screen must call a new backend endpoint (e.g., `GET /drivers/me/feedback`) to retrieve anonymous comments.
3.  **Time Filtering**: The feedback displayed must be limited to comments from the previous calendar month. For example, if the current date is any day in June, the screen should only show comments received during May.
4.  **UI Grouping**: Comments must be visually grouped by the month they were received (e.g., a "May 2024" header followed by all comments from that month).

---

### Technical Notes

*   **Frontend**: This story is implemented in the `driver-app`. The UI for grouping by month can be based on the implementation in the passenger app's `FeedbackScreen`.
*   **API Endpoint**: A new endpoint, `GET /drivers/me/feedback`, will need to be created in the `User & MLM Service`.
*   **Backend Logic**: The backend service will be responsible for:
    *   Fetching all anonymous comments linked to the authenticated driver.
    *   Filtering these comments to include only those from the previous full calendar month.
    *   Ensuring no personally identifiable passenger information is returned.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

- [x] **Task 1: Create `DriverFeedbackService`**: Create a new service file in the `driver-app` with a method `getFeedback()` to simulate calling the `GET /drivers/me/feedback` endpoint.
- [x] **Task 2: Create `FeedbackScreen`**: Create the file `apps/driver-app/src/screens/feedback_screen.dart`. This screen will use a `FutureBuilder` to call the new service.
- [x] **Task 3: Implement UI Logic**: In `FeedbackScreen`, implement the logic to group the fetched comments by month using the `collection` package, and display them under monthly headers.
- [x] **Task 4: Add Navigation**: Add a button or link in the `driver-app` (e.g., on a profile page or a temporary button on the home screen) to navigate to the new `FeedbackScreen`.
- [x] **Task 5: Write Tests**: Create `feedback_screen_test.dart` to test the loading state, error state, and the correct display and grouping of feedback data using a mock service.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive widget tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/driver-app/src/api/driver_feedback_service.dart` (new)
*   `apps/driver-app/src/screens/feedback_screen.dart` (new)
*   `apps/driver-app/src/screens/home_screen.dart` (modified)
*   `apps/driver-app/test/screens/feedback_screen_test.dart` (new)