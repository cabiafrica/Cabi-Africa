# Design System Specification: Cabi Africa Web Portal (`CABI.`)

> Structured for **Google Stitch** (`Settings → Design System → Import DESIGN.md`) and AI coding agents. Derived directly from `web/user_portal/tailwind.config.js`, `web/user_portal/src/styles/globals.css`, and the production Next.js UI components.

---

## 1. Visual Identity & Aesthetic Direction

- **Brand:** **CABI.** — *Sovereign African Mobility*
- **Mood:** Obsidian executive luxury meets high-telemetry urban transit. High-contrast dark-first (`#0A0A0B`) surface architecture paired with warm bullion gold (`#F59E0B` / `#D4AF37` / `#FACC15`), crisp emerald telemetry indicators (`#10B981`), and subtle cyan data highlights (`#22D3EE`). Full light-mode parity with clean slate surfaces (`#F3F4F6` / `#FFFFFF`).
- **Surface Style:** Frosted glassmorphism (`backdrop-blur-xl` / `backdrop-blur-2xl`), hairline borders (`border-white/10` in dark mode, `border-slate-200/80` in light mode), and subtle radial ambient gold/cyan glows behind hero and telemetry sections.

---

## 2. Color Palette & Semantic Tokens

### Core Brand & Accent Colors
| Role | Token / Usage | Hex Value |
| :--- | :--- | :--- |
| **Primary Gold (Brand Yellow)** | Primary CTAs, brand badge, active indicators | `#F59E0B` (`primary.DEFAULT` / `brand.yellow`) |
| **Primary Hover** | Button hover states | `#D97706` (`primary.dark` / `brand.yellowHover`) |
| **Primary Light / Highlight** | Text gradient highlights & luminous gold accents | `#FBBF24` / `#FACC15` / `#FFE088` |
| **Executive Bullion Gold** | Hero pill, badge accents, concierge borders | `#D4AF37` |
| **Telemetry Cyan Accent** | Secondary data glow & gradient accents | `#22D3EE` (`brand.accent`) |
| **Telemetry Indigo** | Links, blog category pills | `#6366F1` (`brand.indigo`) |
| **Success / Live Telemetry** | Online node indicators, M-Pesa instant settlement, fleet status | `#10B981` (`secondary.DEFAULT` / `success`) |
| **Error / Alert** | Validation & destructive states | `#EF4444` (`error`) |

### Dark & Light Surface Hierarchy
| Mode | Role | Hex Value |
| :--- | :--- | :--- |
| **Dark Mode (Default)** | Canvas Background | `#0A0A0B` (`--color-brand-black`) / `#0a0a0a` |
| **Dark Mode (Default)** | Elevated Card / Panel Surface | `#121212` / `#141416` / `#1C1C1E` / `#1E1E1E` |
| **Dark Mode (Default)** | Border / Divider | `rgba(255, 255, 255, 0.10)` (`border-white/10`) |
| **Light Mode** | Canvas Background | `#F3F4F6` (`background.light`) / `#F8FAFC` (`slate-50`) |
| **Light Mode** | Elevated Card Surface | `#FFFFFF` (`surface.light`) |
| **Light Mode** | Primary Text | `#0F172A` (`slate-900`) |
| **Light Mode** | Muted / Secondary Text | `#4B5563` / `#64748B` |

---

## 3. Typography & Hierarchy

- **Font Stack:** System geometric sans (`ui-sans-serif, system-ui, sans-serif`) with OpenType stylistic alternates `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`, antialiased rendering.
- **Monospace Telemetry:** Monospace uppercase tracking (`font-mono uppercase tracking-wider text-[10px]`) for fleet node IDs (`Fleet Node: NBO-EXC-09`), live trip timestamps, and vehicle plates.
- **Scale & Weights:**
  - **Hero H1:** `text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]`
  - **Section H2:** `text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight`
  - **Eyebrow / Pill Label:** `text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em]`
  - **Body Copy:** `text-sm sm:text-base lg:text-lg leading-relaxed`

---

## 4. Layout, Grid & Mobile-First Rules

- **Max Container Width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (12-column responsive grid on desktop, single-column stacked cards on `< 768px`). Blog/Intel uses `max-w-[1600px]` with a 3-column layout (`3 / 6 / 3` on `lg`, single-column on mobile with horizontal scrollable category pills).
- **Sticky Global Header (`Header.tsx`):**
  - Height: `h-16 md:h-20` (`64px` mobile, `80px` desktop), `fixed top-0 left-0 w-full z-[100]`, frosted glass background.
  - **Left:** `CABI.` brand mark inside `rounded-xl` gold badge (`#F59E0B`).
  - **Center (`md:flex`):** Strictly **3 main navigation items**:
    1. `Home` (`/`)
    2. `Intel` (`/blog`)
    3. `About Us` (`/about`)
  - **Right:** Theme toggle + **Avatar & Profile Menu Dropdown** (`Login`, `Sign Up`, `Driver Registration`, `Group Registration`, `Corporate Login`; or `Dashboard`, `Driver Portal`, `Profile Settings`, `Logout` when authenticated) + mobile hamburger trigger (`md:hidden`) opening a full-screen slide-down drawer.
- **Mobile-First Rules:**
  - Zero horizontal overflow (`overflow-x-hidden` on `body`).
  - Full-width primary action buttons on mobile (`w-full sm:w-auto`).
  - Horizontally scrollable tab strips (`overflow-x-auto`) for dashboard sub-views and Intel categories on mobile.
  - Floating widgets bounded cleanly (`w-[calc(100vw-2rem)] max-w-[340px]`).

---

## 5. Component Elevation, Radii & Interaction

- **Border Radius:**
  - Cards & Containers: `rounded-2xl` (`16px`) and `rounded-3xl` (`24px`) for hero mockups.
  - Buttons & Inputs: `rounded-xl` (`12px`).
  - Telemetry Pills & Status Badges: `rounded-full` (`9999px`).
- **Button Variants:**
  - **Primary:** `bg-[#D4AF37]` / `bg-[#F59E0B]` with `#000000` (`text-black`) `font-extrabold`, hover `#FFE088` / `#D97706`, `active:scale-95`.
  - **Secondary / Glass:** `bg-white dark:bg-[#1C1C1E]` with `border border-neutral-300 dark:border-white/10 hover:border-[#D4AF37]/50`.
- **Glass Card Utility (`.glass-premium`):** `bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`.

---

## 6. Key Screens & Pages to Design / Iterate in Stitch

1. **Landing / Home (`/`)** — `ExecutiveHero`, `FleetMatrix` (Economy, Executive, VIP, Safari), `BookingSection` (interactive pickup/dropoff + fare estimate), `DynamicStats`, `FeatureSplit`, `TestimonialsWidget`.
2. **Intel Hub (`/blog`) & Article Reader (`/blog/[slug]`)** — 3-column desktop editorial hub + mobile horizontal category pills and stacked app download card.
3. **About Us (`/about`) & Passengers (`/passengers`) & Drivers (`/drivers`)** — Brand narrative, trust pillars, Business Builder referral showcase.
4. **Unified Portals (`/dashboard`, `/drivers/dashboard`, `/fleet/dashboard`, `/corporate/dashboard`)** — Mobile-friendly tab switching, KPI telemetry cards, live trip tracking (`/tracking/[tripId]`).
5. **Auth & Onboarding (`/login`, `/register`, `/drivers/register`, `/drivers/group-register`, `/corporate/login`)** — Clean focused forms under the persistent global header.

