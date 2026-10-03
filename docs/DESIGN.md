# DESIGN.md — Single Source of Truth for Visual Design System & UI/UX Behavior

**Project:** Champions Club — Sports Club Management System  
**Document Version:** 1.0.0  
**Stack:** React + TypeScript + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, TanStack Query, React Hook Form, Zod, Recharts  
**Primary UX Reference:** CourtReserve (https://courtreserve.com/) — Inspired by its sports club management workflows, executed with an original Champions Club visual identity.

---

## 1. DESIGN PHILOSOPHY

### Product Personality
*   **Professional:** Crisp typography, meticulous alignment, structured data density.
*   **Premium:** Refined neutral surfaces, elegant micro-shadows, subtle border definitions.
*   **Energetic:** Bold accents, vibrant green touchpoints, dynamic motion feedback.
*   **Modern:** Minimalist controls, glassmorphic overlays, clean card layouts.
*   **Trustworthy:** Clear financial rollups, explicit error resolution, transparent pricing.
*   **Sports-Focused:** High-impact lifestyle imagery, fast slot grids, tactile POS targets.
*   **Operationally Efficient:** Keyboard shortcuts, instant search, zero unnecessary clicks.

### Core Experience Principles by User Persona
```
┌──────────────────────────────────────────────────────────────────────────┐
│  PUBLIC EXPERIENCE    │ Beautiful, aspirational, spacious, energetic     │
├───────────────────────┼──────────────────────────────────────────────────┤
│  STAFF EXPERIENCE     │ High-speed, touch/keyboard optimized, operational│
├───────────────────────┼──────────────────────────────────────────────────┤
│  OWNER EXPERIENCE     │ Data-rich, calm, analytical, action-oriented     │
├───────────────────────┼──────────────────────────────────────────────────┤
│  MEMBER EXPERIENCE    │ Mobile-first, friendly, booking-centric          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BRAND IDENTITY & TAGLINE

*   **Brand Name:** CHAMPIONS CLUB
*   **Product Descriptor:** Digital Club OS
*   **Selected Primary Tagline:** `"One club. One connected experience."`
*   **Short Tagline (Marketing):** `"Play. Shop. Dine. Belong."`

---

## 3. COLOR SYSTEM & DISTRIBUTION

The visual palette relies heavily on rich neutral backgrounds, using brand green strategically for primary actions and active states.

### Core Palette
*   **Primary Brand Green:** `#4A812F`
*   **Secondary Deep Green:** `#4A812E`
*   **Accent Vibrant Green:** `#94DE64`
*   **Background White:** `#FFFFFF`
*   **Primary Text Neutral:** `#212424`

### Semantic Color Scale
*   **Success:** `#4A812F` (Primary Green)
*   **Warning:** `#D99A24` (Amber Gold)
*   **Danger / Critical:** `#D9534F` (Crimson Red)
*   **Info / Neutral:** `#4B5563` (Cool Slate)

### Visual Ratio Rule (70 / 20 / 10 Target)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ 70% NEUTRALS           │ Clean whites (#FFF), soft slates (#F7F8F5, #E3E7E1) │
├────────────────────────┼─────────────────────────────────────────────────┤
│ 20% DARK / TEXT        │ Deep charcoal (#212424), muted text (#6B716D)    │
├────────────────────────┼─────────────────────────────────────────────────┤
│ 10% BRAND GREEN        │ Primary CTAs (#4A812F), Active selection (#94DE64)│
└──────────────────────────────────────────────────────────────────────────┘
```
> **Rule:** Never flood entire screens with solid green backgrounds. Reserve green for high-priority interactive touchpoints, selected states, badges, and primary buttons.

---

## 4. CSS COLOR TOKENS & TAILWIND INTEGRATION

```css
:root {
  /* Surface Tokens */
  --background: #FFFFFF;
  --foreground: #212424;
  --surface: #F7F8F5;
  --surface-muted: #EFF1EC;
  --surface-elevated: #FFFFFF;

  /* Brand Tokens */
  --primary: #4A812F;
  --primary-hover: #3D6B26;
  --primary-active: #32581F;
  --accent: #94DE64;
  --accent-muted: #E6F7DB;

  /* Text Tokens */
  --text-primary: #212424;
  --text-secondary: #4A4E4B;
  --text-muted: #6B716D;

  /* Border Tokens */
  --border: #E3E7E1;
  --border-strong: #C8D0C4;

  /* Functional / Status Tokens */
  --success: #4A812F;
  --warning: #D99A24;
  --danger: #D9534F;
  --overlay: rgba(33, 36, 36, 0.5);
}

.dark {
  --background: #141615;
  --foreground: #F7F8F5;
  --surface: #1C1F1D;
  --surface-muted: #252927;
  --surface-elevated: #212424;

  --primary: #94DE64;
  --primary-hover: #7ECB4F;
  --primary-active: #69B53C;
  --accent: #4A812F;
  --accent-muted: #233B17;

  --text-primary: #F7F8F5;
  --text-secondary: #C8D0C4;
  --text-muted: #8E9590;

  --border: #2E3330;
  --border-strong: #404743;
}
```

---

## 5. TYPOGRAPHY SYSTEM

*   **Primary Font Family:** `Axiforma`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
*   **Fallback Font Stack:** `Arial`, `Helvetica`, `sans-serif`

### Type Scale & Hierarchy

| Token Role | Desktop Size / Line-Height | Mobile Size / Line-Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | `64px` / `72px` | `40px` / `48px` | Bold (`700`) | `-0.02em` | Public Website Hero |
| **Page H1** | `36px` / `44px` | `28px` / `34px` | Bold (`700`) | `-0.01em` | Main Screen Titles |
| **H2 Section** | `28px` / `34px` | `22px` / `28px` | SemiBold (`600`) | `-0.01em` | Card Headers, Sub-sections |
| **H3 Subheader**| `20px` / `28px` | `18px` / `24px` | SemiBold (`600`) | `normal` | Modal titles, Grid headers |
| **Body Large** | `17px` / `26px` | `16px` / `24px` | Regular (`400`) | `normal` | Hero subtext, Lead copy |
| **Body Default**| `15px` / `24px` | `15px` / `22px` | Regular (`400`) | `normal` | Primary content, Inputs |
| **Caption / Small**| `13px` / `20px` | `13px` / `18px` | Medium (`500`) | `normal` | Badges, Table subtext, Help |
| **Button Text** | `14px` / `20px` | `14px` / `20px` | SemiBold (`600`) | `0.01em` | Controls, Nav links |

---

## 6. SPACING & LAYOUT SYSTEM

Base Spacing Unit: **4px**

### Standard Spacing Scale
`4px` | `8px` | `12px` | `16px` | `20px` | `24px` | `32px` | `40px` | `48px` | `64px` | `80px` | `96px`

### Layout Padding Standards
*   **Card Internal Padding:** `20px` (Dense/Mobile) – `24px` (Desktop Standard)
*   **Page Container Padding:** `24px` – `32px` (Desktop), `16px` (Mobile)
*   **Dashboard Grid Gap:** `20px` – `24px`
*   **Public Website Section Gap:** `64px` – `96px`

---

## 7. BORDER RADIUS SYSTEM

*   **Base Control Radius:** `10px` (`rounded-md` equivalent token)
*   **Small Controls (Inputs, Small Buttons, Badges):** `8px`
*   **Standard Cards & Modals:** `12px`
*   **Large Feature Containers & Hero Cards:** `16px`
*   **Pills & Status Badges:** `999px` (`rounded-full`)

---

## 8. SHADOW & ELEVATION SYSTEM

Shadows are restrained; structural definition relies on `1px solid var(--border)` borders.

*   **Default Card Shadow:** `0 1px 2px rgba(33, 36, 36, 0.04)`
*   **Elevated / Hover Shadow:** `0 8px 24px rgba(33, 36, 36, 0.08)`
*   **Modal / Popover / Drawer Shadow:** `0 20px 50px rgba(33, 36, 36, 0.15)`

---

## 9. ICONOGRAPHY SYSTEM

*   **Icon Library:** `Lucide React`
*   **Stroke Width Standard:** `1.75px` (Clean, balanced line weight)
*   **Rule:** Never use raw emojis for functional status or navigational elements.

### Core Icon Set
*   Navigation: `Calendar`, `Users`, `ShoppingBag`, `Utensils`, `CreditCard`, `QrCode`, `Search`, `Bell`, `Settings`, `LayoutDashboard`
*   Actions: `Plus`, `X`, `Check`, `ChevronRight`, `ChevronDown`, `Filter`, `ArrowUpRight`, `LogOut`, `RefreshCw`
*   Status: `AlertTriangle`, `Package`, `BarChart3`, `Clock`, `CheckCircle2`, `XCircle`, `ShieldCheck`

---

## 10. BUTTON COMPONENT SYSTEM

### Variants Matrix

| Variant | Background | Text | Border | Hover State | Active State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#4A812F` | `#FFFFFF` | None | `#3D6B26` | `#32581F` |
| **Secondary** | `#FFFFFF` | `#212424` | `1px solid #E3E7E1` | `#F7F8F5` | `#EFF1EC` |
| **Tertiary / Ghost**| Transparent | `#4A812F` | None | `rgba(74, 129, 47, 0.08)` | `rgba(74, 129, 47, 0.15)` |
| **Danger** | `#D9534F` | `#FFFFFF` | None | `#C4413D` | `#AD3531` |

### Sizing Specifications
*   **Small:** Height `36px`, Padding `0 12px`, Font `13px`
*   **Medium (Default):** Height `40px`, Padding `0 16px`, Font `14px`
*   **Large:** Height `48px`, Padding `0 24px`, Font `15px`
*   **Hero CTA:** Height `52px` – `56px`, Padding `0 32px`, Font `16px`
*   **Minimum Touch Target (Mobile/Tablet POS):** `44px` height $\times$ `44px` width.

---

## 11. FORM & INPUT SPECIFICATIONS

*   **Field Height:** `44px` minimum.
*   **Border Radius:** `10px`.
*   **Border Styling:** `1px solid var(--border)`.
*   **Focus Ring:** `2px solid #4A812F` with `2px` offset (`ring-2 ring-[#4A812F]`).
*   **Label Policy:** Labels are mandatory and placed above fields (`font-medium text-14px`).
*   **Placeholders:** Used solely for format hints (e.g., `"e.g. +91 98765 43210"`), never as field labels.
*   **Inline Errors:** Displayed directly below field in crimson red (`#D9534F`, `text-13px`).

---

## 12. CARD DESIGN RULES

*   **Surface:** Solid `#FFFFFF` background.
*   **Border:** `1px solid #E3E7E1`.
*   **Radius:** `12px`.
*   **Internal Padding:** `20px` – `24px`.
*   **Anti-Pattern Warning:** Do not nest cards inside cards. Use subtle grey background panels (`#F7F8F5`) for inner structural grouping.

---

## 13. PUBLIC WEBSITE DESIGN SYSTEM

*   **Header Height:** `72px` (Fixed / Sticky with subtle backdrop blur `backdrop-blur-md bg-white/90`).
*   **Navigation Links:** `Courts`, `Membership`, `Shop`, `Club Experience`.
*   **Header CTAs:** `Sign In` (Secondary) & `Book a Court` (Primary).

### Hero Component Structure
```
┌─────────────────────────────────────────┬─────────────────────────────────────────┐
│ YOUR GAME. YOUR CLUB. YOUR SPACE.       │                                         │
│                                         │   [ HIGH-IMPACT LIFESTYLE PHOTOGRAPHY   │
│ Book courts, explore memberships,      │     SHOWCASING TENNIS & PADEL PLAYERS  │
│ and experience everything Champions     │     IN A MODERN LIGHT-FILLED CLUB ]     │
│ Club has to offer.                      │                                         │
│                                         │                                         │
│ [ BOOK A COURT ]  [ EXPLORE PLANS ]     │                                         │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 14. MEMBERSHIP PLAN COMPARISON CARDS

Three cards presented in a grid (`Gold` tier visually elevated with subtle primary border and "MOST POPULAR" accent badge).

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ SILVER                  │  │ GOLD (RECOMMENDED)      │  │ JUNIOR (UNDER 18)       │
│ ₹2,999 / mo             │  │ ₹4,999 / mo             │  │ ₹1,499 / mo             │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ • 50% Off Court Rates   │  │ • 100% Free Court Slots │  │ • Discounted Coaching   │
│ • 5% Shop Discount      │  │ • 15% Shop Discount     │  │ • 5% Shop Discount      │
│ • 5% Bar Discount       │  │ • 10% Bar Discount      │  │ • 5% Bar Discount       │
│ • Max 2 Bookings / Day  │  │ • Max 2 Bookings / Day  │  │ • Max 1 Booking / Day   │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [ SELECT PLAN ]         │  │ [ SELECT GOLD PLAN ]    │  │ [ SELECT JUNIOR ]       │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 15. COURT BOOKING MATRIX UX (PRIMARY PRODUCT FEATURE)

### Grid Structure & Color Mapping
```
┌──────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Court / Time │   06:00 - 06:30  │   06:30 - 07:00  │   07:00 - 07:30  │   07:30 - 08:00  │
├──────────────┼──────────────────┴──────────────────┼──────────────────┼──────────────────┤
│ Court 1      │ [🔴 BOOKED: Rajesh (Gold)]          │ [🟢 FREE: ₹400]  │ [⚪ MAINTENANCE] │
├──────────────┼─────────────────────────────────────┼──────────────────┴──────────────────┤
│ Court 2      │ [🟢 FREE: ₹400]                     │ [🔵 SOCIAL PLAY: 4/8 Joined]       │
└──────────────┴─────────────────────────────────────┴─────────────────────────────────────┘
```

| Slot State | Background Color | Text Color | Visual Indicator | Interactivity |
| :--- | :--- | :--- | :--- | :--- |
| **Available (Free)** | `#F7F8F5` | `#4A812F` | Green price badge | Clickable (Opens Drawer) |
| **Booked** | `#EFF1EC` | `#6B716D` | Muted member name | Non-clickable |
| **Social Play** | `#E6F7DB` | `#212424` | Blue/Accent player badge | Clickable ("Join") |
| **Maintenance** | `#E3E7E1` | `#8E9590` | Diagonal grey stripes | Disabled |
| **Selected** | `#4A812F` | `#FFFFFF` | Vibrant green solid fill | Active target |

---

## 16. BOOKING DRAWER SPECIFICATION

*   **Desktop:** Sliding right drawer (`w-420px`).
*   **Mobile:** Bottom sheet container (`max-h-[85vh]`).
*   **Contents:**
    1.  Selected Court & Sport Header
    2.  Date & Time Block (`06:00 AM - 07:00 AM (60 mins)`)
    3.  Member Search Input / Walk-In Selector
    4.  Financial Summary Box:
        *   Base Court Fee: ₹800
        *   Plan Discount (Gold 100%): -₹800
        *   **Total Amount Payable:** **₹0**
    5.  Payment Mode Selector Buttons: `Cash` | `Card` | `UPI` | `Charge to Tab`
    6.  CTA: `Confirm Booking` (Full width green button).

---

## 17. MEMBER DIGITAL CARD COMPONENT

Designed to feel like a premium physical membership card formatted for smartphone screens.

```
┌────────────────────────────────────────────────────────┐
│  CHAMPIONS CLUB                      [ DIGITAL MEMBER ]│
│                                                        │
│  RAJESH SHARMA                                         │
│  ID: CC-2026-8842                     [ GOLD PLAN ]    │
│  VALID THRU: 12/2026                                   │
│                                                        │
│  ┌───────────┐                                         │
│  │  [ QR ]   │   SCAN AT FRONT DESK OR BAR POS         │
│  └───────────┘                                         │
└────────────────────────────────────────────────────────┘
```
*   **Background:** Deep Charcoal Metallic (`#1C1F1D`) with subtle gold/green accent foil border.

---

## 18. ADMIN APP SHELL LAYOUT

*   **Sidebar Width:** `250px` (Collapsible to `64px` icon mode).
*   **Sidebar Styling:** Light grey surface (`#F7F8F5`), subtle border (`1px solid #E3E7E1`), active link highlighted with green accent pill.
*   **Topbar Height:** `64px` (Houses global search input, quick action `+ Book Court`, notification bell, and role badge).

---

## 19. OWNER DASHBOARD LAYOUT & CHARTS

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Row 1: [ REVENUE TODAY ]  [ REVENUE THIS WEEK ]  [ COURT OCCUPANCY ]  [ ACTIVE MEMBERS ]│
├─────────────────────────────────────────────────┬───────────────────────────────────────┤
│ Row 2: REVENUE TREND CHART (Recharts Area)      │ REVENUE BY SOURCE (Donut Chart)       │
├─────────────────────────────────────────────────┼───────────────────────────────────────┤
│ Row 3: COURT UTILIZATION HEATMAP                │ MEMBERSHIP TIER BREAKDOWN             │
├─────────────────────────────────────────────────┴───────────────────────────────────────┤
│ Row 4: ⚠️ ACTION REQUIRED PANEL (Expiring memberships, Low stock, Unpaid tabs)         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Chart Styling Guidelines (Recharts)
*   **Area Chart (Revenue Trend):** Gradient fill from `#4A812F` (0.4 opacity) to `#4A812F` (0.0 opacity). Stroke `#4A812F` (`2px`).
*   **Donut Chart (Revenue Source):** Segment colors: Courts (`#4A812F`), Shop (`#94DE64`), Bar (`#D99A24`), Membership (`#212424`).
*   **Tooltips:** Custom HTML card with `#212424` background and white text.

---

## 20. BAR POS & KITCHEN DISPLAY SYSTEM (KDS)

### Bar POS Touch Interface
*   **Left Pane (60%):** Interactive Table Map displaying Table Cards (Green = Free, Amber = Occupied with running tab).
*   **Right Pane (40%):** Active Order Drawer displaying category grid buttons (`Drinks`, `Snacks`, `Shakes`) with giant `+` / `-` touch steppers.

### Kitchen Display System (KDS)
*   **3 Kanban Columns:** `NEW ORDERS` ➔ `PREPARING` ➔ `SERVED`.
*   **Card Design:** High-contrast tickets on dark grey background (`#1C1F1D`), displaying Table #, Elapsed Time Counter (turns red if > 15m), Item List + Special Notes.

---

## 21. CRM KANBAN PIPELINE UI

*   **Columns:** `NEW LEAD` | `CONTACTED` | `QUOTED` | `WON` | `LOST`.
*   **Card Elements:** Lead Name, Contact Phone, Source Badge (`Website`, `Walk-In`), Days Open indicator, Drag handle.
*   **Drag Animation:** Cards tilt slightly (`rotate 2deg`) with elevated shadow while dragging (powered by Framer Motion / `@hello-pangea/dnd`).

---

## 22. RESPONSIVE BREAKPOINTS

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile Landscape
      'md': '768px',   // Tablet Portrait (Bar POS / KDS Target)
      'lg': '1024px',  // Tablet Landscape / Small Laptops
      'xl': '1280px',  // Desktop Standard (Front Desk / Owner)
      '2xl': '1536px', // Large Desktop Screens
    },
  },
}
```

---

## 23. MOTION DESIGN & ANIMATIONS (FRAMER MOTION)

*   **Page Transitions:** `opacity: 0, y: 8` ➔ `opacity: 1, y: 0` (Duration `0.2s`, Ease `easeOut`).
*   **Modal Entrance:** `scale: 0.96, opacity: 0` ➔ `scale: 1, opacity: 1` (Duration `0.15s`).
*   **Drawer Entrance:** `x: "100%"` ➔ `x: 0` (Duration `0.25s`, Ease `easeInOut`).
*   **Card Hover:** `y: -2px` with shadow transition (`0.15s`).

---

## 24. LOADING, EMPTY & ERROR STATES

### 7 Core Visual States
1.  **Loading:** Animated pulse skeletons matching exact card/table wireframes.
2.  **Success:** Fully populated view with interactive micro-animations.
3.  **Empty State:** Centered illustration, short title, clear action button (e.g., *"No upcoming court bookings. [Book a Court]"*).
4.  **Error State:** Human-readable explanation + "Retry" button.
5.  **Disabled State:** Dimmed opacity (`0.5`) with tooltip explaining restriction.
6.  **Permission Denied (403):** Warning banner advising role restriction.
7.  **Offline State:** Top banner alerting network disconnection.

---

## 25. TOAST NOTIFICATIONS SYSTEM

Position: **Bottom Right** (Desktop), **Top Center** (Mobile).

```
┌────────────────────────────────────────────────────────┐
│ 🟢 Booking Confirmed!                                   │
│ Court 1 • Today 06:00 PM - 07:00 PM                     │
└────────────────────────────────────────────────────────┘
```
*   **Success:** Green border (`#4A812F`).
*   **Warning:** Gold border (`#D99A24`).
*   **Danger:** Crimson border (`#D9534F`).

