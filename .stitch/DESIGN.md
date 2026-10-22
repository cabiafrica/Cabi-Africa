---
name: Cabi Africa Ultra-Premium Mobility Design System
colors:
  surface: '#121212'
  surface-dim: '#0a0a0a'
  surface-bright: '#1e1e1e'
  surface-container: '#1a1a1a'
  surface-container-high: '#242424'
  surface-container-highest: '#2e2e2e'
  on-surface: '#ffffff'
  on-surface-variant: '#a1a1aa'
  outline: '#27272a'
  outline-gold: 'rgba(212, 175, 55, 0.3)'
  primary: '#D4AF37'
  primary-gradient-end: '#FFDF00'
  on-primary: '#000000'
  primary-container: 'rgba(212, 175, 55, 0.15)'
  secondary: '#067ff9'
  on-secondary: '#ffffff'
  secondary-container: 'rgba(6, 127, 249, 0.15)'
  accent-yellow: '#f9f906'
  on-accent-yellow: '#000000'
  success: '#10b981'
  warning: '#f59e0b'
  error: '#ef4444'
  background: '#121212'
  on-background: '#ffffff'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: '-0.02em'
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.01em'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: '0.05em'
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

# Cabi Africa Ultra-Premium Mobility Design System

## 1. Brand & Style

Cabi Africa fuses the electric speed and community pulse of urban African transit (Kenyan matatus, boda bodas, ride-hailing) with **ultra-premium, Swiss-precision executive mobility**. The brand personality is authoritative, reliable, tech-forward, and unmistakably African.

The visual style is **High-Contrast Dark Elegance with Metallic Gold and Electric Cyan Accents**.
- **No generic flat white backgrounds.** The default canvas is a deep, brushed obsidian `#121212`.
- **Luminous Layering over heavy drop shadows.** Interfaces leverage frosted glassmorphism (`backdrop-filter: blur(12px)`), 1px gold/cyan hairline borders, and subtle radial backlights.
- **Strict Anti-Cliché Rule:** Pure purple/violet gradient soup is forbidden. Instead, contrast is achieved with deep obsidian, brushed gold (`#D4AF37` → `#FFDF00`), and surgical electric blue (`#067ff9`).

## 2. Color Palette & Semantics

- **Obsidian Dark Base (`#121212`):** Primary canvas for both mobile apps and web admin suites. Minimizes driver eye fatigue at night and makes telemetry pop.
- **Surface Elevation (`#1a1a1a` to `#242424`):** Cards, bottom sheets, navigation bars, and modals.
- **Metallic Gold Gradient (`#D4AF37` to `#FFDF00`):** Reserved for primary brand marks, high-tier status, "Ride Now" CTAs, and earnings highlights.
- **Electric Blue (`#067ff9`):** Represents navigation routes, live driver telemetry, GPS markers, and active network connections.
- **High-Visibility Yellow (`#f9f906`):** Quick-destinations, vehicle icons, and search bar focus outlines.
- **Emerald Green (`#10b981`):** Active trip state, SACCO verified badges, completed payments, and driver online toggles.
- **Crimson Alert (`#ef4444`):** SOS button, emergency alerts, declined payments, and critical driver telemetry warnings.

## 3. Typography & Hierarchy

- **Montserrat (Display & Brand Authority):** Used for big headlines, hero value propositions, and screen headers (`tracking-wider`, uppercase or tight tracking).
- **Plus Jakarta Sans (Interactive UI & Body):** Used for user cards, trip receipts, address search inputs, and conversational prompts. Crisp and friendly.
- **Inter (Telemetry & Metrics):** Numbers, fare amounts (`KES 450`), speedometer readouts, ratings, and time stamps. Clean numerical figures.

## 4. Elevation, Depth & Glassmorphism

1. **Layer 0 (Canvas):** Deep dark radial background `#121212`.
2. **Layer 1 (Cards):** `background: rgba(255, 255, 255, 0.03)` with `backdrop-filter: blur(12px)` and `border: 1px solid rgba(255, 255, 255, 0.08)`.
3. **Layer 2 (Gold Highlights):** `border: 1px solid rgba(212, 175, 55, 0.3)`.
4. **Layer 3 (Modals & Bottom Sheets):** `#1a1a1a` with top border radius `24px` and shadow `0 -10px 40px rgba(0, 0, 0, 0.5)`.

## 5. Core Components

### Buttons
- **Primary CTA:** Pill-shaped (`rounded-full`), background metallic gold gradient (`#D4AF37` to `#FFDF00`), bold black text, embossed subtle top highlight.
- **Secondary Action:** Frosted glassmorphism, 1px white or gold border, white text, hover lift.
- **Destructive/SOS:** Vivid red `#ef4444`, high-contrast white text, pulsing indicator for emergency situations.

### Mobile Bottom Sheet (Passenger & Driver)
- Rounded top corners (`rounded-t-3xl`), drag handle bar (`h-1.5 w-12 bg-zinc-700 rounded-full mb-6`).
- Integrated quick search bar with icon prefix, pill destination chips, and vehicle selection carousel.

### Status Pills & Telemetry Chips
- Pill geometry (`rounded-full px-3 py-1 text-xs font-semibold`).
- M-Pesa verified green pill, SACCO regulatory badge, Trip status ("En Route", "Arrived").

## 6. How to Prompt Google Stitch with this System

When requesting new screens in Google Stitch (via StitchMCP or Stitch Web), paste the following context into your prompt:

```markdown
Target Project: Cabi Africa (projects/5681992570744779348)
Theme: Dark Mode Luxury Mobility (#121212 obsidian background)
Colors: Primary Metallic Gold (#D4AF37 to #FFDF00), Electric Blue (#067ff9), Neon Yellow (#f9f906)
Typography: Montserrat for headings, Plus Jakarta Sans for UI body, Inter for telemetry numbers
Style: Glassmorphic cards (blur-md, 1px subtle gold or zinc border), pill-shaped action buttons, floating HUD elements
```
