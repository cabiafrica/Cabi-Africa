# Phase 3: Accessibility & Design Token Polish Task Plan

**Status:** Completed ✅  
**Owner:** @frontend-specialist  
**Date:** 2026-11-18  
**Scope:** `web/user_portal` WCAG 2.1 AA & Design System Cleanup  

---

## 1. Objectives

Remediate accessibility compliance gaps and clean up legacy stylesheet tokens identified in the audit:

1. **Keyboard Accessibility for Custom Interactive Elements (`A11Y-01`)**:
   - Added `onKeyDown` handlers (supporting Enter and Space keys with `e.preventDefault()` on Space) and `role="button"` / `tabIndex={0}` on interactive elements across `FAQAccordion.tsx`, `ThemeToggle.tsx`, `Accordion.tsx`, `Testimonials.tsx`, `ReferralCard.tsx`, `MapPinModal.tsx`, `ContactInfoCards.tsx`, `FloatingTripWidget.tsx`, `PwaManager.tsx`, `PassportPhotoUploader.tsx`, `Step2Documents.tsx`, `Step3Vehicle.tsx`, `FileUpload.tsx`, `AuthWidget.tsx`, `PaymentReceipt.tsx`, `Header.tsx`, `DocumentUpload.tsx`, `VerificationFlow.tsx`.
   - Ensured form inputs have associated `aria-label` or `<label>` tags across `LocationAutocomplete.tsx`, `NewsletterWidget.tsx`, `TripRequestWidget.tsx`, `SafetyTab.tsx`, `Step3Vehicle.tsx`, `FileUpload.tsx`, `AuthWidget.tsx`, `DocumentUpload.tsx`.
   - Ensured video embed with autoplay has muted parameter (`&mute=1`) for WCAG 1.4.2 audio control compliance.

2. **Landmark Navigation (`A11Y-02`)**:
   - Added accessible `<a href="#main-content">Skip to main content</a>` links in `MainLayout.tsx`, `DriverLayout.tsx`, `layout.tsx`, `index.tsx`, and public HTML templates (`offline.html`, `preview.html`, `admin_occurrences.html`, `dual_emulator.html`).
   - Added `id="main-content"` landmarks on target `<main>` wrappers.

3. **Design Token Cleanup (`CODE-01`)**:
   - Removed obsolete `--color-brand-indigo` variable from `web/user_portal/src/styles/globals.css`.
   - Verified zero non-compliant color tokens in the design system.

---

## 2. Implementation Checklist

- [x] **Task 1:** Add keyboard accessibility (`onKeyDown`, `role="button"`, `tabIndex={0}`) to interactive custom elements.
- [x] **Task 2:** Add skip-to-main-content landmark navigation in `MainLayout.tsx`, `DriverLayout.tsx`, and static HTML templates.
- [x] **Task 3:** Clean up legacy `--color-brand-indigo` in `globals.css`.
- [x] **Task 4:** Re-run `accessibility_checker.py` and verify all checks pass (50/50 files passed, 0 issues remaining).
