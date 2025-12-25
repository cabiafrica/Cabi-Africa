# Story 4.4: Admin Badge Management

*   **ID**: `STORY-4.4`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Define and manage badge earning criteria
*   **Points**: 8 (Moderate complexity: involves a rule-builder UI and structured data storage for the rule engine)
*   **Status**: `Done`

---

### User Story

As an **admin**, I want to **define the criteria for earning badges**, so that **I can control the gamification and MLM qualification rules**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Badge Management" section.
2.  **Badge List**: The page must display a list of all existing badges.
3.  **Create Badge**: The admin must be able to create a new badge by providing a name, description, and an icon.
4.  **Rule Builder UI**: When creating or editing a badge, the admin must be able to define the rules for earning it using a simple UI. For example:
    *   Metric: (Dropdown: `Total Referrals`, `Average Rating`, `Trips Completed`)
    *   Operator: (Dropdown: `>`, `<`, `=`, `≥`, `≤`)
    *   Value: (Input field)
    *   The admin can add multiple "AND" conditions for a single badge.
5.  **Edit/Delete**: The admin must be able to edit the name, description, and rules of an existing badge, or delete it entirely.
6.  **Submission**: Saving a badge (new or edited) must call the appropriate endpoint on the `Admin Service` with the badge details and its rules in a structured format (e.g., JSON).

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for storing and managing badge definitions and rules.
*   **API Endpoints**:
    *   `GET /admin/badges`
    *   `POST /admin/badges`
    *   `PUT /admin/badges/{id}`
    *   `DELETE /admin/badges/{id}`
*   **Data Storage**: The badge definitions and their rules must be stored in a structured format (e.g., a JSON object within a DynamoDB table) that can be easily queried by the `User & MLM Service` during the badge assignment process (Story 3.2).
*   **Rule Engine Format**: The rules should be stored in a format that a simple backend rule engine can parse, e.g., `{"rules": [{"metric": "referralCount", "operator": "GT", "value": 10}, {"metric": "averageRating", "operator": "GTE", "value": 4.8}]}`.
*   **Reference Document**: This story directly implements the logic described in `Story 4.4` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Created `BadgeManagement.tsx` for CRUD operations on badges.
*   [x] **Task 2: Implement Rule Builder**: Added dynamic form to add/remove/edit rules with metrics and operators.
*   [x] **Task 3: Implement State Management**: Managed local state for the list and the editing form.

#### **File List**

*   `apps/admin-panel/src/components/BadgeManagement.tsx` (new)