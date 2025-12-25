# US-001: MVP Driver Registration Web Form

**As a** prospective driver,
**I want to** submit my basic information through a web form,
**So that** I can begin the process of becoming a Cabi driver.

---

### Description
This story covers the creation of the frontend and backend components for the initial driver registration form on the marketing website. This is the primary entry point for the driver acquisition funnel.

### Acceptance Criteria
- [ ] A public-facing page exists on the marketing website containing a registration form.
- [ ] The form must capture the prospect's First Name, Last Name, Email, Phone, and City.
- [ ] The form must include Google reCAPTCHA for bot protection.
- [ ] On submission, the form data is sent via a `POST` request to the `/api/v1/driver-leads/register` endpoint.
- [ ] The `Driver Lead Service` validates the incoming data and the reCAPTCHA token.
- [ ] Upon successful validation, the service creates a `User` record with a `PROSPECT` status.
- [ ] The user is shown a success message and is prompted to check their email or download the driver app to continue.

### Technical Notes
- Corresponds to the `Cabi Marketing Website` and `Driver Lead Service` components in `architecture.md`.
- The frontend should be built in the `apps/marketing-website/` directory using Next.js.
- The backend logic resides in the `apps/driver-lead-service/` using NestJS.