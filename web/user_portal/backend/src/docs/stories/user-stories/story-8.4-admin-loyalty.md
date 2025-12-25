# Story 8.4: Admin Loyalty Configuration

**Epic:** Passenger Loyalty Program
**Status:** Done
**Priority:** Low

## Description
As an admin, I want to configure the point earning rate and available rewards, so that I can adjust the program economics without code changes.

## Acceptance Criteria
1.  **UI Implementation**: "Loyalty Settings" page in `admin-panel`.
2.  **Earning Rate**: Input to set "Points per 100 KES".
3.  **Reward Management**: Ability to add/remove redeemable rewards (Cost in points, Value in KES).
4.  **Save**: Persist configuration to backend.

## Technical Notes
- **Frontend**: React `LoyaltyConfiguration` component.
- **Backend**: `PUT /admin/config/loyalty`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/admin-panel/src/components/LoyaltyConfiguration.tsx`