# UPDATED Task Breakdowns: Driver Acquisition Epic
## Accounting for Existing Implementation

**Epic:** epic-101 (driver-acquisition-funnel)  
**Updated:** 2025-12-12  
**Author:** Bob (Scrum Master)

---

## 🎯 **IMPORTANT: Existing Implementation Audit**

### **✅ Already Implemented:**

#### **Frontend (user-portal):**
- ✅ `/drivers` page (For Drivers landing page) - **story-101.1 MOSTLY DONE**
- ✅ `/drivers/register.tsx` - Basic registration form with reCAPTCHA
- ✅ `/drivers/register_multi_step.tsx` - Multi-step form (needs alignment)
- ✅ `MainLayout` component with Header and Footer
- ✅ `Testimonials` component
- ✅ reCAPTCHA integration (Google reCaptcha v3)
- ✅ React Hook Form with Zod validation
- ✅ Basic API route `/api/register`

#### **Backend (driver-lead-service):**
- ✅ `driver-lead-service` application exists
- ✅ `driver-leads.controller.ts`, `driver-leads.service.ts`, `driver-leads.module.ts`
- ✅ `register-lead.dto.ts` (DTO for registration)
- ✅ `mlm.service.ts` (MLM logic exists in driver-lead-service)
- ✅ Prisma service integration
- ✅ Email provider setup

#### **Backend (mlm-service):**
- ✅ `mlm-service` application exists
- ✅ `mlm.service.ts` (commission calculation logic)

### **⚠️ Needs Alignment/Completion:**
- ⚠️ Registration forms need to be consolidated (two versions exist)
- ⚠️ Stripe payment integration not yet implemented
- ⚠️ reCAPTCHA server-side validation needs verification
- ⚠️ MLM Service trigger from driver-lead-service needs verification
- ⚠️ Frontend needs to call live backend endpoint (currently stubbed)
- ⚠️ E2E tests need to be written

---

## 📋 **REVISED Story 101.1: Static Marketing Pages**

**Status:** ✅ **MOSTLY COMPLETE**  
**Remaining Work:** 2-4 hours

### **What's Already Done:**
- ✅ `/drivers` page (For Drivers landing page) with hero, benefits, testimonials
- ✅ `/about` page exists
- ✅ `MainLayout` with Header and Footer
- ✅ Tailwind CSS configured
- ✅ Responsive design

### **Remaining Tasks:**

#### **Task 1.1: Create FAQ Page** ⏳
**Estimated Hours:** 2  
**Assignee:** @frontend-dev-1

**Subtasks:**
- [ ] Create `apps/user-portal/src/pages/faq.tsx`
- [ ] Add FAQ content (20+ questions)
- [ ] Implement accordion UI for questions
- [ ] Add search functionality
- [ ] Wrap in `MainLayout`

#### **Task 1.2: Performance Optimization** ⏳
**Estimated Hours:** 2  
**Assignee:** @frontend-dev-1

**Subtasks:**
- [ ] Run PageSpeed Insights on all pages
- [ ] Optimize images (convert to WebP, add lazy loading)
- [ ] Implement code splitting
- [ ] Achieve PageSpeed ≥85

**Acceptance Criteria:**
- [ ] FAQ page is live and functional
- [ ] All pages achieve PageSpeed ≥85
- [ ] Images are optimized

---

## 📋 **REVISED Story 101.2: Registration Form UI**

**Status:** ✅ **MOSTLY COMPLETE**  
**Remaining Work:** 8-12 hours

### **What's Already Done:**
- ✅ `/drivers/register.tsx` - Single-page form with reCAPTCHA
- ✅ `/drivers/register_multi_step.tsx` - Multi-step form (3 steps)
- ✅ React Hook Form + Zod validation
- ✅ reCAPTCHA v3 integration
- ✅ Success state UI
- ✅ Form fields: firstName, lastName, email, phone, city, referralCode

### **Issues to Fix:**

#### **Task 2.1: Consolidate Registration Forms** 🔧
**Estimated Hours:** 4  
**Assignee:** @frontend-dev-1

**Problem:** Two registration forms exist:
1. `/drivers/register.tsx` - Single-page, aligned with PRD (firstName, lastName, email, phone, city, referralCode)
2. `/drivers/register_multi_step.tsx` - Multi-step, includes vehicle details (NOT in PRD for initial registration)

