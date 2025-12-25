# Story 4.9: Direct User Permission Assignment

*   **ID**: `STORY-4.9`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Assign or revoke direct user permissions
*   **Points**: 8 (High complexity due to override logic and calculation of effective permissions)
*   **Status**: `Done`

---

### User Story

As a **Super Admin**, I want to **assign or revoke specific, individual permissions for a user**, so that **I can grant exceptions or one-off access without creating a new role**.

---

### Acceptance Criteria

1.  **UI Implementation**: On the admin user management page in the `admin-panel`, there must be a section to manage direct permissions.
2.  **Permission Gating**: This functionality must only be accessible to Super Admins.
3.  **Permissions View**: The UI must display a list of all available permissions, clearly indicating for the selected user:
    *   Permissions inherited via roles.
    *   Permissions directly granted.
    *   Permissions directly revoked.
4.  **Grant Action**: A Super Admin can explicitly grant a permission to a user.
5.  **Revoke Action**: A Super Admin can explicitly revoke a permission from a user. This action **must** override any grant for the same permission that is inherited from a role.
6.  **Effective Permissions**: The user's final set of permissions is calculated as: `(Permissions from all Roles + Directly Granted Permissions) - Directly Revoked Permissions`.
7.  **Submission**: Saving the changes must call the `PUT /admin/users/{userId}/permissions` endpoint with the list of direct grants and revokes.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application. The UI will need to be carefully designed to make the permission states (inherited, granted, revoked) clear.
*   **Backend Service**: The `Admin Service` is responsible for managing direct permission assignments and calculating a user's final effective permissions during authentication.
*   **API Endpoints**:
    *   `PUT /admin/users/{userId}/permissions` - To update the direct permissions for a user. The payload should contain arrays for granted and revoked `permissionId`s.
    *   The login/authentication endpoint must be updated to correctly calculate and return the final, effective list of permissions for the user.
*   **Data Model**: The implementation will create/update records in the `admin_user_permissions` table within the `cabi-admin-db` (PostgreSQL). This table must store the `user_id`, `permission_id`, and an `assignment_type` ('GRANT' or 'REVOKE').
*   **Reference Document**: This story directly implements the logic described in `Story 4.8: Direct User Permission Assignment` of the PRD and the `admin_user_permissions` table in `architecture.md`.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Integrated permission management into `AdminUserManagement.tsx`.
*   [x] **Task 2: Implement Override Logic**: Added Grant/Revoke/Reset buttons for individual permissions.
*   [x] **Task 3: Implement Visualization**: Added visual indicators for Inherited vs Direct permissions.

#### **File List**

*   `apps/admin-panel/src/components/AdminUserManagement.tsx` (new)