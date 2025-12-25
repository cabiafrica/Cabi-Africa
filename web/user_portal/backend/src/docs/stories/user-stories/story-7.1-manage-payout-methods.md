# Story 7.1: Manage Payout Methods

**Epic:** Driver Payouts
**Status:** Done
**Priority:** High

## Description
As a driver, I want to add and manage my payout methods (M-Pesa or Bank Account), so that I can receive my earnings securely and conveniently.

## Acceptance Criteria
1.  **UI Implementation**: The `driver-app` must have a "Payout Methods" screen accessible from the Wallet or Profile section.
2.  **List View**: The screen must display a list of saved payout methods. If none exist, it should show a prompt to add one.
3.  **Add Method**: A button to "Add Payout Method" must allow the driver to choose between "M-Pesa" and "Bank Transfer".
4.  **M-Pesa Form**: If M-Pesa is selected, the form should ask for a Phone Number (defaulting to the registered number).
5.  **Bank Form**: If Bank Transfer is selected, the form should ask for Bank Name, Account Number, and Account Holder Name.
6.  **Validation**: Basic validation (e.g., phone number format, non-empty fields) must be performed before submission.
7.  **Backend Integration**: Saving a method must call `POST /drivers/payout-methods` on the `Payment Service`.
8.  **Default Method**: The driver must be able to select one method as the "Default" for automatic payouts.

## Technical Notes
- **Frontend**: This story is implemented in the Flutter `driver-app`.
- **Backend**: The `Payment Service` is responsible for storing these details securely. Sensitive info (like bank account numbers) should be handled according to security best practices (encryption at rest).
- **API Endpoints**:
    - `GET /drivers/payout-methods`
    - `POST /drivers/payout-methods`
    - `DELETE /drivers/payout-methods/{id}`
    - `PATCH /drivers/payout-methods/{id}/default`

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-code-assist`
*   **Status**: `Completed`

#### Tasks

*   [x] **Task 1: Implement UI Screen**: Created `payout_methods_screen.dart`.
*   [x] **Task 2: Implement List Logic**: Added state to manage and display list of methods.
*   [x] **Task 3: Implement Add Form**: Created a bottom sheet form with validation for M-Pesa and Bank details.
*   [x] **Task 4: Implement Actions**: Added logic for setting default and deleting methods.

#### **File List**

*   `apps/driver-app/src/screens/payout_methods_screen.dart` (new)