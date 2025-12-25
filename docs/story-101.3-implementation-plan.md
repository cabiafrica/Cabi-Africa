# Story 101.3 Implementation Plan
**Story:** Implement Backend for Web-Based Driver Registration  
**Status:** IN PROGRESS  
**Assigned To:** Development Team  
**PO:** Sarah  
**Date:** 2025-12-12

---

## Implementation Status

### ✅ **What Exists:**
- NestJS `driver-lead-service` application structure
- Basic controller with `/driver-leads/register` endpoint
- DTO validation for registration data
- MLM service stub

### ❌ **What's Missing (Critical):**
1. reCAPTCHA validation
2. User/DriverProfile creation (PROSPECT status)
3. Stripe payment integration
4. MLM commission distribution trigger
5. Email notifications
6. Error handling
7. Frontend integration

---

## Implementation Tasks

### **Task 1: Enhance RegisterLeadDto** ✅ (Partially Done)
**Current:** Basic fields exist  
**Needed:** Add vehicle and document fields

**Action Items:**
- [ ] Add vehicle type, make, model, year
- [ ] Add license plate, national ID, driving license
- [ ] Add address fields (street, city, county)
- [ ] Add date of birth
- [ ] Add terms acceptance boolean

---

### **Task 2: Implement reCAPTCHA Validation** ❌
**Priority:** HIGH (Security requirement NFR2)

**Action Items:**
- [ ] Install `@google-cloud/recaptcha-enterprise` or `axios`
- [ ] Create `RecaptchaService`
- [ ] Implement `verifyToken(token: string)` method
- [ ] Add to environment variables: `RECAPTCHA_SECRET_KEY`
- [ ] Call in registration flow before processing

**Code Location:**
- `apps/driver-lead-service/src/recaptcha/recaptcha.service.ts`

---

### **Task 3: User Management Integration** ❌
**Priority:** CRITICAL (Core functionality)

**Action Items:**
- [ ] Create `UserManagementService` client
- [ ] Implement `createProspectDriver()` method
- [ ] Create User record with hashed password
- [ ] Create DriverProfile with PROSPECT status
- [ ] Link referrer if referralCode provided
- [ ] Assign to DriverGroup if applicable

