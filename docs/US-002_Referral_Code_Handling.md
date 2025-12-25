# US-002: Driver Registration with Referral Code

**As a** prospective driver,
**I want to** provide a referral code when I sign up,
**So that** my referrer is correctly credited for bringing me to the platform.

---

### Description
This story builds on the basic registration form by adding the logic to handle referral codes. This is a critical component for the MLM and driver growth features.

### Acceptance Criteria
- [ ] The registration form from US-001 has an optional field for a `referralCode`.
- [ ] If a referral code is provided, the `Driver Lead Service` validates that it corresponds to an existing driver.
- [ ] If the code is valid, the new `DriverProfile` is linked to the referring user (the "sponsor").
- [ ] The `Driver Lead Service` triggers an event or calls the `MLM Service` to process the referral.
- [ ] The `MLM Service` calculates and records the appropriate commission for the sponsor in the `RegistrationFeeLedger`.

### Technical Notes
- Requires interaction between `Driver Lead Service` and `MLM Service`.
- The `User` and `DriverProfile` models in the database must support the `referrerId` relationship as defined in `architecture.md`.
- The initial commission logic can be a simple, fixed amount for the MVP.