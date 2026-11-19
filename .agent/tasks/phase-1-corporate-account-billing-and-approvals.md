# Phase 1: Corporate Account Centralized Billing & Approval Workflow

**Status:** Completed ✅  
**Owner:** @backend-specialist & @security-auditor  
**Date:** 2026-11-19  
**Scope:** Corporate Account Registration, Department Cost-Centers, Travel Policy Evaluation Engine, Manager Pre-Trip Authorization State Machine with 15-Minute Timeout & Personal Expense Fallback, 10% Emergency Budget Overrun Buffer, Consolidated Monthly VAT Invoicing & KRA Compliance  

---

## 1. Objectives & Scope

1. **Corporate Account & Cost-Center Domain Models (`backend/dispatch-service/src/corporate/corporate.types.ts`)**:
   - Corporate organizations (CompanyName, KRA PIN, Credit Limits, Net 30/60 terms).
   - Department Cost-Centers (Code, Name, Allocated Monthly Budget, Spend Tracking, Designated Manager).
   - Employee Profiles (Employee ID, Cost-Center binding, Monthly Allowance, Single-Trip Auto-Approval Ceiling, After-Hours policy).
2. **Travel Policy & Pre-Trip Authorization Engine (`backend/dispatch-service/src/corporate/corporate.service.ts`)**:
   - Automated Policy Evaluation:
     - Check 1: Cost-center budget availability (with approved 10% emergency buffer).
     - Check 2: Employee remaining monthly allowance.
     - Check 3: Time-of-day (Working hours vs 20:00-06:00 after-hours).
     - Check 4: Single-trip cost ceiling (e.g. <= KES 1,500 auto-approved; > KES 1,500 requires manager authorization).
   - Manager Pre-Trip Sign-off:
     - Holds dispatch until manager approves via `POST /api/corporate/approvals/:id/approve`.
     - 15-Minute Timeout: If unapproved, escalates to department head and provides rider with 1-tap **"Switch to Personal M-PESA with Expense Claim"** fallback.
3. **Consolidated Monthly Invoicing & Credit Ledger**:
   - Aggregates all completed corporate trips for a billing cycle.
   - Calculates 16% KRA VAT, subtotal, and cost-center itemized breakdown.
   - Manages credit hold states and payment settlements (`NET_30`, `NET_60`).
4. **Corporate Management REST Controller (`backend/dispatch-service/src/corporate/corporate.controller.ts`)**:
   - Endpoints for managing corporate accounts, cost centers, employee allowances, approvals, and monthly invoices.
5. **Module Integration**:
   - Registered `CorporateModule` in `backend/dispatch-service/src/app.module.ts`.

---

## 2. Implementation Roadmap

- [x] **Step 1: Implement Corporate Types & Interfaces** (`backend/dispatch-service/src/corporate/corporate.types.ts`)
- [x] **Step 2: Implement Corporate Service with Policy Engine & Invoicing** (`backend/dispatch-service/src/corporate/corporate.service.ts`)
- [x] **Step 3: Implement Corporate Controller** (`backend/dispatch-service/src/corporate/corporate.controller.ts`)
- [x] **Step 4: Register CorporateModule in Dispatch Service** (`backend/dispatch-service/src/corporate/corporate.module.ts` & `app.module.ts`)
- [x] **Step 5: Automated Verification & Security Scan**
  - Bun TS Transpilation: Verified 0 errors across all corporate backend files.
  - Vulnerability Scanner: Verified 0 critical / high findings in corporate subsystem.
