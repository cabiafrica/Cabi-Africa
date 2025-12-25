# US-004: Real-time Referral Code Validation

**As a** prospective driver,
**I want to** be notified immediately if the referral code I entered is invalid,
**So that** I can correct it or remove it before submitting my application.

---

### Description
This story enhances the registration form by adding real-time, client-side validation for the referral code field. When a user enters a referral code and moves away from the field, the system will check its validity and provide instant feedback. This improves the user experience and prevents bad data from entering the referral system.

### Acceptance Criteria
- [ ] When the user finishes entering a `referralCode` and the input field loses focus (onBlur event), an asynchronous request is sent to the backend to validate the code.
- [ ] A new endpoint, `GET /api/v1/driver-leads/referral/validate?code={code}`, must be created in the `Driver Lead Service`.
- [ ] If the backend returns a success (200 OK) response, a visual indicator (e.g., a green checkmark or success text) is shown next to the input field.
- [ ] If the backend returns a not found (404 Not Found) response, an inline error message like "Invalid referral code." is displayed below the input field.
- [ ] The validation check should only trigger if the referral code field is not empty.
- [ ] The user can still submit the form if they clear the invalid referral code.

### Technical Notes
- The new validation endpoint will be handled by the `DriverLeadsController` and will call a method in the `MlmService` to check for the code's existence.
- The `RegistrationForm` component in the `marketing-website` app needs to be updated to manage the state for this validation (e.g., `isValidating`, `validationError`).
- The `fetch` call should be debounced to avoid sending excessive requests while the user is typing.