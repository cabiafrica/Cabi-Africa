# Dispatch Panel & Light Mode Harmonization Plan

## Objectives
1. **Light Mode High-Contrast Enhancement**:
   - Zero layout shifts; color and contrast only.
   - Contrast ratio $\ge$ 14:1 for primary headings (`#0F172A` on `#FFFFFF` / `#F8FAFC`).
   - Secondary body copy $\ge$ 7:1 (`#334155` on `#FFFFFF`).
   - Amber text/pills in light mode tuned to deep amber (`#B45309` / `#92400E`) for $\ge$ 5:1 legibility.
   - Form inputs, cards, borders, and focus rings calibrated for crisp definition.

2. **Launch Dispatch Panel**:
   - Start local Vite development server for `web/dispatch_panel` on `http://127.0.0.1:3002`.
   - Ensure clean proxy and API connectivity.

3. **Dispatch Panel Theme & Layout Rollout**:
   - Add unified `PageHeader` component with golden gradient separator.
   - Overhaul top navigation in `App.tsx` with dark/light mode toggle and gold brand styling.
   - Overhaul all 8 core views:
     1. `LiveMap.tsx` (Real-time fleet tracking & status overlays)
     2. `RideRequestsList.tsx` (Requests queue & Gamification Gold Pill tabs)
     3. `DriversList.tsx` (Driver cards, online badges, 3px radii)
     4. `SurgeMonitor.tsx` (Multiplier controls & zone analytics)
     5. `TripHistoryPage.tsx` (Trip ledger, search bar, date filters)
     6. `DriverHistoryPage.tsx` (Driver shift logs, stats, tabs)
     7. `PassengerManagementPage.tsx` (Passenger directory & rider actions)
     8. `TripAnalytics.tsx` / `MetricsOverview.tsx` (Charts, KPI cards, Tremor/Recharts alignment)

4. **Verification & Delivery**:
   - TypeScript build check (`npm --prefix web/dispatch_panel run build`).
   - Browser subagent visual inspection of light mode & dark mode on both portals.
   - Git commit and synchronization across `main` and `Further-developments`.
