# Implementation Plan: Cabi Africa UI Overhaul via Stitch Project (5681992570744779348)

## 1. Executive Summary & Design System Foundation

This plan establishes the implementation roadmap for upgrading the user interfaces across **Cabi Africa** using Google Stitch Project `5681992570744779348`. 

Following user alignment via the Socratic Gate:
- **Primary Starting Surface:** Mobile Passenger App (`mobile/passenger_app`)
- **Aesthetic Paradigm:** **Obsidian Gold Dark Mode** (Deep obsidian `#121212` canvas with brushed metallic gold `#D4AF37`, surgical electric cyan `#067FF9`, and emerald `#10B981` telemetry accents) with optional theme toggle
- **Architecture Strategy:** Incremental screen overhaul preserving existing Riverpod/Bloc state providers, WebSocket real-time dispatch streams, and REST backend API bindings.

---

## 2. Stitch Screen Mapping Matrix

| App / Platform | Component / Screen | Stitch Screen ID | Source Screen Title in Stitch | Code Target File |
| :--- | :--- | :--- | :--- | :--- |
| **Passenger App** | **Ride Tier Selection & Booking Sheet** | `efbb07f42c3449fe9b5631158cb011bf` | Cabi Africa - Ride Tier Selection | `mobile/passenger_app/lib/screens/home_screen_panels.dart` |
| **Passenger App** | **Passenger Homepage & Cartography** | `3d9d6cfe8b4b47e58e88a91e08fd6ec2` | Passenger App Home (Lustre Platinum / Obsidian) | `mobile/passenger_app/lib/screens/home_screen.dart` |
| **Passenger App** | **M-Pesa & Executive Wallet** | `63b25d0f2c424e729e7fd32a54e78922` | Passenger Wallet Top-Up - Obsidian Gold | `mobile/passenger_app/lib/screens/wallet_screen.dart` |
| **Passenger App** | **Safety Center & 24/7 Patrol** | `6bf26be267f6423989f37fc97a5c0a5b` | Passenger Safety Center - Obsidian Gold | `mobile/passenger_app/lib/screens/help_center_screen.dart` & `widgets/sos_button.dart` |
| **Passenger App** | **Trip Receipt & Rating** | `53f584b2fcaf4e61bcb729ddafa8f27e` | Passenger App - Trip Completion & Rating | `mobile/passenger_app/lib/screens/rate_driver_screen.dart` |
| **Driver App** | **Incoming Ride Offer Modal** | `285b31b494ec4981bdff1e9539d034b6` | Driver App - Incoming Ride Offer | `mobile/driver_app/lib/widgets/ride_request_modal.dart` |
| **Driver App** | **Active Navigation HUD** | `2b28faba5b4b4893bc8435905d0e9a06` | Driver Active Navigation - Obsidian Gold | `mobile/driver_app/lib/screens/home_screen.dart` |
| **Driver App** | **Daily Earnings & M-Pesa Cashout** | `0bfd1b2c7af44676a80eaf3123ecd6c5` | Driver Cashout - Obsidian Gold | `mobile/driver_app/lib/screens/earnings_screen.dart` |
| **Driver App** | **Pre-Shift Vehicle Inspection** | `fb8c4353ff2848f0bbcc46f88aa08e2d` | Driver Pre-Shift Inspection - Obsidian Gold | `mobile/driver_app/lib/screens/pre_shift_inspection_screen.dart` |
| **Marketing Web** | **Ultra-Premium Landing Page** | `33190b35739a40ceac6e9482050c0216` | Cabi Africa Landing Page - Obsidian Gold | `web/user_portal/src/pages/index.tsx` |
| **Marketing Web** | **Drive with Cabi Portal** | `c4861c2b6ad749bb8e1cdf95b2053755` | Drive with Cabi - Driver Landing Page | `web/user_portal/src/pages/for-drivers.tsx` |
| **Marketing Web** | **Rider Portal & Fare Estimator** | `7a798f84d7ef45d5b3700e3cc09b64f5` | Passenger Landing Page - Ride with Cabi | `web/user_portal/src/pages/riders.tsx` |

---

## 3. Phase 1 Detailed Execution: Passenger App Home & Ride Tiers

### 3.1 Design Token Synchronization (`mobile/passenger_app/lib/theme/app_theme.dart`)
- Elevate Dark Theme palette:
  - Background: `#121212` (Obsidian Base)
  - Surface Container: `#1A1A1A` (Frosted Cards)
  - Primary: `#D4AF37` (Burnished Metallic Gold)
  - Outline Gold: `rgba(212, 175, 55, 0.3)`
  - Secondary: `#067FF9` (Electric Cyan)
  - Success / Radar: `#10B981` (Emerald)
- Configure typography hierarchy adhering to Stitch tokens:
  - Headlines: `Montserrat` (bold / extrabold)
  - Body & Titles: `Plus Jakarta Sans`
  - Labels & Badges: `Inter` uppercase tracking

### 3.2 Ride Tier Selection Panel Overhaul (`mobile/passenger_app/lib/screens/home_screen_panels.dart`)
- **Route Header Summary**:
  - Live duration estimate, Expressway indicator, traffic speed chip ("Traffic Clear").
- **Vehicle Tier Bento Cards**:
  - **Boda**: Fast 2-wheeler, agile urban bypass, upfront KES fare, instant dispatch badge.
  - **Cabi Lite / Comfort**: Daily executive sedan, air conditioned, sanitized, USB charging badge.
  - **Cabi Exec**: Luxury black car chauffeur, bottled water, SACCO vetted executive driver.
  - **Cabi XL**: Group mobility / airport luggage transit (7 pax).
- **Payment Method & Booking Action Bar**:
  - Compact M-Pesa STK Push toggle & live wallet balance indicator.
  - High-contrast gold gradient CTA: "Confirm Cabi [Tier]".

---

## 4. Safety & Verification Guardrails
- **GitNexus Impact Analysis:** Upstream dependency check verified 0 broken execution flows for `HomeScreen`.
- **Zero Tampering Policy:** No backend socket communication or HTTP dispatch methods will be altered; UI widget trees will bind directly to existing Riverpod state.
- **Obsidian Vault Sync:** Synchronize `D:\IBN\iBN-Cabi Vault\01-System Architecture & Engineering\` upon phase completion.
