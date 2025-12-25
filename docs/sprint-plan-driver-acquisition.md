# Sprint Plan: Driver Acquisition & MLM Registration Funnel
**Epic:** epic-101 (driver-acquisition-funnel)  
**Created:** 2025-12-12  
**Author:** Bob (Scrum Master)  
**Sprint Duration:** 2 weeks per sprint  
**Total Estimated Duration:** 6-8 weeks (3-4 sprints)

---

## 🎯 **Sprint Overview**

This plan sequences the 4 stories in the Driver Acquisition Funnel epic to maximize value delivery while respecting technical dependencies. The approach follows an **incremental delivery model**, allowing early validation and feedback.

---

## **Sprint 1: Foundation & Marketing Presence** (Weeks 1-2)
**Goal:** Establish the marketing website foundation and create a professional web presence to attract drivers.

### **Stories:**
- ✅ **story-101.1**: Create Static Marketing Pages for Driver Acquisition
  - **Status:** IN_PROGRESS
  - **Priority:** HIGH
  - **Story Points:** 8
  - **Dependencies:** None (greenfield)

### **Deliverables:**
- [ ] Next.js application (`user-portal`) configured and deployed
- [ ] Homepage with compelling driver value proposition
- [ ] "About Us" page with company mission and values
- [ ] "Why Drive with Us?" page highlighting benefits and earning potential
- [ ] Comprehensive FAQ section
- [ ] Tailwind CSS design system established
- [ ] All pages achieve PageSpeed ≥85

### **Acceptance Criteria Validation:**
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] PageSpeed Insights shows ≥85 for mobile and desktop
- [ ] Content is placeholder-ready for marketing team review
- [ ] Navigation is intuitive and accessible

### **Sprint 1 Success Metrics:**
- PageSpeed score: ≥85 (both mobile/desktop)
- Lighthouse accessibility score: ≥90
- Zero critical console errors
- Deployment pipeline functional

### **Risks & Mitigations:**
- **Risk:** Performance targets not met
  - **Mitigation:** Use Next.js SSG for static pages, optimize images, implement CDN
- **Risk:** Design inconsistencies
  - **Mitigation:** Establish Tailwind config early, create reusable components

---

## **Sprint 2: Registration Form UI & User Experience** (Weeks 3-4)
**Goal:** Enable prospective drivers to begin the registration process through a polished, secure web form.

### **Stories:**
- ✅ **story-101.2**: Implement Web-Based Driver Registration Form UI
  - **Status:** READY
  - **Priority:** HIGH
  - **Story Points:** 13
  - **Dependencies:** story-101.1 (requires homepage for CTA link)

### **Deliverables:**
- [ ] Multi-step registration form component (`DriverRegistrationForm.tsx`)
- [ ] Form fields: First Name, Last Name, Email, Phone, City, Referral Code (optional)
- [ ] Client-side validation (email format, required fields, phone format)
- [ ] Google reCAPTCHA v3 integration
- [ ] Success message with "Download App" CTA
- [ ] Stubbed API submission handler (for testing)
- [ ] Form state management (React Hook Form or similar)
- [ ] Error handling and user feedback

### **Acceptance Criteria Validation:**
- [ ] All required fields validate correctly
- [ ] reCAPTCHA token is generated on form submission
- [ ] Optional referral code field accepts alphanumeric codes
- [ ] Form is accessible (keyboard navigation, screen reader compatible)
- [ ] Success state shows clear next steps
- [ ] Form submission is stubbed but functional

### **Sprint 2 Success Metrics:**
- Form completion rate (test users): >80%
- Average form completion time: <2 minutes
- Client-side validation catches 100% of invalid inputs
- reCAPTCHA successfully blocks bot submissions (test with automated tools)

### **Testing Strategy:**
- Unit tests for validation logic
- Integration tests for reCAPTCHA flow
- Manual UX testing with 10+ test users
- Accessibility audit (WCAG 2.1 AA compliance)

### **Risks & Mitigations:**
- **Risk:** reCAPTCHA integration complexity
  - **Mitigation:** Use official React library, test with Google's test keys first
- **Risk:** Poor mobile UX
  - **Mitigation:** Mobile-first design, test on real devices

---

## **Sprint 3: Backend Services & Payment Integration** (Weeks 5-6)
**Goal:** Implement the complete backend infrastructure for driver registration, payment processing, and user creation.

### **Stories:**
- ✅ **story-101.3**: Implement Backend for Web-Based Driver Registration
  - **Status:** READY
  - **Priority:** HIGH
  - **Story Points:** 21
  - **Dependencies:** story-101.2 (requires frontend form)

