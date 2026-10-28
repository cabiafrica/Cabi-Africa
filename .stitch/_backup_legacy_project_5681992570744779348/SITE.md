# Cabi Africa UI Architecture & Stitch Screen Mapping

This document maps all design screens designed in Google Stitch (`projects/5681992570744779348`) to the active frontend codebases across the repository.

---

## 1. Project Overview & Stitch Connection

- **Stitch Project:** `projects/5681992570744779348` (Title: "Cabi Africa")
- **Design System Asset:** `assets/3d296146259f4230861733a932d7472e` (Compiled from `.stitch/DESIGN.md`)
- **Theme Foundation:** Dark Obsidian (`#121212`), Metallic Gold (`#D4AF37`), Electric Blue (`#067ff9`), Neon Yellow (`#f9f906`).

---

## 2. Screen to Codebase Mapping Matrix

### A. Mobile Passenger App (`mobile/passenger_app`)

| Screen Title | Stitch Screen ID | Platform | Target Flutter File | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Cabi Africa - Ride Tier Selection** | `efbb07f42c3449fe9b5631158cb011bf` | Mobile | `mobile/passenger_app/lib/screens/home_screen_panels.dart` | Refined ride tier cards (Boda, Comfort, Exec) with upfront KES fares, SACCO & M-Pesa badges. |
| **Passenger App Homepage v1** | `85aae5f5fcf04d64ab19c36db7bdd25b` | Mobile | `mobile/passenger_app/lib/screens/home_screen.dart` | Dark map canvas, floating location pill, bottom drawer with destination quick chips. |
| **Passenger App Homepage v2** | `137dccdb3d924673b8d0cf56967aa05f` | Mobile | `mobile/passenger_app/lib/screens/home_screen_panels.dart` | Refined ride category selection (Boda, Matatu, Cabi Comfort, Cabi Exec). |

### B. Mobile Driver App (`mobile/driver_app`)

| Screen Title | Stitch Screen ID | Platform | Target Flutter File | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Driver App - Incoming Ride Offer** | `285b31b494ec4981bdff1e9539d034b6` | Mobile | `mobile/driver_app/lib/widgets/ride_request_modal.dart` | Radial 15s countdown ring, net earnings hero, route timeline, glowing Accept/Pass buttons. |
| **Driver App Login** | `301afa881b5c41f9ba4b25669aaf3adf` | Mobile | `mobile/driver_app/lib/screens/auth/driver_login_screen.dart` | High contrast phone number auth, SMS OTP verification, SACCO selector. |
| **Driver App Login (Red Accent)** | `7c397a7fd6254d9f8ff23f3e81b5d32c` | Mobile | `mobile/driver_app/lib/screens/auth/variant_login.dart` | High-alert security variant for emergency recovery or re-authentication. |

### C. Web Portals & SACCO Management (`web/`)

| Screen Title | Stitch Screen ID | Platform | Target Code Location | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Futuristic Driver Dashboard** | `c716262e2d2b4123b97394f25222c452` | Desktop | `web/driver_portal/src/pages/Dashboard.tsx` | Daily earnings HUD, trip telemetry heatmap, fuel rebate meter, M-Pesa payouts. |
| **Ultra-Premium Driver Dashboard** | `ce3b75e1de53494797ea537897a3dab6` | Desktop | `web/driver_portal/src/pages/ExecutiveDashboard.tsx` | Telemetry analytics, driver tier progression, cooperative credit scoring. |
| **Driver Registration Portal** | `563c9145b4184630a07f7687c1cbfa82` | Desktop | `web/driver_registration/src/pages/Onboarding.tsx` | NTSA license upload, PSV badge verification, vehicle logbook inspection. |
| **Sacco Login/Sign-up Page** | `936db57f11524b0db64f768a5c362c13` | Mobile/Web | `web/sacco_portal/src/pages/Login.tsx` | SACCO admin credentials, 2FA hardware token / SMS verification. |
| **Futuristic User Portal Login** | `eda438756ef847b7b1fcc227ea722adc` | Desktop | `web/admin_panel/src/pages/auth/Login.tsx` | High-security corporate terminal login with biometric / passkey fallback. |

### D. Public Marketing & Landing Portals (`web/`)

| Screen Title | Stitch Screen ID | Platform | Target Code Location | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Cabi Africa Ultra-Premium Landing Page** | `78d227683ecb4f07a04fa88fe66e020c` | Desktop | `web/landing_page/src/pages/Index.tsx` | Hero banner with brushed gold gradient, live interactive ride demo, mobile app download CTAs. |
| **Ride with Cabi Passenger Landing** | `c39c49c257104c26a9f177f7f25153eb` | Desktop | `web/landing_page/src/pages/Riders.tsx` | Safety features, pricing transparency, fixed corporate transit plans. |
| **Drive with Cabi Driver Landing Page** | `c4861c2b6ad749bb8e1cdf95b2053755` | Desktop | `web/landing_page/src/pages/Drivers.tsx` | Low commission structure, SACCO benefits, insurance and daily fuel cash advances. |

---

## 3. Stitch Development Workflow

1. **Prompting New Screens**: Edit `.stitch/next-prompt.md` with desired screen components and features, keeping the embedded design system token block intact.
2. **Generating via StitchMCP**: Call `generate_screen_from_text` on StitchMCP with `projectId: "5681992570744779348"` and the prepared prompt.
3. **Inspecting Output**: Call `get_screen` to obtain the high-res screenshot preview URL and the rendered HTML code download link.
4. **Translating to Code**:
   - For **Flutter**: Convert the Tailwind layout tree into Flutter widgets (`Container`, `Card`, `Stack`, `BottomSheet`).
   - For **React/Next.js**: Port the Tailwind classes directly into TSX components in `web/`.
