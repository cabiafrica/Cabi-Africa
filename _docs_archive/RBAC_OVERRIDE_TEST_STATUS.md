# RBAC Permission Override Testing Status

## Current Objective
Verify that RBAC permission overrides (Direct User Permissions) take precedence over Role Permissions.

## Steps
1.  **Restart Backend**: Restart `auth-gateway` to apply `MockJwtAuthGuard` changes to `AdminUsersController`. (In Progress)
2.  **Run Test Script**: Execute `scripts/test_rbac_permissions.js`.
    -   Script creates a temporary test user.
    -   Grants specific permission via API.
    -   Verifies access is allowed.
    -   Assigns role + revokes permission.
    -   Verifies access is blocked (override check).
3.  **Frontend Test**: After backend verification, attempt Frontend integration test again.

## Current Status
-   Backend service rebuilding...
-   Script ready.
-   Controller updated.
