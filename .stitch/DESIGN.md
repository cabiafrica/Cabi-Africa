---
name: Cabi Africa Dual-Theme Mobility Design System
colors:
  dark:
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
  light:
    surface: '#ffffff'
    surface-dim: '#f1f5f9'
    surface-bright: '#ffffff'
    surface-container: '#f8fafc'
    surface-container-high: '#edeef2'
    surface-container-highest: '#e2e8f0'
    on-surface: '#0f172a'
    on-surface-variant: '#475569'
    outline: '#cbd5e1'
    outline-gold: 'rgba(140, 109, 31, 0.35)'
    primary: '#8C6D1F'
    primary-gradient-end: '#D4AF37'
    on-primary: '#ffffff'
    primary-container: 'rgba(212, 175, 55, 0.18)'
    secondary: '#0260c4'
    on-secondary: '#ffffff'
    secondary-container: 'rgba(2, 96, 196, 0.12)'
    accent-yellow: '#d97706'
    on-accent-yellow: '#ffffff'
    success: '#059669'
    warning: '#d97706'
    error: '#dc2626'
    background: '#f8fafc'
    on-background: '#0f172a'
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
  sm: 6px
  DEFAULT: 10px
  md: 14px
  lg: 18px
  xl: 28px
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

# Cabi Africa Dual-Theme Mobility Design System

## 1. Brand & Aesthetic Vision
Cabi Africa fuses the high velocity of East African urban mobility (Nairobi, Mombasa, Kigali) with ultra-premium executive transit standards. The visual architecture supports seamless toggling between **Obsidian Dark Mode** (night driving, high-contrast HUD) and **Porcelain Light Mode** (daytime passenger clarity, high-sun ambient visibility).

### Core Pillars:
- **Obsidian Dark Mode:** Deep `#121212` canvas with luminous metallic gold (`#D4AF37`) and electric blue (`#067ff9`) glowing highlights.
- **Porcelain Light Mode:** Crisp `#F8FAFC` porcelain background with `#FFFFFF` cards, high-contrast rich aurum bronze (`#8C6D1F`) for readable typography, and surgical blue (`#0260C4`) for clear interactive states.
- **Theme Switcher Pill:** Every top navbar or mobile header provides a tactile Day/Night toggle pill icon (`Sun / Moon`) with smooth 200ms spring transition.
- **Micro-elevation & Precision Borders:** Hairline borders (1px) with subtle radial gradients instead of muddy blurred shadows.

## 2. Dual-Theme Color Semantics

| Token | Dark Mode Value | Light Mode Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#121212` (Obsidian) | `#F8FAFC` (Porcelain Slate) | Root app & web backdrop |
| **Card / Drawer** | `#1A1A1A` (Frosted) | `#FFFFFF` (Clean Surface) | Content cards, bottom sheets |
| **Primary Accent** | `#D4AF37` (Metallic Gold) | `#8C6D1F` (Rich Aurum Bronze) | Primary actions, branding, tier rank |
| **Secondary Accent**| `#067FF9` (Electric Blue) | `#0260C4` (Deep Blue) | GPS routes, M-Pesa badges, live drivers |
| **Interactive Text**| `#FFFFFF` (Pure White) | `#0F172A` (Deep Slate) | Primary headlines, readability |
| **Muted Text** | `#A1A1AA` (Zinc 400) | `#475569` (Slate 600) | Subtitles, timestamps, vehicle plates |
| **Success / Verified**| `#10B981` (Emerald) | `#059669` (Forest Emerald) | SACCO verified badge, trip active |
| **Alert / SOS** | `#EF4444` (Vivid Crimson) | `#DC2626` (Bright Crimson) | Emergency SOS, safety alert |

## 3. Typography & Hierarchy
- **Montserrat**: Brand headers, screen titles, hero metrics (`tracking-tight font-bold`).
- **Plus Jakarta Sans**: Body copy, ride tier descriptions, chat bubbles, driver profiles.
- **Inter**: Fares (`KES 450`), ETA countdowns (`4 min`), vehicle license plates (`KDF 123X`), speed telemetry.

## 4. Component Standards

### Theme Toggle Component
- Rounded pill (`rounded-full px-3 py-1.5`) featuring an integrated dual sun/moon icon.
- Hover: subtle glow border with `transition-all duration-300`.

### Ride Tier Selection Cards
- **Cabi Boda**: Fast 2-wheeler urban zip, yellow badge, budget KES fare.
- **Cabi Comfort**: Air-conditioned 4-seater sedan, blue badge, standard executive comfort.
- **Cabi Executive**: Mercedes/BMW premium chauffeured fleet, gold foil badge, dedicated VIP amenities.
- **Cabi XL / Matatu**: Group transit & airport shuttle, green badge, high-capacity luggage.

### Payment & Verification Badges
- **M-Pesa Verified**: Green chip with lock icon and upfront fare lock guarantee.
- **SACCO Compliance**: Official regulatory badge guaranteeing certified driver vetting.

## 5. Design System Context for Stitch Prompting

```markdown
Target Project: Cabi Africa Ecosystem (projects/11467400866482705558)
Design Archetype: Ultra-Premium Mobility Dual-Theme (Obsidian Dark / Porcelain Light with instant Theme Toggle)
Colors Dark: Canvas #121212, Primary Metallic Gold #D4AF37 to #FFDF00, Secondary Electric Blue #067ff9, White text
Colors Light: Canvas #f8fafc, Surface #ffffff, Primary Rich Bronze #8C6D1F, Deep Blue #0260c4, Slate-900 text #0f172a
Typography: Montserrat (Headings), Plus Jakarta Sans (UI & Body), Inter (KES fares & ETA metrics)
Style: Frosted glassmorphism, 1px gold/cyan hairline borders, pill badges, tactile Day/Night theme toggle pill
```
