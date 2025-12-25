# US-006: Add Password Complexity and Confirmation to Registration

**As a** prospective driver,
**I want to** create a secure password and confirm it when I register,
**So that** I can be confident my new account is protected.

---

### Description
This story enhances the security of the driver registration process by adding password fields with complexity validation. It introduces a password field, a confirmation field, and real-time feedback to ensure users create strong, intentional passwords. This reduces the risk of account takeover and improves user confidence in the platform's security.

### Acceptance Criteria
- [ ] The registration form (`RegistrationForm.tsx`) must be updated to include a "Password" field.
- [ ] A "Confirm Password" field must be added directly below the "Password" field.
- [ ] The UI must provide real-time feedback on password complexity requirements as the user types in the "Password" field (e.g., "at least 8 characters", "contains a number", "contains an uppercase letter").
- [ ] The "Confirm Password" field must show an inline error message if its value does not match the "Password" field's value.
- [ ] The "Register Now" button should remain disabled if the password is not complex enough or if the passwords do not match.
- [ ] The chosen password must be sent securely to the `driver-lead-service`.
- [ ] The `driver-lead-service` must validate the password complexity on the server-side before creating the user.

### Technical Notes
- This will require significant updates to the `RegistrationForm` component in the `apps/marketing-website` project.
- The `RegisterLeadDto` in `apps/driver-lead-service` will need to be updated to include a `password` field.
- The `class-validator` library should be used for backend password validation.
- Consider a library like `zxcvbn` for advanced client-side password strength estimation and feedback.