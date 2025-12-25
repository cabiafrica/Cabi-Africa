# Story 11.3: Employee Management

**Epic:** Corporate Accounts
**Status:** Done
**Priority:** High

## Description
As a corporate admin, I want to add and remove employees from my corporate account, so that only authorized personnel can charge rides to the company.

## Acceptance Criteria
1.  **UI Implementation**: An "Employees" tab within the Corporate section.
2.  **List**: Display Name, Email, and Status (Active/Suspended) of linked employees.
3.  **Add Employee**: Form to invite an employee by email.
4.  **Remove/Suspend**: Option to unlink an employee or disable corporate charging for them.

## Technical Notes
- **Frontend**: React component `CorporateEmployeeManagement`.
- **Backend**: `POST /corporates/{id}/employees`, `DELETE /corporates/{id}/employees/{userId}`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/admin-panel/src/components/CorporateEmployeeManagement.tsx`