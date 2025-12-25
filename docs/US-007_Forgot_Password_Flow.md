# US-007: Implement "Forgot Password" Flow

**As a** user who has forgotten my password,
**I want to** request a password reset link via email,
**So that** I can regain access to my account by setting a new password.

---

### Description
This story covers the implementation of a secure "Forgot Password" workflow. It allows users who have lost access to their account to verify their identity via email and set a new password. This is a critical feature for user retention and account recovery.

### Acceptance Criteria
- [ ] A "Forgot Password?" link is present on the login screens.
- [ ] Clicking the link navigates the user to a page where they can enter their registered email address.
- [ ] Upon submitting their email, the backend generates a unique, single-use, time-limited password reset token.
- [ ] An email is sent to the user containing a link with the reset token (e.g., `/reset-password?token=...`).
- [ ] The user is shown a message instructing them to check their email for a reset link.
- [ ] When the user clicks the link in the email, they are taken to a "Reset Password" page.
- [ ] The "Reset Password" page contains "New Password" and "Confirm New Password" fields.
- [ ] The password complexity rules from `US-006` are enforced on the new password fields.
- [ ] Upon submitting a valid new password, the backend validates the token and updates the user's password.
- [ ] After a successful password reset, the user is notified and redirected to the login page.
- [ ] The reset token is invalidated after use or expiration to prevent reuse.

### Technical Notes
- This will require new endpoints in the `driver-lead-service` or a dedicated `auth-service` to handle the reset request and password update.
- A new email template will be needed for the password reset link.
- The `User` model may need to be updated to store the reset token and its expiration timestamp.