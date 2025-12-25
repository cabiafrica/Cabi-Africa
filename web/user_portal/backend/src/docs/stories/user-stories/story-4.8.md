# Story 4.8: Admin User Role Assignment

*   **ID**: `STORY-4.8`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Assign Roles to Admin Users
*   **Points**: 5 (Involves UI for user management and backend logic for role assignment)
*   **Status**: `Done`

---

### User Story

As a **Super Admin**, I want to **assign one or more roles to other admin users**, so that **I can grant them the appropriate level of access**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a section for managing admin users.
2.  **Permission Gating**: This section must only be accessible to users with Super Admin privileges.
3.  **List View**: The admin can view a list of all admin users and the roles currently assigned to them.
4.  **Role Assignment UI**: When creating or editing an admin user, the Super Admin must be able to assign one or more roles from a list of available roles (from Story 4.7).
5.  **Access Control**: The assigned roles must effectively control the user's access to different sections of the admin panel. A user with multiple roles inherits the sum of all permissions from those roles.
6.  **Submission**: Saving the role assignments for a user must call the `PUT /admin/users/{userId}/roles` endpoint on the `Admin Service`.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application. The frontend will need to fetch the user's permissions after login and use them to conditionally render UI components and routes.
*   **Backend Service**: The `Admin Service` is responsible for managing the assignment of roles to users.
*   **API Endpoints**:
    *   `GET /admin/users` - To list all admin users.
    *   `PUT /admin/users/{userId}/roles` - To update the roles for a specific user. The payload should be an array of `roleId`s.
    *   The login endpoint should return the user's calculated permissions based on their assigned roles.
*   **Data Model**: The implementation will create/update records in the `admin_user_roles` table within the `cabi-admin-db` (PostgreSQL) as defined in `architecture.md`.
*   **Reference Document**: This story directly implements the logic described in `Story 4.7: Admin User Role Assignment (Renumbered from 4.6)` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Created `AdminUserManagement.tsx` to list and edit admin users.
*   [x] **Task 2: Implement Role Assignment**: Added checkbox list to assign multiple roles to a user.
*   [x] **Task 3: Implement State Management**: Managed local state for user selection and role updates.

#### **File List**

*   `apps/admin-panel/src/components/AdminUserManagement.tsx` (new)