**Decision:** Use `/drivers/register.tsx` as the canonical form, archive `register_multi_step.tsx`

**Subtasks:**
- [ ] Review both forms and confirm `/drivers/register.tsx` matches PRD requirements
- [ ] Remove or archive `/drivers/register_multi_step.tsx` (vehicle details belong in Driver App, not web registration)
- [ ] Ensure `/drivers/register.tsx` has all required fields per Architecture Section 8 (RegistrationRequest schema)
- [ ] Update validation schema to match Architecture exactly
- [ ] Test form end-to-end

**Acceptance Criteria:**
- [ ] Only one registration form exists: `/drivers/register.tsx`
- [ ] Form matches PRD Section 2.6 (Driver Acquisition Funnel)
- [ ] Form matches Architecture Section 8 (RegistrationRequest schema)
- [ ] Validation is correct for all fields

---

#### **Task 2.2: Enhance Success State** 🔧
**Estimated Hours:** 2  
**Assignee:** @frontend-dev-2

**Current State:** Success message exists but needs enhancement

**Subtasks:**
- [ ] Add animated checkmark icon
- [ ] Add iOS and Android download buttons with real app store links
- [ ] Add deep link URLs for seamless app handoff
- [ ] Add analytics tracking for success event
- [ ] Improve copy to emphasize next steps

**Acceptance Criteria:**
- [ ] Success animation plays
- [ ] Download buttons link to correct app stores
- [ ] Analytics event fires on success

---

#### **Task 2.3: Add Payment Flow UI** ⏳ **NEW**
**Estimated Hours:** 6  
**Assignee:** @frontend-dev-2

**Problem:** Current form doesn't include payment step

**Subtasks:**
- [ ] Install `@stripe/react-stripe-js` and `@stripe/stripe-js`
- [ ] Create Stripe Elements component for payment
- [ ] Add payment step after form submission
- [ ] Implement payment intent creation
- [ ] Handle payment success/failure
- [ ] Add loading states for payment processing

