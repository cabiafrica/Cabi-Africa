# Story 8.2: View Loyalty Dashboard

**Epic:** Passenger Loyalty Program
**Status:** Done
**Priority:** High

## Description
As a passenger, I want to view my current loyalty points balance and transaction history, so that I can track my progress towards rewards.

## Acceptance Criteria
1.  **UI Implementation**: The `passenger-app` must have a new "Loyalty" screen.
2.  **Balance Display**: The screen must prominently display the user's current total loyalty points.
3.  **Transaction History**: A list of recent loyalty transactions must be displayed (Earned/Redeemed).
4.  **Empty State**: If the user has no history, a friendly message is shown.

## Technical Notes
- **Frontend**: Flutter `LoyaltyDashboardScreen` widget.
- **Backend**: Endpoint `GET /loyalty/summary`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/passenger-app/lib/screens/loyalty/loyalty_dashboard_screen.dart`