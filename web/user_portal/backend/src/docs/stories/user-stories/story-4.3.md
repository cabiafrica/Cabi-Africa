# Story 4.3: Admin Promotional Fare Split Configuration

*   **ID**: `STORY-4.3`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Configure promotional passenger fare split
*   **Points**: 5 (Involves a configuration UI with scheduling and a backend endpoint)
*   **Status**: `Done`

---

### User Story

As an **admin**, I want to **enable, disable, and schedule the promotional passenger fare splitting feature**, so that **I can run limited-time growth campaigns**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Promotions" or similar configuration page.
2.  **Activation Control**: The admin must be able to:
    *   Enable or disable the promotion with a master toggle.
    *   Set an optional start and end date/time for the promotion to run automatically.
3.  **Fare Split Configuration**: The admin must be able to set the percentage splits for the promotional fare (System, Driver, Upline 1, Upline 2).
4.  **Earning Qualification**: The admin must be able to select which badge(s) are required for an upline member to qualify for earnings during the promotion.
5.  **Validation**: The UI must enforce that the promotional fare split percentages add up to exactly 100% before allowing the form to be saved.
6.  **Submission**: Saving the form must call the `PUT /admin/config/promotions` endpoint on the `Admin Service` with the new configuration.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for providing and updating the promotional configuration.
*   **API Endpoints**:
    *   `GET /admin/config/promotions` to fetch the current promotional settings.
    *   `PUT /admin/config/promotions` to save the updated settings.
*   **Data Storage**: The configuration values should be stored where they are easily accessible by the `Payment Service` (e.g., a dedicated DynamoDB table for configuration, or AWS AppConfig). The `Payment Service` will check this configuration at the start of the `TripPaid` event processing.
*   **Reference Document**: This story directly implements the logic described in `Story 4.3 (Revised)` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Config UI**: Created `PromotionalConfig.tsx` with scheduling and activation toggle.
*   [x] **Task 2: Implement Split Logic**: Added inputs for 4-way split (System, Driver, Upline 1, Upline 2) with 100% validation.
*   [x] **Task 3: Implement Qualification**: Added dropdown to select required badge for earnings.

#### **File List**

*   `apps/admin-panel/src/components/PromotionalConfig.tsx` (new)