---

## 26. DATA TABLES DESIGN

*   **Header:** Fixed sticky header with light grey background (`#F7F8F5`) and uppercase labels (`12px`, `font-semibold`).
*   **Rows:** Height `48px`, alternating hover fill (`#F7F8F5`), bottom border (`1px solid #E3E7E1`).
*   **Pagination:** Bottom control toolbar featuring page size selector and jump buttons.

---

## 27. MODALS VS DRAWERS VS FULL PAGE DECISION MATRIX

*   **Use MODAL for:** Quick confirmations, simple forms (< 4 fields), alert dialogs.
*   **Use DRAWER for:** Booking confirmation details, quick member profile view, cart summaries, product inspect.
*   **Use FULL PAGE for:** Member registration wizard, admin settings, multi-step reports.

---

## 28. IMPLEMENTATION WORKFLOW & ACCESSIBILITY

1.  **Contrast Target:** WCAG AA Compliance ($> 4.5:1$ text contrast ratio).
2.  **Focus States:** Clear keyboard focus ring visible on all interactive elements.
3.  **Touch Target Target:** All touch buttons on tablet/mobile POS $\ge 44\text{px} \times 44\text{px}$.
4.  **Zero Raw Hex Values in Components:** All styling strictly references Tailwind token classes or CSS variables.
