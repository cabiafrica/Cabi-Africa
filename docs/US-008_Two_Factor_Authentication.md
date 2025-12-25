# US-008: Implement Two-Factor Authentication (2FA)

**As a** security-conscious user,
**I want to** enable two-factor authentication (2FA) for my account,
**So that** I can prevent unauthorized access even if my password is compromised.

---

### Description
This story introduces an optional two-factor authentication (2FA) feature for all users (passengers and drivers). When enabled, users will be required to provide a time-based one-time password (TOTP) from an authenticator app in addition to their regular password during login. This significantly enhances account security.

### Acceptance Criteria

**Setup Flow:**
- [ ] A new "Security" section is available in the user's account settings.
- [ ] Within the Security section, there is an option to "Enable Two-Factor Authentication".
- [ ] When a user starts the setup, the system generates a unique secret key.
- [ ] The UI displays a QR code (for easy scanning with authenticator apps) and the secret key in plain text for manual entry.
- [ ] The user must verify the setup by entering a valid 6-digit code from their authenticator app.
- [ ] Upon successful verification, the system presents a set of single-use recovery codes.
- [ ] The user must acknowledge that they have safely stored the recovery codes before 2FA is fully enabled.

**Login Flow:**
- [ ] When a user with 2FA enabled enters a correct password, they are redirected to a new screen to enter their 2FA code.
- [ ] Submitting a valid 2FA code grants access and completes the login.
- [ ] Submitting an invalid code displays an error message.
- [ ] A "Use a recovery code" option is available on the 2FA screen.

### Technical Notes
- The `User` model in the database must be updated to store the 2FA secret, a flag indicating if 2FA is enabled, and the hashed recovery codes.
- The `auth-service` will need new endpoints to manage the 2FA setup process (generate secret, verify code, enable 2FA).
- The login flow in the `auth-service` must be modified to include the 2FA verification step.
- A library like `otplib` or `speakeasy` should be used on the backend to generate and verify TOTP codes.