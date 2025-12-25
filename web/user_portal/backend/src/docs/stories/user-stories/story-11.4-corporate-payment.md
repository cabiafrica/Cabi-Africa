# Story 11.4: Corporate Payment Method

**Epic:** Corporate Accounts
**Status:** Done
**Priority:** High

## Description
As an employee, I want to select "Corporate Account" as my payment method for a trip, so that I don't have to pay out of pocket.

## Acceptance Criteria
1.  **UI Implementation**: A new option in the Payment Methods screen of the `passenger-app`.
2.  **Eligibility**: This option is only visible/selectable if the user is linked to an active corporate account.
3.  **Selection**: Selecting it sets the trip payment mode to `CORPORATE`.
4.  **Display**: Show the Company Name next to the payment method.

## Technical Notes
- **Frontend**: Flutter `CorporatePaymentMethod` widget/screen logic.
- **Backend**: Validate `CORPORATE` payment mode against user's corporate linkage during trip request.

---

### Dev Agent Record
*   **Status**: `Completed`
*   **Artifacts**: `apps/passenger-app/lib/screens/payment/corporate_payment_method.dart`