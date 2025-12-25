# US-003: Admin Management of MLM Fee Formula

**As an** administrator,
**I want to** view and update the MLM fee distribution formula,
**So that** I can control how registration commissions are paid out to sponsors and uplines.

---

### Description
This story covers the creation of the administrative endpoints for managing the core logic of the MLM system. This is essential for business operations to configure and adjust the referral program.

### Acceptance Criteria
- [ ] A secure `GET /admin/mlm/formula` endpoint exists that returns the current fee distribution rules.
- [ ] A secure `PUT /admin/mlm/formula` endpoint exists that allows updating the fee distribution rules.
- [ ] The `MLM Service` uses the formula stored in the database to calculate commissions.

### Technical Notes
- These endpoints will be part of the `MLM Service`.
- For the MVP, access can be secured via a simple API key or basic auth, with the assumption that a full admin UI will be built later.
- The `MlmFeeFormula` model in the database must be implemented as per `architecture.md`.