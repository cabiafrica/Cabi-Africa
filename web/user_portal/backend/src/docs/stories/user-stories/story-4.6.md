# Story 4.6: Admin Permission Management

*   **ID**: `STORY-4.6`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Manage Permissions
*   **Points**: 3 (Low complexity: standard CRUD UI and backend endpoints)
*   **Status**: `Done`

---

### User Story

As a **super admin**, I want to **manage the list of available permissions in the system**, so that **I can define the granular actions that can be controlled by roles**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "Permissions" management page.
2.  **List View**: The page must display a list of all existing permissions, showing their ID (e.g., `blog.manage`) and a human-readable description.
3.  **Create/Edit**: The admin must be able to create a new permission or edit an existing one. The form should contain fields for:
    *   `id`: A unique, dot-separated string representing the permission. This should be non-editable after creation.
    *   `description`: A user-friendly explanation of what the permission allows.
4.  **Deletion**: The admin must be able to delete a permission. The system should prevent the deletion of a permission that is currently assigned to one or more roles.
5.  **Submission**: All create, update, and delete actions must call the appropriate endpoints on the `Admin Service`.

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for all CRUD operations for permissions.
*   **API Endpoints**:
    *   `GET /admin/permissions`
    *   `POST /admin/permissions`
    *   `PUT /admin/permissions/{id}`
    *   `DELETE /admin/permissions/{id}`
*   **Data Model**: A new `Permission` model will be created, likely stored in its own `cabi-permissions` DynamoDB table.
*   **Referential Integrity**: The backend must enforce that a permission cannot be deleted if it is part of a `Role`'s permission list (see Story 4.7).

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Admin Service Client**: Update `adminService.ts` with CRUD methods for permissions and define the `Permission` interface.
*   [x] **Task 2: Implement UI Component**: Create `PermissionManagement.tsx` to list, create, edit, and delete permissions.
*   [x] **Task 3: Integrate into App**: Add navigation in `App.tsx` to access the new management screen.
*   [x] **Task 4: Write Tests**: Write component tests for `PermissionManagement.tsx` to verify the component's behavior.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive component tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/admin-panel/src/App.tsx` (modified)
*   `apps/admin-panel/src/services/adminService.ts` (modified)
*   `apps/admin-panel/src/components/PermissionManagement.tsx` (new)
*   `apps/admin-panel/src/components/PermissionManagement.test.tsx` (new)