### **Deliverables:**
- [ ] `driver-lead-service` NestJS application created
- [ ] `POST /driver-leads/register` endpoint implemented
- [ ] reCAPTCHA server-side validation
- [ ] Integration with User Management Service:
  - [ ] Create `User` record
  - [ ] Create `DriverProfile` with `applicationStatus: PROSPECT`
  - [ ] Link referrer via `referrerId` if referral code provided
  - [ ] Assign to `DriverGroup` if applicable
- [ ] Stripe payment integration:
  - [ ] Create payment intent
  - [ ] Collect registration fee
  - [ ] Handle payment success/failure
- [ ] Trigger `MLM Service` via `POST /mlm/distribute-fee`
- [ ] Error handling and logging
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Update frontend form to call live endpoint

### **Acceptance Criteria Validation:**
- [ ] reCAPTCHA validation rejects invalid tokens
- [ ] User and DriverProfile are created with correct data
- [ ] Referral code validation works (valid/invalid/missing)
- [ ] Stripe payment flow completes successfully
- [ ] MLM Service is triggered after successful payment
- [ ] API returns 201 with userId on success
- [ ] API returns appropriate 400/500 errors on failure
- [ ] All database transactions are atomic (rollback on failure)

### **Sprint 3 Success Metrics:**
- API response time: <500ms (p95)
- Payment success rate: >95% (test transactions)
- Zero data inconsistencies (User without DriverProfile, etc.)
- 100% test coverage for critical paths

### **Testing Strategy:**
- Unit tests for all service methods
- Integration tests for User Management Service calls
- E2E tests for complete registration flow
- Stripe test mode validation (success, failure, edge cases)
- Load testing (100 concurrent registrations)

### **Risks & Mitigations:**
- **Risk:** Payment processing failures
  - **Mitigation:** Implement idempotency keys, retry logic, manual reconciliation process
- **Risk:** Database transaction failures
  - **Mitigation:** Use Prisma transactions, implement rollback logic
- **Risk:** MLM Service unavailable
  - **Mitigation:** Implement async queue (e.g., Bull/Redis), retry failed distributions

---

## **Sprint 4: MLM Commission Distribution & End-to-End Validation** (Weeks 7-8)
**Goal:** Complete the MLM fee distribution logic and validate the entire funnel from visitor to commission payout.

### **Stories:**
- ✅ **story-101.4**: Implement Backend for MLM Registration Fee Distribution
  - **Status:** READY
  - **Priority:** HIGH
  - **Story Points:** 21
  - **Dependencies:** story-101.3 (requires driver-lead-service trigger)

### **Deliverables:**
- [ ] `mlm-service` NestJS application created
- [ ] `POST /mlm/distribute-fee` endpoint implemented
- [ ] Fetch referral hierarchy from User Management Service
- [ ] Read `MlmFeeFormula` from database
- [ ] Calculate commissions for sponsor and upline (multi-level)
- [ ] Create `RegistrationFeeLedger` entries for each recipient
- [ ] Handle edge cases (no referrer, invalid hierarchy, formula changes)
- [ ] Audit logging for all commission calculations
- [ ] Admin endpoint to view ledger entries (basic)
- [ ] Update User Management Service to expose hierarchy endpoint

