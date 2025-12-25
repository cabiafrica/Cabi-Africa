# Story 4.14: Suspended Account Management

*   **ID**: `STORY-4.14`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Manage Suspended Accounts
*   **Points**: 5 (Involves a filtered list UI, a backend endpoint for state change, and audit logging)
*   **Status**: `Done`

---

### User Story

As an **admin**, I want to **view and manage user accounts that have been suspended due to security flags**, so that **I can review incidents and reactivate legitimate users**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Suspended Accounts" section.
2.  **Permission Gating**: This section must only be accessible to admins with the appropriate permission (e.g., `users.manage.suspended`).
3.  **List View**: The page must display a list of all users with the `SUSPENDED` status.
4.  **List Content**: The list must show the user's name, phone number, the reason for suspension (e.g., "BIOMETRIC_FAILURE"), and the date of suspension.
5.  **Reactivation Action**: A "Reactivate" button must be present for each user in the list.
6.  **Confirmation**: Clicking "Reactivate" must trigger a confirmation modal to prevent accidental reactivation.
7.  **Backend Call**: Upon confirmation, the app must call the `POST /admin/users/{userId}/unsuspend` endpoint.
8.  **Backend Logic**: The `Admin Service` must update the user's `status` from `SUSPENDED` to `ACTIVE`.
9.  **Audit Logging**: The reactivation action, including the admin who performed it, must be recorded in the `audit_logs` table (as per Story 4.10).

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for the reactivation logic.
*   **API Endpoints**:
    *   `GET /admin/users?status=SUSPENDED` - To fetch the list of suspended users.
    *   `POST /admin/users/{userId}/unsuspend` - To change the user's status back to `ACTIVE`.
*   **Data Model**:
    *   The `status` field on the `User` model (in `cabi-users` DynamoDB table) will be updated.
    *   A new record will be created in the `audit_logs` table (in `cabi-admin-db` PostgreSQL).
*   **Reference Document**: This story directly implements the logic described in `Story 4.15: Suspended Account Management` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Created `SuspendedAccountManagement.tsx` to list suspended users.
*   [x] **Task 2: Implement Reactivation Logic**: Added "Reactivate" button with confirmation modal.
*   [x] **Task 3: Implement State Management**: Managed local state for the list and modal visibility.

#### **File List**

*   `apps/admin-panel/src/components/SuspendedAccountManagement.tsx` (new)