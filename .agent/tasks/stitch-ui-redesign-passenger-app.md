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

### 3.1 Design Token Synchronization (`mobile/passenger_app/lib/theme/app_theme.dart`) ✅ COMPLETE
- Elevate Dark Theme palette:
  - Background: `#121212` (Obsidian Base)
  - Surface Container: `#1A1A1A` (Frosted Cards)
  - Surface Container High: `#242424`
  - Surface Container Low: `#1F1B13`
  - Surface Container Lowest: `#110E07`
  - Primary: `#D4AF37` (Burnished Metallic Gold) with onPrimary dark text (`#241A00`)
  - Outline Gold: `rgba(212, 175, 55, 0.3)`
  - Secondary: `#067FF9` (Electric Cyan)
  - Success / Radar: `#10B981` (Emerald)
- Configured typography hierarchy adhering to Stitch tokens:
  - Headlines: `Montserrat` (bold / extrabold)
  - Body & Titles: `Plus Jakarta Sans`
  - Labels & Badges: `Inter` uppercase tracking

### 3.2 Ride Tier Selection Panel Overhaul (`mobile/passenger_app/lib/screens/home_screen_panels.dart`) ✅ COMPLETE
- **Route Header Summary**:
  - Live duration estimate, Expressway indicator, traffic speed chip ("Traffic Clear" in electric cyan container).
- **Vehicle Tier Bento Cards**:
  - **Boda**: Fast 2-wheeler, agile urban bypass, upfront KES fare (`KES 180`) + strike-through regular price (`KES 220`), `Solo` chip.
  - **Cabi Lite / Comfort**: Daily executive sedan, air conditioned, sanitized, `5m away • AC & Wi-Fi` badge, floating luminous gold `BEST VALUE` pill badge on selection.
  - **Cabi Exec / XL**: Luxury chauffeur, `workspace_premium` badge, `7 Pax` luggage mobility.
- **Payment & Regulatory Verified Strip**:
  - M-Pesa Express Option with live status indicator and dropdown chevron.
  - SACCO Partner Regulatory Badge with shield icon.
  - `-KES 50` Promo Code ticket badge.
- **Booking Action Bar**:
  - High-contrast gold gradient CTA: "Confirm Cabi [Tier] • KES [Fare]" + `arrow_forward`.
  - Guaranteed upfront pricing caption.

### 3.3 Booking Sheet & Navigation Header (`home_screen_panels.dart`, `home_screen.dart`) ✅ COMPLETE
- Added Stitch `For Me` / `For Someone` passenger switcher and `Leave now` schedule selector.
- Added interactive destination shortcuts (`Home`, `Office`, `JKIA Airport`).
- Styled top menu and action utilities with Obsidian Gold adaptive token containers.

---

## 4. Phase 2: Passenger Wallet, M-Pesa Top-Up & Ride History ✅ COMPLETE
- **Target Files:**
  - `mobile/passenger_app/lib/screens/wallet_screen.dart` ✅
  - `mobile/passenger_app/lib/screens/ride_history_screen.dart` ✅
- **Stitch Reference:** Screen `63b25d0f2c424e729e7fd32a54e78922` (Passenger Wallet Top-Up - Obsidian Gold)
- **Delivered Capabilities:**
  - Executive Wallet Balance HUD with metallic gold gradient (`KES 2,450.00`), `Executive Tier` badge, connected phone chip (`+254 712 ••• 456 • M-Pesa Verified Tier 1`), and auto-reload toggle switch.
  - Stitch Bento reload grid selector (`500/-`, `1,000/- +50 bonus`, `2,500/- +125 Gold VIP`, `5,000/- +500 VIP`) and instant M-Pesa STK push trigger.
  - Payment channel selection with M-Pesa Express STK prompt and 256-bit CBK compliance security badge.
  - Complete `RideHistoryScreen` and `RideDetailsScreen` overhaul to Obsidian Gold with status badges (Completed emerald, Cancelled crimson, In-progress electric blue), expressway badges, driver breakdown, and gold re-book CTA.
  - Clean `dart analyze` check with 0 errors and 0 warnings.

---

## 5. Phase 3: Safety Center, 24/7 Patrol & SOS Shield ✅ COMPLETE
- **Target Files:**
  - `mobile/passenger_app/lib/screens/safety_center_screen.dart` ✅
  - `mobile/passenger_app/lib/widgets/sos_button.dart` ✅
  - `mobile/passenger_app/lib/screens/settings_screen.dart` ✅
- **Stitch Reference:** Screen `6bf26be267f6423989f37fc97a5c0a5b` (Passenger Safety Center - Obsidian Gold)
- **Delivered Capabilities:**
  - Real-time `Cabi Shield 24/7` status card with pulsing emerald indicator, 256-Bit AES telemetry encryption, and `#NBO-SEC-094` unit badge.
  - Tactical Emergency Centerpiece: 3-second hold circular SOS trigger with hold-to-activate progress animation and immediate dispatch sequence notification to Kenya Police & Cabi Rapid Unit.
  - False Alarm Stand-Down Token: 4-digit PIN cancellation mechanism.
  - In-Transit Guarded Protocols: Live telemetry GPS broadcast, discreet encrypted audio uplink toggle, and drop-off PIN verification.
  - Priority Escorts: Direct dial buttons for Spouse, Corporate Security Desk, and Police 999.
  - Direct integration into `SOSButton` bottom modal and `SettingsScreen` Safety section.

---

## 6. Phase 4: Trip Receipt & Rating Screen
- **Target File:** `mobile/passenger_app/lib/screens/rate_driver_screen.dart`
- **Stitch Reference:** Screen `53f584b2fcaf4e61bcb729ddafa8f27e` (Passenger App - Trip Completion & Rating)
- **Key Deliverables:** Executive trip receipt breakdown, tip chips, driver rating gold stars, SACCO compliment badges.

---

## 7. Safety & Verification Guardrails
- **GitNexus Impact Analysis:** Upstream dependency check verified 0 broken execution flows for `SOSButton` (Risk: LOW).
- **Zero Tampering Policy:** No backend socket communication or HTTP dispatch methods altered; UI widget trees bound directly to existing Riverpod state.

