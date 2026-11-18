# Pre-Production Audit & Implementation Plan

## Goal
Complete all 22 pre-production feature updates, audits, and end-to-end browser verification across Cabi Africa's Web Portal (`web/user_portal`), Backend APIs, and Mobile Apps (`mobile/driver_app`, `mobile/passenger_app`).

## Workstreams & Tasks
- [x] **1. Web Marketing, Ride Request & PWA**
  - Mobile testimonials slider: 1 slide per screen, auto-sliding.
  - Live GPS pickup location detection on website booking widgets.
  - "Request for someone else" option on website ride booking + API persistence.
  - PWA enhancements: `site.webmanifest`, service worker (`sw.js`) with offline fallback, install banner/prompt.
- [x] **2. Auth, Registration, OTP, Password Reset & Passport Photo**
  - Remove video link from registration page(s).
  - Add OTP verification (Email + SMS) and primary language selection to user registration.
  - Audit & fix `/reset-password` and forgot-password flow end-to-end.
  - Client-side & server-side face/framing/aspect-ratio validation on `PassportPhotoUploader` & upload API.
- [x] **3. Vehicle Registration, PSV Cab, Taxi Tiers & Plate Transfers**
  - Audit vehicle registration flow: plate search -> if unregistered, go to registration; if registered, notify + request transfer; owner can release vehicle.
  - Identify registering as PSV Cab, include primary contact person & categories.
  - Register vehicle tiers as taxi tiers first.
- [x] **4. Appointments & Calendar Confirmation**
  - Calendar UI with 30-min slots (Mon–Fri 8am–4pm, Sat 8am–12:30pm, Sun closed) & slot availability check.
  - Send confirmation email with `.ics` calendar attachment.
- [x] **5. Payments: Airtel Money, Top-up & Instant Payouts**
  - Airtel Money collection & disbursement service adapter (`airtelMoney.ts`) with env vars + sandbox/mock fallback.
  - Seamless wallet top-up endpoint & UI (M-Pesa, Airtel Money, Card).
  - Instant B2C payout endpoint & UI for drivers/partners.
- [x] **6. App Language Translator (Client-facing & User Input)**
  - Translation service + `/api/translate` endpoint supporting word-by-word & contextual meaning + user-input translation across EN/SW/FR/AR.
  - Apply across client-facing web pages and mobile `LanguageProvider`.
- [x] **7. Mobile & App Audits (Settings, Edit Profile, Lost & Found, Driver Concierge)**
  - Audit & fix Driver & Passenger `edit_profile_screen.dart` & web `/settings/profile`.
  - Configure Lost & Found (short description, submit, office drop-off, 7-day collection window, extension/communication option).
  - Configure Driver Concierge.
  - Update app version (`1.2.0+5` Driver, `1.2.0+6` Passenger).
- [x] **8. Browser Subagent Verification**
  - Verified all web/PWA flows on `http://localhost:3000` via `browser` subagent.
