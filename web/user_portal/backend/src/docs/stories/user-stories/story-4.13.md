# Story 4.13: Admin SOS Misuse Penalty Configuration

*   **ID**: `STORY-4.13`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Configure SOS Misuse Penalty
*   **Points**: 3 (Low complexity: simple configuration UI and backend storage)
*   **Status**: `Done`

---

### User Story

As a **Super Admin**, I want to **configure the penalty for SOS button misuse**, so that **I can control how the system discourages false alarms**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a section for "SOS Configuration".
2.  **Permission Gating**: This section must be accessible only to Super Admins.
3.  **Penalty Type Selection**: The admin must be able to choose the penalty type from a dropdown or radio buttons: "Fee" or "Revoke Badge".
4.  **Fee Configuration**: If "Fee" is selected, an input field must appear for the admin to enter a specific monetary amount.
5.  **Badge Configuration**: If "Revoke Badge" is selected, a dropdown must appear, populated with all available badges (from Story 4.4), allowing the admin to select one.
6.  **Submission**: Saving the configuration must call the `PUT /admin/config/sos-penalty` endpoint on the `Admin Service`.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for storing and providing this configuration.
*   **API Endpoints**:
    *   `GET /admin/config/sos-penalty` - To fetch the current penalty setting.
    *   `PUT /admin/config/sos-penalty` - To save the new penalty setting.
*   **Data Storage**: The configuration (e.g., `{ "type": "FEE", "value": 500 }` or `{ "type": "REVOKE_BADGE", "value": "badge_id_123" }`) should be stored in the central configuration store (e.g., a dedicated DynamoDB table or AWS AppConfig).
*   **Dependency**: The `Admin Service` will read this configuration when resolving an incident with a `MISUSE` outcome (as per Story 4.12).
*   **Reference Document**: This story directly implements the logic described in `Story 4.14: Admin SOS Misuse Penalty Configuration` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Created `SosPenaltyConfig.tsx` for configuring penalties.
*   [x] **Task 2: Implement Logic**: Added logic to switch between Fee and Badge Revocation modes.
*   [x] **Task 3: Implement Validation**: Added checks for fee amounts and badge selection.

#### **File List**

*   `apps/admin-panel/src/components/SosPenaltyConfig.tsx` (new)