# Story 11.1: Corporate Account Registration

**Epic:** Corporate Accounts
**Status:** Done
**Priority:** High

## Description
As a platform admin, I want to register new corporate accounts, so that companies can start using the platform for their employees.

## Acceptance Criteria
1.  **UI Implementation**: A "New Corporate Account" form in the `admin-panel`.
2.  **Fields**: Company Name, Tax ID (KRA PIN), Address, Contact Person Name, Email, Phone.
3.  **Validation**: Ensure Email and Tax ID are unique.
4.  **Action**: "Create Account" button saves the record and generates a welcome email to the contact person.

## Technical Notes
- **Frontend**: React component `CorporateAccountRegistration`.
- **Backend**: `POST /admin/corporates`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/admin-panel/src/components/CorporateAccountRegistration.tsx`