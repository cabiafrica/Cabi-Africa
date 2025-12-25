# Story 8.3: Redeem Points for Discounts

**Epic:** Passenger Loyalty Program
**Status:** Done
**Priority:** Medium

## Description
As a passenger, I want to redeem my accumulated points for ride discounts, so that I can save money on future trips.

## Acceptance Criteria
1.  **UI Implementation**: A "Redeem" tab or section within the Loyalty Dashboard.
2.  **Reward List**: Display available rewards (e.g., "100 KES off next ride" for 500 points).
3.  **Validation**: Users cannot redeem a reward if they have insufficient points.
4.  **Redemption Action**: Clicking redeem deducts points and generates a discount coupon/credit.
5.  **Feedback**: Success message and immediate balance update.

## Technical Notes
- **Frontend**: Flutter `RedeemPointsScreen` widget.
- **Backend**: Endpoint `POST /loyalty/redeem`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/passenger-app/lib/screens/loyalty/redeem_points_screen.dart`