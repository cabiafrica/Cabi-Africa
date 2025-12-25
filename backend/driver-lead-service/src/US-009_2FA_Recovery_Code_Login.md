# US-009: Allow Login with 2FA Recovery Code

**As a** user who has lost access to my authenticator device,
**I want to** use one of my single-use recovery codes to log in,
**So that** I can regain access to my account and set up a new 2FA device.

---

### Description
This story adds the ability for a user to complete the two-factor authentication step using one of the recovery codes they saved during the 2FA setup process. This is a critical account recovery path for users who can no longer generate TOTP codes.

### Acceptance Criteria
- [ ] The 2FA verification screen (`/login/verify-2fa`) must have a link or button labeled "Use a recovery code".
- [ ] Clicking this link should switch the UI to a field for entering an 8-character recovery code.
- [ ] A new endpoint, `POST /api/v1/auth/2fa/recover`, must be created to handle the recovery code submission.
- [ ] The backend must securely compare the submitted recovery code against the user's stored (hashed) recovery codes.
- [ ] If a valid, unused recovery code is provided, the user is successfully authenticated and logged in.
- [ ] Upon successful use, the specific recovery code must be invalidated (i.e., removed from the user's list of valid codes) to prevent reuse.
- [ ] If an invalid or already-used code is submitted, a clear error message is displayed.
- [ ] After successfully logging in with a recovery code, the user should be strongly encouraged to reset their 2FA setup.

### Technical Notes
- The `UserManagementService` will need a new method to find a user, validate a recovery code against the stored hashes, and remove the code if valid.
- The `AuthController` will expose this new logic via the `/auth/2fa/recover` endpoint.
- The frontend `Verify2faPage` component will need state to toggle between the TOTP code input and the recovery code input.