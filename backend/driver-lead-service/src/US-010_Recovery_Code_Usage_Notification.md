# US-010: Notify User on Recovery Code Login

**As a** security-conscious user,
**I want to** receive an email notification when a recovery code is used to log into my account,
**So that** I am immediately aware of this critical security event and can take action if it wasn't me.

---

### Description
This story implements a security alert system. When a user successfully logs in using one of their single-use 2FA recovery codes, the system will automatically send a notification email to their registered email address. This alerts the user to a sensitive action on their account, allowing them to respond quickly if the activity is suspicious.

### Acceptance Criteria
- [ ] Upon a successful login via `loginWithRecoveryCode`, an email notification must be sent to the user's primary email address.
- [ ] The email subject line must be clear and urgent (e.g., "Security Alert: A Recovery Code Was Used for Your Cabi Account").
- [ ] The email body must clearly state that a recovery code was used to access the account.
- [ ] The email should include relevant security details, such as the approximate time of the login.
- [ ] The email must contain clear instructions for the user on what to do if they do not recognize this activity (e.g., "If this wasn't you, please secure your account immediately by resetting your password.").
- [ ] The email sending process should not block the login flow; it should be handled asynchronously.

### Technical Notes
- A new `NotificationService` should be created or an existing one should be leveraged to handle sending emails. This service will likely integrate with a third-party email provider (e.g., SendGrid, AWS SES).
- The `loginWithRecoveryCode` method in `UserManagementService` must be updated to call this `NotificationService`.
- An email template for the security alert needs to be designed and implemented.
- The system should be able to capture basic request information (like the time) to include in the email.