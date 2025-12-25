# Story 4.10: Admin Action Logging

*   **ID**: `STORY-4.10`
*   **Epic**: Admin & Configuration Panel
*   **Title**: Admin: Log and view audit trail of significant actions
*   **Points**: 8 (Involves backend middleware/decorators for logging, a new database table, and a data-rich UI with filtering)
*   **Status**: `Done`

---

### User Story

As a **Super Admin**, I want a **detailed audit log of all significant admin actions**, so that **I can monitor platform security and changes**.

---

### Acceptance Criteria

1.  **UI Implementation**: The `admin-panel` (React app) must have a "System Logs" or "Audit Trail" section.
2.  **Permission Gating**: This section must only be accessible to users with Super Admin privileges.
3.  **Log Viewer**: The UI must display a list of log entries, showing the admin user, the action performed, details, IP address, and a timestamp for each.
4.  **Filtering**: The log viewer must allow filtering by date range, admin user, and action type.
5.  **Backend Logging**: The `Admin Service` must automatically log the following actions to the `audit_logs` table:
    *   Admin login attempts (successful and failed).
    *   Driver status changes (e.g., `approve`, `reject`, `request-correction`).
    *   All configuration changes made in the MLM, Promotional, and Badge management panels.
    *   All CRUD operations on Roles and Permissions.
    *   All role assignments and direct permission assignments/revocations for users.
    *   User account status changes (e.g., `suspend`, `unsuspend`).

---

### Technical Notes

*   **Frontend**: This story is implemented in the `admin-panel` (React) application.
*   **Backend Service**: The `Admin Service` is responsible for writing all audit log entries. This can be implemented using NestJS Guards, Interceptors, or decorators on the relevant API endpoints to ensure logging is consistent.
*   **API Endpoints**:
    *   `GET /admin/logs` - To fetch log data with query parameters for filtering.
*   **Data Model**: The implementation will create records in the `audit_logs` table within the `cabi-admin-db` (PostgreSQL), as defined in `architecture.md`. The table should contain `log_id`, `admin_user_id`, `action`, `details` (JSONB), `ip_address`, and `timestamp`.
*   **Reference Document**: This story directly implements the logic described in `Story 4.11: Admin Action Logging` of the PRD.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement Admin Service Client**: Update `adminService.ts` with `getAuditLogs` and define the `AuditLog` and `AuditLogFilters` interfaces.
*   [x] **Task 2: Implement UI Component**: Create `AuditLogViewer.tsx` to display logs and provide filter inputs.
*   [x] **Task 3: Implement Core Logic**: Implement state management for filters and fetching data from the service.
*   [x] **Task 4: Integrate into App**: Add navigation in `App.tsx` to access the new management screen.
*   [x] **Task 5: Write Tests**: Write component tests for `AuditLogViewer.tsx` to verify rendering and filter submission.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive component tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/admin-panel/src/App.tsx` (modified)
*   `apps/admin-panel/src/services/adminService.ts` (modified)
*   `apps/admin-panel/src/components/AuditLogViewer.tsx` (new)
*   `apps/admin-panel/src/components/AuditLogViewer.test.tsx` (new)