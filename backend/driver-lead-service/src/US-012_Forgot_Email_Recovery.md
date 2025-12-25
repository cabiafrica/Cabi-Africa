# US-012: Implement "Forgot Email" Recovery Flow

**As a** user who has forgotten the email address for my account,
**I want to** recover my email address using my registered phone number,
**So that** I can remember my login credentials and access my account.

---

### Description
This story introduces an account recovery mechanism for users who have forgotten which email address they used to register. The user will be able to enter their phone number, verify it with a One-Time Password (OTP) sent via SMS, and then be shown a partially masked version of their registered email address.

### Acceptance Criteria
- [ ] A "Forgot Email?" link is available on the login screen.
- [ ] Clicking the link navigates the user to a new screen where they can enter their phone number.
- [ ] Upon submitting a phone number, the system sends an OTP via SMS if the number is associated with an existing account.
- [ ] To prevent phone number enumeration, the UI always displays a generic message (e.g., "If an account is associated with this phone number, an SMS with a verification code has been sent.").
- [ ] The user is navigated to a screen to enter the OTP.
- [ ] If the correct OTP is entered, the system displays the associated email address in a partially masked format (e.g., `j***n@example.com`).
- [ ] If an incorrect OTP is entered, a clear error message is shown.
- [ ] The OTP should have a short expiration time (e.g., 5-10 minutes).

### Technical Notes
- A new endpoint, `POST /auth/forgot-email/initiate`, will be needed to take a phone number and trigger the OTP SMS.
- A second endpoint, `POST /auth/forgot-email/verify`, will be needed to validate the OTP and phone number, returning the masked email on success.
- The `User` model may need temporary fields to store the "forgot email" OTP and its expiration, or this can be managed in a separate cache like Redis.
- The `UserManagementService` will need new methods to handle the logic for this flow.
- The frontend will require two new screens: one to enter the phone number and one to enter the OTP.