**Technical Details:**
```tsx
// apps/user-portal/src/components/PaymentForm.tsx
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PaymentForm({ clientSecret, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}

function CheckoutForm({ onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/drivers/register/success`,
      },
    });
    
    if (error) {
      onError(error.message);
    } else {
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Pay Registration Fee ($50)
      </button>
    </form>
  );
}
```

**Acceptance Criteria:**
- [ ] Payment form displays after registration form submission
- [ ] Stripe payment intent is created
- [ ] Payment success triggers registration completion
- [ ] Payment failure shows error message

---

## 📋 **REVISED Story 101.3: Registration Backend**

**Status:** ⚠️ **PARTIALLY COMPLETE**  
**Remaining Work:** 24-30 hours

### **What's Already Done:**
- ✅ `driver-lead-service` application exists
- ✅ Basic controller, service, module structure
- ✅ `register-lead.dto.ts` exists
- ✅ Prisma service integration
- ✅ `mlm.service.ts` exists in driver-lead-service

### **Tasks to Complete:**

#### **Task 3.1: Verify and Enhance Registration Endpoint** 🔧
**Estimated Hours:** 6  
**Assignee:** @backend-dev-1

**Subtasks:**
- [ ] Review existing `driver-leads.controller.ts` and `driver-leads.service.ts`
- [ ] Verify `POST /driver-leads/register` endpoint exists and matches Architecture Section 8
- [ ] Ensure DTO matches RegistrationRequest schema exactly
- [ ] Add comprehensive validation (class-validator decorators)
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add request logging

**Files to Review:**
- `apps/driver-lead-service/src/driver-leads.controller.ts`
- `apps/driver-lead-service/src/driver-leads.service.ts`
- `apps/driver-lead-service/src/register-lead.dto.ts`

---

#### **Task 3.2: Implement reCAPTCHA Server-Side Validation** ⏳
**Estimated Hours:** 4  
**Assignee:** @backend-dev-2

**Subtasks:**
- [ ] Create `recaptcha.service.ts` if not exists
- [ ] Implement Google reCAPTCHA API call
- [ ] Add score threshold validation (>= 0.5)
- [ ] Integrate into registration endpoint
- [ ] Add error handling
- [ ] Write unit tests

**Acceptance Criteria:**
- [ ] reCAPTCHA tokens are validated server-side
- [ ] Invalid tokens return 400 error
- [ ] Low-score tokens are rejected

---

#### **Task 3.3: Implement User + DriverProfile Creation** 🔧
**Estimated Hours:** 6  
**Assignee:** @backend-dev-1

**Subtasks:**
- [ ] Review existing user creation logic in `driver-leads.service.ts`
- [ ] Ensure User is created with email (password can be null for web registration)
- [ ] Ensure DriverProfile is created with `applicationStatus: 'PROSPECT'`
- [ ] Implement referral code validation
- [ ] Link referrer via `referrerId` field
- [ ] Generate unique referral code for new driver
- [ ] Use Prisma transaction for atomicity
- [ ] Write integration tests

**Acceptance Criteria:**
- [ ] User and DriverProfile are created atomically
- [ ] PROSPECT status is set correctly
- [ ] Referral linking works
- [ ] Invalid referral codes return 400

---

#### **Task 3.4: Integrate Stripe Payment** ⏳ **NEW**
**Estimated Hours:** 10  
**Assignee:** @backend-dev-2

**Subtasks:**
- [ ] Install Stripe SDK (`stripe` package)
- [ ] Create `stripe.service.ts`
- [ ] Implement payment intent creation endpoint
- [ ] Implement payment confirmation
- [ ] Add webhook endpoint for `payment_intent.succeeded`
- [ ] Implement idempotency (prevent duplicate charges)
- [ ] Add error handling
- [ ] Write integration tests with Stripe test mode

**New Endpoints:**
- `POST /driver-leads/create-payment-intent` - Returns clientSecret
- `POST /driver-leads/confirm-payment` - Confirms payment and completes registration
- `POST /webhooks/stripe` - Handles Stripe webhooks

**Acceptance Criteria:**
- [ ] Payment intent is created with $50 amount
- [ ] Payment confirmation works
- [ ] Webhook handles payment success
- [ ] Idempotency prevents duplicate charges

---

#### **Task 3.5: Trigger MLM Service** 🔧
**Estimated Hours:** 4  
**Assignee:** @backend-dev-1

**Problem:** `mlm.service.ts` exists in `driver-lead-service`, but should be a separate service call

**Subtasks:**
- [ ] Review existing `mlm.service.ts` in driver-lead-service
- [ ] Create HTTP client to call `mlm-service` (separate app)
- [ ] Implement `POST /mlm/distribute-fee` call after successful payment
- [ ] Add retry logic (3 attempts)
- [ ] Add error handling and logging
- [ ] Write integration tests

**Acceptance Criteria:**
- [ ] MLM Service is called after payment success
- [ ] Failed calls are retried
- [ ] All calls are logged

---

#### **Task 3.6: Update Frontend API Integration** 🔧
**Estimated Hours:** 4  
**Assignee:** @frontend-dev-1

**Subtasks:**
- [ ] Update `/api/register` route to call live backend
- [ ] Replace stubbed API call with real endpoint
- [ ] Add payment flow integration
- [ ] Update error handling
- [ ] Test end-to-end flow

**Acceptance Criteria:**
- [ ] Form calls real backend endpoint
- [ ] Payment flow works end-to-end
- [ ] Errors are handled gracefully

---

## 📋 **REVISED Story 101.4: MLM Fee Distribution**

**Status:** ⚠️ **PARTIALLY COMPLETE**  
**Remaining Work:** 16-20 hours

### **What's Already Done:**
- ✅ `mlm-service` application exists
- ✅ `mlm.service.ts` exists with commission calculation logic

### **Tasks to Complete:**

#### **Task 4.1: Review and Enhance MLM Service** 🔧
**Estimated Hours:** 8  
**Assignee:** @backend-dev-1

**Subtasks:**
- [ ] Review existing `apps/mlm-service/src/mlm.service.ts`
- [ ] Verify commission calculation logic matches PRD
- [ ] Ensure `POST /mlm/distribute-fee` endpoint exists
- [ ] Implement hierarchy fetching from User Management Service
- [ ] Read `MlmFeeFormula` from database
- [ ] Create `RegistrationFeeLedger` entries
- [ ] Add transaction handling
- [ ] Add audit logging
- [ ] Write unit tests for calculations

**Acceptance Criteria:**
- [ ] Commission calculations are 100% accurate
- [ ] Ledger entries are created correctly
- [ ] All operations are atomic

---

#### **Task 4.2: Seed MLM Fee Formula** ⏳
**Estimated Hours:** 3  
**Assignee:** @backend-dev-2

**Subtasks:**
- [ ] Create database seed script
- [ ] Define default formula:
  - Company: 50%
  - Direct sponsor: 30%
  - Level 2: 15%
  - Level 3: 5%
- [ ] Run seed in development
- [ ] Document formula

---

#### **Task 4.3: Add Admin Ledger View** ⏳
**Estimated Hours:** 4  
**Assignee:** @backend-dev-1

**Subtasks:**
- [ ] Create `GET /mlm/ledger` endpoint
- [ ] Add pagination
- [ ] Add filtering
- [ ] Add authentication
- [ ] Document in Swagger

---

#### **Task 4.4: Write E2E Tests** ⏳
**Estimated Hours:** 6  
**Assignee:** @backend-dev-2

**Subtasks:**
- [ ] Test 1-level referral
- [ ] Test 2-level referral
- [ ] Test 3-level referral
- [ ] Test no referrer
- [ ] Verify ledger entries
- [ ] Achieve >80% coverage

---

## 📊 **REVISED TOTAL ESTIMATES**

### **Updated Story Estimates:**

| Story | Original Estimate | Already Done | Remaining Work | Status |
|-------|-------------------|--------------|----------------|--------|
| 101.1 | 8 hours | ~6 hours | **2-4 hours** | ✅ 75% Complete |
| 101.2 | 36 hours | ~24 hours | **8-12 hours** | ✅ 65% Complete |
| 101.3 | 58 hours | ~28 hours | **24-30 hours** | ⚠️ 50% Complete |
| 101.4 | 39 hours | ~20 hours | **16-20 hours** | ⚠️ 50% Complete |
| **Total** | **141 hours** | **~78 hours** | **50-66 hours** | **55% Complete** |

### **Revised Sprint Plan:**

#### **Sprint 1 (Current):** ✅ Complete story-101.1
- Task 1.1: Create FAQ Page (2h)
- Task 1.2: Performance Optimization (2h)
- **Total: 4 hours**

#### **Sprint 2:** Complete story-101.2
- Task 2.1: Consolidate Registration Forms (4h)
- Task 2.2: Enhance Success State (2h)
- Task 2.3: Add Payment Flow UI (6h)
- **Total: 12 hours**

#### **Sprint 3:** Complete story-101.3
- Task 3.1: Verify Registration Endpoint (6h)
- Task 3.2: reCAPTCHA Validation (4h)
- Task 3.3: User + DriverProfile Creation (6h)
- Task 3.4: Stripe Payment Integration (10h)
- Task 3.5: Trigger MLM Service (4h)
- Task 3.6: Update Frontend Integration (4h)
- **Total: 34 hours**

#### **Sprint 4:** Complete story-101.4
- Task 4.1: Review and Enhance MLM Service (8h)
- Task 4.2: Seed MLM Formula (3h)
- Task 4.3: Add Admin Ledger View (4h)
- Task 4.4: Write E2E Tests (6h)
- **Total: 21 hours**

---

## 🎯 **IMMEDIATE NEXT STEPS**

### **Priority 1: Complete Story 101.1** (This Week)
1. Create FAQ page
2. Run PageSpeed optimization
3. Mark story as DONE

### **Priority 2: Fix Story 101.2** (Next Week)
1. Consolidate registration forms (remove multi-step version)
2. Add Stripe payment UI
3. Enhance success state

### **Priority 3: Complete Backend Integration** (Weeks 3-4)
1. Verify existing backend code
2. Add missing Stripe integration
3. Connect frontend to backend
4. Test end-to-end flow

---

## ✅ **KEY TAKEAWAYS**

### **Good News:**
- 🎉 **55% of the epic is already complete!**
- ✅ Core infrastructure exists (services, forms, validation)
- ✅ reCAPTCHA integration is done
- ✅ MLM logic exists

### **Remaining Work:**
- ⚠️ Stripe payment integration (frontend + backend)
- ⚠️ Consolidate registration forms
- ⚠️ Connect frontend to backend
- ⚠️ E2E testing
- ⚠️ Performance optimization

### **Estimated Time to Complete:**
- **50-66 hours** remaining
- **3-4 weeks** with current team
- **2-3 weeks** if we add resources

---

**The team has made excellent progress! Let's finish strong! 🚀**
