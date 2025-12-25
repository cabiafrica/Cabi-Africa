# User Portal - Unimplemented Stories Analysis

## Overview
This document identifies all stories from the epics that concern the user-portal (marketing website) that are not yet implemented.

---

## Epic 101: Driver Acquisition & MLM Registration Funnel
**Status:** IN_PROGRESS  
**Priority:** HIGH

### ✅ **Implemented Stories:**

#### Story 101.2: Web-Based Driver Registration Form UI
**Status:** ✅ COMPLETED (Just implemented)
- Multi-step registration form with 4 steps
- Client-side validation
- Referral code support (URL parameter and manual entry)
- Individual and group registration
- Payment flow integration ready
- **Files Created:**
  - `apps/user-portal/src/pages/drivers/register.tsx`
  - `apps/user-portal/src/pages/drivers/group-register.tsx`

### ❌ **Not Yet Implemented:**

#### Story 101.1: Create Static Marketing Pages for Driver Acquisition
**Status:** IN_PROGRESS  
**Priority:** HIGH

**What's Missing:**
1. **About Us Page** (`/about`)
   - Mission statement
   - Company story
   - Core values
   - Content from `marketing-and-communications.story-130.7`
   
2. **FAQ Page** (`/faq`)
   - Comprehensive FAQ section
   - Expandable/collapsible questions
   - Categories: Driving with Cabi, Payments & Earnings, Account & App
   - Content from `marketing-and-communications.story-130.9`

3. **Enhanced "Why Drive with Us" Content**
   - Current `/drivers` page exists but needs enrichment
   - Add earnings calculator (optional)
   - More detailed benefit sections
   - Content from `marketing-and-communications.story-130.8`

4. **Performance Optimization**
   - PageSpeed score ≥85 (not yet tested)
   - Need to run performance audits

**Files to Create:**
- `apps/user-portal/src/pages/about.tsx` (exists but needs content update)
- `apps/user-portal/src/pages/faq.tsx` (needs to be created)

---

#### Story 101.3: Implement Backend for Web-Based Driver Registration
**Status:** READY (Not Started)  
**Priority:** HIGH

**What's Needed:**
1. **Driver Lead Service API**
   - `POST /api/driver-leads/register` endpoint
   - `POST /api/driver-leads/group-register` endpoint
   - reCAPTCHA validation
   - User/DriverProfile creation (PROSPECT status)
   - Email verification

2. **Database Schema**
   - User table
   - DriverProfile table with PROSPECT status
   - Vehicle information
   - Document tracking

3. **Payment Integration**
   - Stripe payment processing
   - Payment page implementation
   - Success/failure handling
   - Receipt generation

4. **Email Notifications**
   - Registration confirmation
   - Payment receipt
   - Next steps instructions

**Files to Create:**
- `apps/user-portal/src/pages/api/driver-leads/register.ts`
- `apps/user-portal/src/pages/api/driver-leads/group-register.ts`
- `apps/user-portal/src/pages/drivers/register/payment.tsx`
- Backend service integration

---

#### Story 101.4: Implement Backend for MLM Registration Fee Distribution
**Status:** READY (Not Started)  
**Priority:** HIGH

**What's Needed:**
1. **MLM Service**
   - `POST /mlm/distribute-fee` endpoint
   - Commission calculation algorithm
   - Referral hierarchy traversal
   - RegistrationFeeLedger updates

2. **Commission Distribution**
   - Calculate commissions based on referral tree
   - Record in RegistrationFeeLedger
   - Update referrer balances
   - Audit logging

3. **Admin Dashboard**
   - View commission distribution
   - Manual adjustments
   - Audit trail

**Files to Create:**
- Backend MLM service endpoints
- Commission calculation logic
- Database migrations for MLM tables

---

## Epic 130: Marketing and Communications Platform
**Status:** DRAFT  
**Priority:** MEDIUM

### ❌ **Not Yet Implemented:**

#### Story 130.1: Platform Blog
**Status:** DRAFT

**What's Needed:**
- Public-facing blog system
- Blog post listing page
- Individual blog post pages
- CMS integration for content management
- SEO optimization

**Files to Create:**
- `apps/user-portal/src/pages/blog/index.tsx`
- `apps/user-portal/src/pages/blog/[slug].tsx`
- Blog post components

---

#### Story 130.7: About Us Content
**Status:** DRAFT

**Current State:**
- `/about` page exists but has minimal content
- Needs full content implementation

**What's Needed:**
- Mission statement section
- Company story/founding narrative
- Core values showcase
- Team section (optional)
- Visual enhancements

**Content Available:**
- Full content provided in `marketing-and-communications.story-130.7`

---

#### Story 130.8: Why Drive with Us Content
**Status:** DRAFT

**Current State:**
- `/drivers` page exists with basic content
- Needs content enrichment

**What's Needed:**
- Detailed benefits breakdown
- Earnings potential section
- Competitive advantages
- Driver testimonials (already have component)
- Earnings calculator (optional)

**Content Available:**
- Full content provided in `marketing-and-communications.story-130.8`

---

#### Story 130.9: FAQ Content
**Status:** DRAFT

**What's Needed:**
- Create `/faq` page
- Implement accordion/expandable UI
- Organize into categories
- Add search functionality (optional)

