# Story 11.2: Corporate Dashboard

**Epic:** Corporate Accounts
**Status:** Done
**Priority:** Medium

## Description
As a corporate admin, I want to view a dashboard of my company's ride usage and spending, so that I can monitor costs.

## Acceptance Criteria
1.  **UI Implementation**: A "Corporate Dashboard" view.
2.  **KPIs**: Total Rides (Month), Total Spend (Month), Active Employees.
3.  **Recent Activity**: List of recent trips taken by employees charged to the company.
4.  **Context**: This view is for the *Corporate Admin* (a specific user role), but platform admins can also view it.

## Technical Notes
- **Frontend**: React component `CorporateDashboard`.
- **Backend**: `GET /corporates/{id}/dashboard`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/admin-panel/src/components/CorporateDashboard.tsx`