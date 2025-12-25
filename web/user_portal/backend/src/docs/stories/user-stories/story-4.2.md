# Story 4.2: Admin MLM Configuration

*   **ID**: `STORY-4.2`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Configure MLM commission, fees, and badge qualifications
*   **Points**: 5 (Involves a configuration UI and a backend endpoint to update settings)
*   **Status**: `Done`

---

### User Story

As an **admin**, I want to **configure all commission and fee split percentages, and define which badges qualify users to earn**, so that **I can control the platform's revenue and referral incentives**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Configuration" or "MLM Settings" page.
2.  **Driver Registration Fee**: The admin must be able to set:
    *   The total registration fee amount.
    *   The percentage splits for the fee (System Cut, Upline 1 Cut, Upline 2 Cut).
3.  **Standard Fare Commission**: The admin must be able to set the percentage splits for the standard fare commission (System, Upline 1, Upline 2).
4.  **SACCO Savings**: The admin must be able to set the "SACCO Savings Rate" as a percentage.
5.  **Earning Qualification**: The admin must be able to select one or more badges from a list of existing badges that are required for a user to qualify for commission earnings.
6.  **Validation**: The UI must enforce that the percentages for any given split (Registration Fee, Fare Commission) add up to exactly 100% before allowing the form to be saved.
7.  **Submission**: Saving the form must call the `PUT /admin/config/mlm` endpoint on the `Admin Service` with the new configuration values.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for providing and updating the configuration.
*   **API Endpoints**:
    *   `GET /admin/config/mlm` to fetch the current settings.
    *   `PUT /admin/config/mlm` to save the updated settings.
*   **Data Storage**: The configuration values should be stored in a way that is easily accessible by other services (e.g., a dedicated DynamoDB table for configuration, or AWS AppConfig).
*   **Reference Document**: This story directly implements the logic described in `Story 4.2 (Revised)` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Configuration UI**: Created `MlmConfiguration.tsx` with forms for fees and commissions.
*   [x] **Task 2: Implement Validation Logic**: Added logic to ensure percentage splits sum to 100%.
*   [x] **Task 3: Implement Save Action**: Added stub for saving configuration to backend.

#### **File List**

*   `apps/admin-panel/src/components/MlmConfiguration.tsx` (new)