**Content Available:**
- Full FAQ content provided in `marketing-and-communications.story-130.9`
- Categories: Driving with Cabi, Payments & Earnings, Account & App

**Files to Create:**
- `apps/user-portal/src/pages/faq.tsx`
- `apps/user-portal/src/components/FAQAccordion.tsx`

---

## Epic 140: User Account Management
**Status:** DRAFT  
**Priority:** LOW (for user-portal)

### ❌ **Not Yet Implemented:**

These stories are more relevant to the driver/passenger apps than the marketing website:
- Story 55.7: Delete My Account
- Story 19.3: User Delete Account
- Story 55.3: Delete Account

---

## Priority Recommendations

### **Immediate Priority (Next Sprint):**

1. **Complete Story 101.1 - Marketing Pages**
   - ✅ Homepage (exists, needs minor updates)
   - ❌ About Us page (update with full content)
   - ❌ FAQ page (create new)
   - ✅ Drivers page (exists, needs content enrichment)

2. **Implement Story 101.3 - Registration Backend**
   - Backend API endpoints
   - Payment integration
   - Email notifications

3. **Implement Story 101.4 - MLM Backend**
   - Commission calculation
   - Referral tracking
   - Ledger updates

### **Medium Priority (Future Sprints):**

4. **Story 130.7-130.9 - Content Enhancement**
   - Enrich existing pages with provided content
   - Add FAQ page
   - Improve SEO

5. **Story 130.1 - Blog Platform**
   - If content marketing is a priority
   - Can be deferred if driver acquisition is main focus

### **Low Priority:**

6. **User Account Management Stories**
   - These are more relevant to mobile apps
   - Can be implemented later

---

## Implementation Checklist

### **Phase 1: Complete Frontend (1-2 days)**
- [ ] Create FAQ page with accordion UI
- [ ] Update About Us page with full content
- [ ] Enrich Drivers page with detailed benefits
- [ ] Add earnings calculator (optional)
- [ ] Performance optimization (PageSpeed ≥85)

### **Phase 2: Backend Integration (3-5 days)**
- [ ] Set up backend services (driver-lead-service)
- [ ] Implement registration API endpoints
- [ ] Integrate Stripe payment processing
- [ ] Create payment success/failure pages
- [ ] Set up email notification system
- [ ] Implement reCAPTCHA validation

### **Phase 3: MLM System (3-5 days)**
- [ ] Implement MLM service
- [ ] Commission calculation algorithm
- [ ] Referral hierarchy tracking
- [ ] Registration fee ledger
- [ ] Admin dashboard for MLM management

### **Phase 4: Testing & Optimization (2-3 days)**
- [ ] End-to-end testing of registration flow
- [ ] Payment processing testing
- [ ] MLM commission calculation testing
- [ ] Performance testing (PageSpeed)
- [ ] Security testing (reCAPTCHA, SQL injection, etc.)
- [ ] Cross-browser testing

---

## Current Implementation Status

### ✅ **What's Working:**
- Homepage with blog posts
- Drivers page with benefits and testimonials
- Individual driver registration form (4-step)
- Group registration form (3-step)
- Referral code support (URL params)
- Bulk discount calculation (15% for 10+ drivers)
- Navigation with registration CTAs
- Responsive design
- Dark mode support
- i18next internationalization
- Tailwind CSS styling

### ❌ **What's Missing:**
- About Us page content
- FAQ page
- Backend API integration
- Payment processing
- MLM commission distribution
- Email notifications
- reCAPTCHA implementation
- Performance optimization
- Admin dashboard

---

## Next Steps

1. **Decide on Priority:**
   - Complete frontend pages first? OR
   - Start backend integration immediately?

2. **Resource Allocation:**
   - Frontend developer for pages
   - Backend developer for APIs
   - DevOps for deployment

3. **Timeline:**
   - Estimate: 2-3 weeks for full implementation
   - Can be broken into smaller releases

4. **Success Metrics:**
   - Track conversion rates
   - Monitor PageSpeed scores
   - Measure referral adoption
   - Payment success rates

---

## Files Summary

### **Existing Files:**
- ✅ `apps/user-portal/src/pages/index.tsx` - Homepage
- ✅ `apps/user-portal/src/pages/drivers.tsx` - For Drivers
- ✅ `apps/user-portal/src/pages/drivers/register.tsx` - Registration
- ✅ `apps/user-portal/src/pages/drivers/group-register.tsx` - Group Registration
- ✅ `apps/user-portal/src/components/layout/Header.tsx` - Navigation
- ✅ `apps/user-portal/src/components/layout/Footer.tsx` - Footer
- ⚠️ `apps/user-portal/src/pages/about.tsx` - Exists but needs content

### **Files to Create:**
- ❌ `apps/user-portal/src/pages/faq.tsx` - FAQ page
- ❌ `apps/user-portal/src/pages/drivers/register/payment.tsx` - Payment page
- ❌ `apps/user-portal/src/pages/api/driver-leads/register.ts` - Registration API
- ❌ `apps/user-portal/src/pages/api/driver-leads/group-register.ts` - Group API
- ❌ `apps/user-portal/src/components/FAQAccordion.tsx` - FAQ component

---

**Last Updated:** 2025-12-12  
**Status:** Ready for next phase implementation
