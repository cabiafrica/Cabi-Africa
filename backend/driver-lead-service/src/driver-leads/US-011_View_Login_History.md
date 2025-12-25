# US-011: View Login History

**As a** security-conscious user,
**I want to** view a history of recent login activity on my account,
**So that** I can monitor for and identify any suspicious or unauthorized access.

---

### Description
This story introduces a feature for users to review their recent login history. This provides transparency and allows users to spot unusual activity, such as logins from unrecognized devices or locations, enhancing their ability to secure their account.

### Acceptance Criteria
- [ ] A new "Login History" or "Recent Activity" section is available in the user's "Security" settings page.
- [ ] This section displays a list of the last 10-15 login events, with the most recent first.
- [ ] Each login event in the list must show:
  - Date and Time of login.
  - Approximate Location (derived from IP address, e.g., "City, Country").
  - Device / User Agent (e.g., "Chrome on Windows").
  - IP Address.
- [ ] The system must log relevant information for each successful login attempt (user ID, IP address, user agent, timestamp).
- [ ] A new `LoginHistory` model must be added to the database schema to store this information.
- [ ] A new, protected backend endpoint must be created to fetch the login history for the currently authenticated user.

### Technical Notes
- The `login`, `loginWithTwoFactor`, and `loginWithRecoveryCode` methods in `UserManagementService` must be updated to create a new `LoginHistory` record upon successful authentication.
- The `LoginHistory` record should be created asynchronously to avoid delaying the login response.
- A service like `geoip-lite` or a third-party API can be used to resolve IP addresses to approximate locations.
- The `User` model in the Prisma schema should be updated with a one-to-many relationship to the new `LoginHistory` model.
- The new endpoint could be `GET /auth/login-history` and should be protected by the `JwtAuthGuard`.