### **Acceptance Criteria Validation:**
- [ ] Commission calculations are mathematically correct
- [ ] Ledger entries link newDriverId, recipientId, and amount correctly
- [ ] Multi-level referrals are handled (sponsor, sponsor's sponsor, etc.)
- [ ] Formula changes don't affect past registrations (use timestamp)
- [ ] System handles missing referrers gracefully
- [ ] All calculations are auditable via RegistrationFeeLedger

### **Sprint 4 Success Metrics:**
- Commission calculation accuracy: 100% (verified against manual calculations)
- Ledger entry creation success rate: 100%
- Average distribution processing time: <2 seconds
- Zero orphaned ledger entries (all link to valid users)

### **End-to-End Validation:**
- [ ] Complete user journey test:
  1. Visitor lands on homepage
  2. Clicks "Sign Up to Drive"
  3. Fills registration form with referral code
  4. Completes reCAPTCHA
  5. Pays registration fee via Stripe
  6. User and DriverProfile created with PROSPECT status
  7. MLM Service calculates commissions
  8. Ledger entries created for sponsor and upline
  9. Success message displayed with app download link
- [ ] Test with 10+ real user flows (different referral chains)
- [ ] Verify all data in database is consistent
- [ ] Confirm Stripe webhooks are processed correctly

### **Testing Strategy:**
- Unit tests for commission calculation logic
- Integration tests for User Management Service hierarchy calls
- E2E tests for complete registration → distribution flow
- Manual QA with various referral chain depths (1-level, 2-level, 3-level)
- Financial audit of ledger entries

### **Risks & Mitigations:**
- **Risk:** Commission calculation errors
  - **Mitigation:** Comprehensive unit tests, manual verification, admin review dashboard
- **Risk:** Race conditions in concurrent registrations
  - **Mitigation:** Database-level locking, idempotency checks
- **Risk:** Formula changes break existing logic
  - **Mitigation:** Version formulas, apply based on registration timestamp

---

## 📊 **Sprint Capacity Planning**

### **Team Composition:**
- 2 Frontend Developers (React/Next.js)
- 2 Backend Developers (NestJS/Node.js)
- 1 Full-Stack Developer (can support both)
- 1 QA Engineer
- 1 DevOps Engineer (part-time for deployment)

### **Story Points Breakdown:**
| Sprint | Story | Points | Velocity Target |
|--------|-------|--------|-----------------|
| Sprint 1 | story-101.1 | 8 | 8-13 |
| Sprint 2 | story-101.2 | 13 | 13-21 |
| Sprint 3 | story-101.3 | 21 | 21-34 |
| Sprint 4 | story-101.4 | 21 | 21-34 |
| **Total** | | **63** | |

### **Velocity Assumptions:**
- Sprint 1: Lower velocity (setup, learning curve)
- Sprint 2-4: Higher velocity (team ramped up, patterns established)

---

## 🚀 **Deployment Strategy**

### **Sprint 1:**
- Deploy to **Staging** environment
- Marketing team reviews content
- Performance testing on staging

### **Sprint 2:**
- Deploy form UI to **Staging**
- Internal team testing (dogfooding)
- UX feedback collection

### **Sprint 3:**
- Deploy backend services to **Staging**
- Integration testing with Stripe test mode
- Security audit (reCAPTCHA, payment handling)

### **Sprint 4:**
- Deploy MLM Service to **Staging**
- Complete E2E testing
- **Production Deployment** (soft launch)
- Monitor metrics for 1 week
- **Full Launch** if metrics are green

---

## 📈 **Success Criteria for Epic Completion**

### **Functional Requirements:**
- ✅ All 4 stories are implemented and pass QA
- ✅ End-to-end registration flow works without errors
- ✅ PageSpeed score ≥85 on all pages
- ✅ reCAPTCHA blocks bot submissions
- ✅ Stripe payment integration is PCI-compliant
- ✅ MLM commissions are calculated correctly

### **Non-Functional Requirements:**
- ✅ API response time <500ms (p95)
- ✅ Payment success rate >95%
- ✅ Zero critical bugs in production
- ✅ 100% uptime during business hours

### **Business Metrics (Post-Launch):**
- Driver registration conversion rate: >20%
- Registration form completion rate: >80%
- MLM referral adoption rate: >40%
- Average registration time: <3 minutes

---

## 🔄 **Sprint Ceremonies**

### **Daily Standups (15 min):**
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

### **Sprint Planning (2 hours):**
- Review sprint goal
- Break down stories into tasks
- Assign tasks to team members
- Commit to sprint backlog

### **Sprint Review (1 hour):**
- Demo completed stories
- Gather stakeholder feedback
- Update product backlog

### **Sprint Retrospective (1 hour):**
- What went well?
- What could be improved?
- Action items for next sprint

---

## 📋 **Definition of Ready (DoR)**

Before a story enters a sprint:
- [ ] Acceptance criteria are clear and testable
- [ ] Dependencies are identified and resolved
- [ ] Design mockups are available (for UI stories)
- [ ] API contracts are defined (for backend stories)
- [ ] Team has estimated story points
- [ ] Product Owner has prioritized the story

---

## ✅ **Definition of Done (DoD)**

Before a story is considered complete:
- [ ] Code is written and reviewed (2+ approvals)
- [ ] Unit tests are written and passing (>80% coverage)
- [ ] Integration tests are written and passing
- [ ] Documentation is updated (API docs, README)
- [ ] QA has validated acceptance criteria
- [ ] No critical or high-priority bugs
- [ ] Code is merged to main branch
- [ ] Deployed to staging environment
- [ ] Product Owner has accepted the story

---

## 🎯 **Next Steps**

1. **Schedule Sprint 1 Planning** (this week)
2. **Assign story-101.1 to frontend team**
3. **Set up project tracking** (Jira, Linear, or GitHub Projects)
4. **Create Slack channel** for epic coordination
5. **Schedule stakeholder demo** for end of Sprint 2

---

**Questions or concerns? Let's discuss in the next planning session!** 🚀