**Database Schema Needed:**
```sql
-- User table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DriverProfile table
CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  date_of_birth DATE,
  application_status VARCHAR DEFAULT 'PROSPECT',
  referrer_id UUID REFERENCES driver_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  driver_profile_id UUID REFERENCES driver_profiles(id),
  type VARCHAR NOT NULL,
  make VARCHAR,
  model VARCHAR,
  year INTEGER,
  license_plate VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  driver_profile_id UUID REFERENCES driver_profiles(id),
  type VARCHAR NOT NULL, -- 'NATIONAL_ID', 'DRIVING_LICENSE', etc.
  document_number VARCHAR,
  status VARCHAR DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Code Location:**
- `apps/driver-lead-service/src/user-management/user-management.service.ts`

---

### **Task 4: Stripe Payment Integration** ❌
**Priority:** CRITICAL (Revenue blocking)

**Action Items:**
- [ ] Install `stripe` npm package
- [ ] Create `PaymentService`
- [ ] Implement `createPaymentIntent(amount, metadata)` method
- [ ] Create payment page in user-portal
- [ ] Handle payment webhooks
- [ ] Store payment records in database

**Environment Variables:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Payment Flow:**
1. Frontend calls `/driver-leads/register`
2. Backend creates PROSPECT user
3. Backend creates Stripe PaymentIntent (KES 2,000)
4. Returns clientSecret to frontend
5. Frontend shows Stripe payment form
6. User completes payment
7. Stripe webhook confirms payment
8. Backend updates user status
9. Backend triggers MLM distribution

**Code Location:**
- `apps/driver-lead-service/src/payment/payment.service.ts`
- `apps/driver-lead-service/src/payment/payment.controller.ts` (webhooks)
- `apps/user-portal/src/pages/drivers/register/payment.tsx`

---

### **Task 5: MLM Commission Distribution** ❌
**Priority:** HIGH (Depends on Task 4)

**Action Items:**
- [ ] Implement `POST /mlm/distribute-fee` endpoint
- [ ] Calculate commissions (30%, 15%, 5%)
- [ ] Traverse referral hierarchy
- [ ] Create RegistrationFeeLedger records
- [ ] Update referrer balances
- [ ] Send commission notifications

**Commission Structure:**
- Level 1 (Direct): 30% of KES 2,000 = KES 600
- Level 2: 15% = KES 300
- Level 3: 5% = KES 100
- Platform: 50% = KES 1,000

**Database Schema:**
```sql
CREATE TABLE registration_fee_ledger (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES driver_profiles(id),
  referrer_id UUID REFERENCES driver_profiles(id),
  level INTEGER, -- 1, 2, or 3
  amount DECIMAL(10,2),
  fee_paid DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Code Location:**
- `apps/mlm-service/src/mlm.controller.ts`
- `apps/mlm-service/src/mlm.service.ts`

---

### **Task 6: Email Notifications** ❌
**Priority:** MEDIUM

**Action Items:**
- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Create email templates
- [ ] Send registration confirmation
- [ ] Send payment receipt
- [ ] Send next steps instructions
- [ ] Send commission earned notifications

**Email Templates Needed:**
1. **Registration Confirmation**
   - Welcome message
   - Next steps
   - Document upload instructions

2. **Payment Receipt**
   - Amount paid
   - Transaction ID
   - Receipt PDF

3. **Commission Earned**
   - Referral name
   - Commission amount
   - Current balance

**Code Location:**
- `apps/driver-lead-service/src/email/email.service.ts`
- `apps/driver-lead-service/src/email/templates/`

---

### **Task 7: Frontend Integration** ❌
**Priority:** HIGH

**Action Items:**
- [ ] Update registration form to call real API
- [ ] Create payment page with Stripe Elements
- [ ] Handle success/error responses
- [ ] Show loading states
- [ ] Redirect to success page

**Files to Modify:**
- `apps/user-portal/src/pages/drivers/register.tsx`
- `apps/user-portal/src/pages/drivers/group-register.tsx`

**New Files:**
- `apps/user-portal/src/pages/drivers/register/payment.tsx`
- `apps/user-portal/src/pages/drivers/register/success.tsx`

---

## Environment Setup

### **Required Environment Variables:**

```env
# reCAPTCHA
RECAPTCHA_SECRET_KEY=your_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cabi

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@cabi.com

# App URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

---

## Testing Plan

### **Unit Tests:**
- [ ] RecaptchaService.verifyToken()
- [ ] UserManagementService.createProspectDriver()
- [ ] PaymentService.createPaymentIntent()
- [ ] MlmService.distributeFee()
- [ ] EmailService.sendRegistrationConfirmation()

### **Integration Tests:**
- [ ] Full registration flow (happy path)
- [ ] Invalid reCAPTCHA handling
- [ ] Duplicate email handling
- [ ] Invalid referral code handling
- [ ] Payment failure handling
- [ ] MLM distribution accuracy

### **E2E Tests:**
- [ ] User registers → pays → receives email → commission distributed
- [ ] Group registration flow
- [ ] Referral code flow

---

## Acceptance Criteria Checklist

From Story 101.3:

- [ ] `driver-lead-service` exists and is configured ✅ (Partially)
- [ ] `POST /driver-leads/register` endpoint implemented
- [ ] reCAPTCHA validation working
- [ ] User + DriverProfile creation (PROSPECT status)
- [ ] Referral code validation and linking
- [ ] DriverGroup assignment
- [ ] Stripe payment integration
- [ ] MLM Service trigger on payment success
- [ ] Frontend calls real endpoint
- [ ] Returns 201 with userId on success
- [ ] Returns appropriate error codes (400, etc.)

---

## Timeline Estimate

### **Week 1:**
- Day 1-2: Database schema + User Management
- Day 3: reCAPTCHA + validation
- Day 4-5: Stripe payment integration

### **Week 2:**
- Day 1-2: MLM commission distribution
- Day 3: Email notifications
- Day 4: Frontend integration
- Day 5: Testing

### **Week 3:**
- Day 1-2: Bug fixes
- Day 3-4: E2E testing
- Day 5: Deployment

**Total:** 15 working days (3 weeks)

---

## Risks & Mitigations

### **Risk 1: Stripe Integration Complexity**
- **Mitigation:** Use official Stripe libraries, follow documentation
- **Fallback:** Start with test mode, validate before production

### **Risk 2: MLM Calculation Errors**
- **Mitigation:** Comprehensive unit tests, audit logging
- **Fallback:** Manual review dashboard for admins

### **Risk 3: Database Performance**
- **Mitigation:** Proper indexing, connection pooling
- **Fallback:** Monitor query performance, optimize as needed

---

## Next Steps

### **Immediate Actions:**
1. Set up development database (PostgreSQL)
2. Create database migrations
3. Set up Stripe test account
4. Get reCAPTCHA keys
5. Set up email service

### **Development Order:**
1. Database schema (Task 3)
2. User Management Service (Task 3)
3. reCAPTCHA validation (Task 2)
4. Stripe payment (Task 4)
5. MLM distribution (Task 5)
6. Email notifications (Task 6)
7. Frontend integration (Task 7)

---

## Questions for Team

1. **Database:** PostgreSQL or MySQL preference?
2. **Email Service:** SendGrid or AWS SES?
3. **Deployment:** AWS Lambda or EC2?
4. **Monitoring:** Sentry, DataDog, or CloudWatch?

---

**Status:** Ready to begin implementation  
**Blocker:** None (all dependencies available)  
**Next:** Start with database schema and User Management Service

---

*Implementation Plan by Sarah (Product Owner)*  
*Last Updated: 2025-12-12*
