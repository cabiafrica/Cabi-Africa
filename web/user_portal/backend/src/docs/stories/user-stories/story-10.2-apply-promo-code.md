# Story 10.2: Apply Promo Code

**Epic:** Marketing Campaigns
**Status:** Done
**Priority:** High

## Description
As a passenger, I want to enter a promo code in the app, so that I can receive a discount on my ride.

## Acceptance Criteria
1.  **UI Implementation**: A "Promotions" section in the `passenger-app` (accessible from Wallet or Menu).
2.  **Input**: A text field to enter the code and an "Apply" button.
3.  **Validation**: The app must validate the code with the backend.
4.  **Feedback**:
    - Success: Show the discount amount and expiry.
    - Failure: Show error message (e.g., "Invalid or Expired Code").
5.  **Storage**: Valid codes should be stored in the user's wallet for future use.

## Technical Notes
- **Frontend**: Flutter `PromoCodeScreen`.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/passenger-app/lib/screens/wallet/promo_code_screen.dart`