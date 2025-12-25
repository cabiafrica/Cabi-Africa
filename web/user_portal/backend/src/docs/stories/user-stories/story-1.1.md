# Story 1.1: Passenger Account Registration

*   **ID**: `STORY-1.1`
*   **Epic**: Core Ride-Hailing Experience
*   **Title**: Passenger: Register for an account using phone number and OTP
*   **Points**: 8 (Involves UI, form validation, and integration with a third-party auth service)
*   **Status**: `Done`

---

### User Story

As a **new passenger**, I want to **register for an account using my phone number and a password**, so that **I can start using the service**.

---

### Acceptance Criteria

1.  **UI Implementation**: The Flutter `passenger-app` must have a registration screen with input fields for "Full Name", "Phone Number", and "Password".
2.  **Input Validation**:
    *   The phone number field must validate input to match a Kenyan format (e.g., starts with `+254` or `07`/`01`).
    *   The password must meet the minimum complexity requirements defined by the Cognito User Pool (e.g., 8 characters, numbers, special characters).
3.  **Registration Flow**:
    *   When the user submits the form, the app must call the backend registration endpoint (which interfaces with Amazon Cognito).
    *   The system must send a One-Time Password (OTP) via SMS to the provided phone number.
    *   The app must navigate to a new screen prompting the user to enter the received OTP.
4.  **Verification & Completion**:
    *   The user must enter the correct OTP to confirm their phone number.
    *   Upon successful verification, a new user record must be created in the `cabi-users` DynamoDB table with the following attributes:
        *   `userType`: 'PASSENGER'
        *   `status`: 'ACTIVE'
        *   `rating`: `3` (as per the Fair Rating System specification).
5.  **Post-Registration**: After successful registration and verification, the user must be automatically logged into the app and redirected to the passenger home screen.

---

### Technical Notes

*   **Frontend**: This story requires creating new UI screens and state management logic within the Flutter `passenger-app`.
*   **Authentication Service**: All registration and authentication logic must be handled through **Amazon Cognito**, as specified in `architecture.md`. The backend will provide an abstraction layer over Cognito.
*   **API Endpoint**: The frontend will interact with the `POST /users/register` endpoint provided by the **User & MLM Service**.
*   **OTP Delivery**: The SMS for the OTP will be sent by Amazon Cognito, which is configured to use an SMS Gateway (like Twilio or AWS SNS).
*   **Data Model**: The new user record must conform to the `User Model` defined in `architecture.md`.

---

### Dev Agent Record

*   **Agent Model Used**: `gemini-1.5-pro-latest`
*   **Status**: `Completed`

#### Tasks

- [x] **Task 1: Create `RegistrationScreen`**: Create the file `apps/passenger-app/src/screens/registration_screen.dart`. Implement the UI with form fields for full name, phone, and password, including validation.
- [x] **Task 2: Create `OtpVerificationScreen`**: Create the file `apps/passenger-app/src/screens/otp_verification_screen.dart`. This screen will take a phone number, display an input for the OTP, and have a "Verify" button.
- [x] **Task 3: Update `AuthService`**: Add `register` and `verifyOtp` methods to the `AuthService` in the `passenger-app` to simulate the backend API calls.
- [x] **Task 4: Implement Registration & Verification Logic**: In `RegistrationScreen`, call the `register` service and navigate to `OtpVerificationScreen`. In `OtpVerificationScreen`, call the `verifyOtp` service and update the `AuthProvider` on success.
- [x] **Task 5: Write Tests**: Create `registration_screen_test.dart` and `otp_verification_screen_test.dart` to test form validation, successful registration flow, and error handling.

#### **Completion Notes (Definition of Done Checklist)**

*   [x] All Acceptance Criteria have been met.
*   [x] Code has been implemented following project standards.
*   [x] Comprehensive widget tests have been written for the new UI.
*   [x] All tests are passing.

#### **File List**

*   `apps/passenger-app/src/api/auth_service.dart` (modified)
*   `apps/passenger-app/src/screens/login_screen.dart` (modified)
*   `apps/passenger-app/src/screens/registration_screen.dart` (new)
*   `apps/passenger-app/src/screens/otp_verification_screen.dart` (new)
*   `apps/passenger-app/src/screens/registration_screen_test.dart` (new)
*   `apps/passenger-app/src/screens/otp_verification_screen_test.dart` (new)