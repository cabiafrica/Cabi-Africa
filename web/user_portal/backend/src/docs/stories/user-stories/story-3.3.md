# Story 3.3: Monthly Feedback Review

*   **ID**: `STORY-3.3`
*   **Epic**: Fair Rating & Gamification System
*   **Title**: User: View monthly anonymous feedback
*   **Points**: 5 (Involves a UI component and a scheduled backend job)
*   **Status**: `Done`

---

### User Story

As a **user (driver or passenger)**, I want to **view the anonymous comments left for me on a monthly basis**, so that **I can get feedback while protecting the privacy of the reviewers**.

---

### Acceptance Criteria

1.  **UI Implementation**: Both the `passenger-app` and `driver-app` must have a "My Feedback" screen accessible from the user's profile.
2.  **Data Display**: The screen must display a list of all visible comments, grouped by the month they were received (e.g., "Feedback for May 2024").
3.  **Anonymity**: Comments must be displayed without any link to a specific trip, date, or the user who left them.
4.  **Backend Job**: A scheduled process (e.g., a monthly Lambda triggered by EventBridge) must run on the first day of each month at 00:00 UTC.
5.  **Visibility Logic**: This job must find all comments from the previous calendar month and update their `isVisible` flag to `true`.
6.  **API Endpoint**: The frontend will fetch comments from a `GET /users/feedback` endpoint, which only returns comments where `isVisible` is `true`.

---

### Technical Notes

*   **Frontend**: This story affects both the Flutter `passenger-app` and `driver-app`. A shared screen/widget should be created.
*   **Backend Services**:
    *   **User & MLM Service**: Owns the `GET /users/feedback` endpoint and the scheduled job logic.
*   **Asynchronous Processing**: The process of making comments visible is a scheduled background task that runs once a month.
*   **Data Model**: This story relies on the `Comment` model (or attribute on the `Trip` model) having a boolean `isVisible` flag, as established in `Story 3.1`.
*   **Performance**: The backend query for the scheduled job should be efficient, likely using an index on the comment creation date.
*   **Reference Document**: This story directly implements the logic described in `Story 3.3` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Feedback Service**: Created `FeedbackService` to handle data retrieval and the monthly visibility job.
*   [x] **Task 2: Implement UI Screen**: Created `MyFeedbackScreen` to display comments grouped by month.
*   [x] **Task 3: Implement Grouping Logic**: Added logic in the UI to group flat feedback items by their month/year.

#### **File List**

*   `apps/user-portal/backend/src/services/FeedbackService.ts` (new)
*   `apps/passenger-app/lib/screens/feedback/my_feedback_screen.dart` (new)