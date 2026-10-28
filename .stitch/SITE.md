# Cabi Africa Ecosystem — UI Architecture & Stitch Screen Mapping

This document maps all design screens designed in Google Stitch (`projects/11467400866482705558`) to the active frontend codebases across the repository.

---

## 1. Project Overview & Stitch Connection

- **Stitch Project:** `projects/11467400866482705558` (Title: "Cabi Africa Ecosystem")
- **Design System Asset:** `assets/3b628ef1a02a46759c0a689ae79c2951` (Dual-Theme: Obsidian Gold Dark & Porcelain Bronze Light)
- **Design System Spec:** `.stitch/DESIGN.md`
- **Legacy Backup:** `.stitch/_backup_legacy_project_5681992570744779348/`

---

## 2. Screen to Codebase Mapping Matrix

### A. Mobile Passenger App (`mobile/passenger_app`)

| Screen Title | Stitch Screen ID | Mode | Target Flutter File | Status | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cabi Africa - Ride Tier HUD** | `c63e91ea417245ba9eacff30578f6240` | Dual-Theme (Dark default) | `mobile/passenger_app/lib/screens/home_screen_panels.dart` | `[x] Generated` | Top Day/Night toggle pill, vector transit HUD, 4 tier cards (Boda, Comfort, Exec, XL) with KES pricing & M-Pesa 1-tap lock. |

### B. Mobile Driver App (`mobile/driver_app`)

| Screen Title | Stitch Screen ID | Mode | Target Flutter File | Status | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Driver App - Incoming Ride HUD & Earnings** | *Pending* | Dual-Theme | `mobile/driver_app/lib/widgets/ride_request_modal.dart` | `[ ] Planned` | 15s radial countdown ring, guaranteed net payout, route telemetry, glowing Accept/Pass controls. |
| **Driver App - Wealth Creation & Benefits** | `wealth-creation-v1` | Dual-Theme (Obsidian/Porcelain) | `mobile/driver_app/lib/screens/wealth_creation_screen.dart` & `web/dual_emulator.html` | `[x] Implemented` | Capacity gauge (30% max cap), Admin partner programs (SACCO, Health, MMF, Pension), live per-trip deduction simulator. |

### C. Web Operational Portals (`web/`)

| Portal Title | Target Code Location | Mode | Status | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin Command Center** | `web/admin_panel` | Dual-Theme | `[ ] Planned` | Live fleet telemetry, revenue KPI ribbons, driver KYC approval pipeline. |
| **Dispatch Operations Console** | `web/dispatch_panel` | Dual-Theme | `[ ] Planned` | Real-time map dispatch, manual booking allocation, emergency SOS alert board. |
| **User & Corporate Portal** | `web/user_portal` | Dual-Theme | `[ ] Planned` | Corporate ride allowances, monthly expense invoices, team travel passes. |

---

## 3. Stitch Development Workflow

1. **Prompting New Screens**: Edit `.stitch/next-prompt.md` with desired screen components and features, keeping the embedded dual-theme design system token block intact.
2. **Generating via StitchMCP**: Call `generate_screen_from_text` on StitchMCP with `projectId: "11467400866482705558"`, `designSystem: "assets/3b628ef1a02a46759c0a689ae79c2951"`, and the prepared prompt.
3. **Inspecting Output**: Obtain high-res screenshot URL and rendered HTML code download link.
4. **Translating to Code**:
   - For **Flutter** (`mobile/`): Implement stateful theme toggle provider (`ThemeMode.dark` / `ThemeMode.light`), convert cards into reusable widgets.
   - For **React/Next.js** (`web/`): Port Tailwind layout directly into responsive TSX components.
