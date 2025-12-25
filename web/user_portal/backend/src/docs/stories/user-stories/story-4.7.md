# Story 4.7: Role Management

*   **ID**: `STORY-4.7`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Manage Roles and Assign Permissions
*   **Points**: 8 (Moderate complexity: involves CRUD for roles and managing the many-to-many relationship with permissions)
*   **Status**: `Done`

---

### User Story

As a **Super Admin**, I want to **create, view, update, and delete user roles and assign permissions to them**, so that **I can group access rights for different staff functions**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Roles" section.
2.  **Permission Gating**: This section must only be accessible to users with Super Admin privileges.
3.  **Create Role**: An admin can create a new role by providing a name (e.g., "Support Level 1").
4.  **Permission Assignment UI**: When creating or editing a role, the admin must be presented with a list of all available permissions (from Story 4.6) and be able to select multiple permissions to assign to the role.
5.  **List View**: The admin can view a list of all roles and see which permissions are assigned to each.
6.  **Update Role**: An admin can update a role's name and change its assigned permissions.
7.  **Delete Role**: An admin can delete a role (with a confirmation prompt). The system should prevent deletion if the role is currently assigned to any admin user.
8.  **Submission**: All create, update, and delete actions must call the appropriate endpoints on the `Admin Service`.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for all CRUD operations for roles and their permission assignments.
*   **API Endpoints**:
    *   `GET /admin/roles`
    *   `POST /admin/roles` (Payload should include role name and an array of `permissionId`s)
    *   `PUT /admin/roles/{roleId}` (Payload should include role name and an array of `permissionId`s)
    *   `DELETE /admin/roles/{roleId}`
*   **Data Model**: The implementation will create/update records in the `roles` and `role_permissions` tables within the `cabi-admin-db` (PostgreSQL) as defined in `architecture.md`.
*   **Reference Document**: This story directly implements the logic described in `Story 4.6: Role Management` of the PRD.

---

### Implementation Plan

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Component**: Created `RoleManagement.tsx` for CRUD operations on roles.
*   [x] **Task 2: Implement Permission Assignment**: Added checkbox list to assign permissions to roles.
*   [x] **Task 3: Implement Validation**: Added checks for required fields.

#### **File List**

*   `apps/admin-panel/src/components/RoleManagement.tsx` (new)