# FRONTEND_PRD.md — Single Source of Truth for Frontend Implementation

**Project:** Champions Club — Sports Club Management System  
**Document Version:** 1.0.0  
**Target Architecture:** PERN (PostgreSQL, Express, React + TypeScript + Vite, Node.js)  
**UX Benchmark Reference:** Inspired by CourtReserve (https://courtreserve.com/), styled with an original Champions Club visual identity.  
**Currency & Localization:** Indian Context (₹ INR, UPI, GST, Indian phone number formats).

---

## 1. PRODUCT VISION

### Product Name
**Champions Club**

### Positioning
**"Digital Club OS"**

Champions Club is a high-performance, multi-tenant capable, real-time management operating system built specifically for modern sports and racquet clubs. It unifies every aspect of club administration and member interaction into a single cohesive frontend experience:

*   **Membership Management** (Tiered plans, digital IDs, expiry tracking, dynamic benefits)
*   **Court Booking System** (Visual grid, real-time availability, social play, multi-sport config)
*   **Gear Shop & Inventory** (Omnichannel retail, shared stock pool, reorder warnings)
*   **Bar & Cafeteria POS** (Touch-first table layout, open tabs, instant kitchen routing)
*   **Kitchen Display Screen (KDS)** (Real-time order state management)
*   **Public Portal & Website** (Sleek public presence, live availability, trial bookings, leads)
*   **CRM & Sales Pipeline** (Kanban lead management, follow-ups, quotes)
*   **Accounting & Financial Ledger** (Unified transaction history, client invoices, tax compliance)
*   **HR & Staff Payroll** (Rosters, attendance, leave workflow, payslips)
*   **Owner Executive Dashboard** (Unified revenue intelligence, operational alerts, reporting)

### Core Product Idea
> **One club. One account. One connected experience.**

Every booking, point-of-sale receipt, membership renewal, and cafeteria item purchased must feel seamlessly linked to a single member profile and immediately reflected in the central financial ledger. The frontend interface makes this interconnectivity explicit, intuitive, and lightning-fast.

---

## 2. OFFICIAL PRODUCT GOALS

| ID | Official Goal | Frontend UX Requirement & Enforced Rule | Verification / Success Metric |
| :--- | :--- | :--- | :--- |
| **G1** | **Zero Double Bookings** | The visual court booking grid dynamically locks unavailable, past, and overlapping slots. The UI prevents selecting any slot combination that collides with an existing reservation on the same court. | 0 overlapping bookings permitted by frontend validation & backend confirmation. |
| **G2** | **Members Recognised in Seconds** | Front Desk & POS components provide a global instant-search input accepting **Name**, **Phone**, **Member ID**, or **QR Code scan**. | Search response rendering under **1.0 second**. |
| **G3** | **No Lost Bar Tabs / Orders** | Every bar & cafeteria order requires attachment to a specific **Table Number** or an active **Member Profile/Guest Tab** before order dispatch. | 100% of bar orders digitally tracked; paper slips completely eliminated. |
| **G4** | **One Shared Stock** | Counter sales (Shop POS) and Public Online Store consume the exact same backend inventory pool. Out-of-stock items dynamically disable purchase CTAs in real-time. | 0 inventory desynchronization; live stock badge updates. |
| **G5** | **Club Found Online** | Public website provides a guest experience showcasing club info, active sports, membership tiers, transparent pricing, live court availability, shop catalog, trial booking, and enquiry forms. | Guest-to-lead conversion flows operational; public pages load under **1.5s**. |
| **G6** | **Owner Sees All Money** | The Owner Dashboard presents an aggregated financial overview showing real-time revenue categorized by **Source** (Courts, Shop, Bar, Memberships) and **Payment Mode** (Cash, Card, UPI, Online). | Instant visual clarity on revenue for Today, This Week, and This Month. |

---

## 3. ROLES & ACCESS CONTROL

The system strictly enforces **seven product roles** structured across **five access levels**.

```
Level 1: [Owner / Admin] (Full System Access)
             │
 Level 2: ├──[Front Desk] ──[Bar Staff] ──[Shop Staff] (Peer Operations Staff)
             │                 │
 Level 3:    │            [Kitchen] (Order Processing Only)
             │
 Level 4: └──[Member] (Logged-In Private Portal)
             │
 Level 5:    └──[Visitor] (Public Access Only)
```

### Access Principles
1.  **Hierarchy Rule:** Higher roles possess strict superset access over lower roles.
2.  **Peer Isolation:** Peer staff roles (Front Desk, Bar Staff, Shop Staff) cannot access or view each other's operational modules.
3.  **Kitchen Isolation:** Kitchen staff only view the active KDS (Kitchen Display System) feed originating from the Bar/Cafeteria POS.
4.  **Member Privacy:** Members view exclusively their own bookings, tab, shop orders, and digital card.
5.  **Visitor Scope:** Unauthenticated visitors interact only with public website routes and lead capture forms.

---

## 4. ROLE-SPECIFIC FRONTEND EXPERIENCE

### 4.1 Owner / Admin (Level 1)
*   **Navigation:** `Dashboard` | `Members` | `Bookings` | `Bar` | `Shop` | `CRM` | `Accounting` | `HR` | `Reports` | `Settings`
*   **Primary Experience:** Dense executive control tower. Full CRUD control over settings, plan definitions, pricing, court configurations, menu items, products, system reports, financial ledgers, payroll approvals, and staff permissions.
*   **Strict Prohibitions:** None. Complete administrative authority.

### 4.2 Front Desk (Level 2)
*   **Navigation:** `Overview` | `Members` | `Bookings` | `CRM`
*   **Supported Workflows:** Register new members, process renewals/upgrades, instant member search, view full member profile history, desk court booking (member & walk-in), booking cancellations, Friday social play coordination, lead follow-ups, submitting leave requests.
*   **Strict Prohibitions:** Cannot modify membership plan rules/prices, view employee payroll, or view high-level financial accounting reports.

### 4.3 Bar Staff (Level 2)
*   **Navigation:** `Tables` | `Orders` | `Tabs` | `Kitchen` | `Shift`
*   **Supported Workflows:** Touchscreen table layout management, taking cafeteria/bar orders, opening member running tabs, settling tabs, processing multi-mode payments (Cash, Card, UPI), opening/closing shifts, viewing individual shift summaries, submitting leave requests.
*   **Strict Prohibitions:** Cannot edit item menu prices, change tax rates, or view financial revenue from courts, shop, or memberships.

### 4.4 Kitchen (Level 3)
*   **Navigation:** `Kitchen Orders`
*   **Supported Workflows:** High-contrast touch grid displaying incoming order tickets. Status updates: `NEW` ➔ `PREPARING` ➔ `SERVED`. Audio/visual alerts for new tickets.
*   **Strict Prohibitions:** Cannot view prices, bills, member profiles, or navigate to any other staff module.

### 4.5 Shop Staff (Level 2)
*   **Navigation:** `POS` | `Inventory` | `Online Orders`
*   **Supported Workflows:** Counter retail POS, adding stock inventory, monitoring low-stock alerts, packing online member orders, updating order fulfillment status (`Placed` ➔ `Packed` ➔ `Ready` ➔ `Delivered`), submitting leave requests.
*   **Strict Prohibitions:** Cannot change product prices/taxes, view overall club payroll, or view non-shop financial reports.

### 4.6 Member (Level 4)
*   **Navigation:** `Home` | `Book` | `My Bookings` | `Shop` | `My Orders` | `Membership` | `My Tab` | `Profile`
*   **Supported Workflows:** Self-serve court booking with automated plan discounts, booking cancellation/rescheduling, joining Friday social play sessions, purchasing gear online, reviewing active bar tab items, tracking order status, viewing digital member QR card, renewing membership.
*   **Strict Prohibitions:** Cannot view other members' private information, staff screens, or administrative controls.

### 4.7 Visitor (Level 5)
*   **Navigation:** `Home` | `Courts` | `Availability` | `Membership` | `Shop` | `Trial` | `Contact` | `Login` | `Register`
*   **Supported Workflows:** Browsing club info, viewing court schedules and live slot availability, browsing public shop catalog, submitting trial booking requests, sending general enquiries, signing up for membership.
*   **Strict Prohibitions:** Cannot execute member court bookings, place member shop orders, or view any non-public data.

---

## 5. MODULE ARCHITECTURE

```
                      ┌─────────────────────────────────────────┐
                      │          M1: MEMBERSHIP CORE            │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────┴────────┐               ┌────────┴────────┐               ┌────────┴────────┐
│ M2: COURT       │               │ M3: GEAR SHOP   │               │ M4: BAR &       │
│     BOOKING     │               │     & INVENTORY │               │     CAFETERIA   │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      │          M7: TRANSACTION LEDGER         │
                      └────────────────────┬────────────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      │     M9: OWNER DASHBOARD & REPORTS       │
                      └─────────────────────────────────────────┘
```

The system comprises 9 domain modules:
*   **M1: Membership** (Core Profile & Benefit Engine)
*   **M2: Court Booking** (Reservation & Slot Matrix Engine)
*   **M3: Gear Shop & Inventory** (Omnichannel Product Catalog & Stock)
*   **M4: Bar and Cafeteria POS** (Table Management, Tabs & Kitchen Feed)
*   **M5: Public Website** (Guest Portal & Lead Generation)
*   **M6: CRM / Leads** (Kanban Lead Pipeline & Conversion)
*   **M7: Accounting & Invoicing** (Unified Ledger & Billing)
*   **M8: HR & Payroll** (Staff Management & Shift Operations)
*   **M9: Owner Dashboard & Reports** (Executive Analytics & KPIs)

---

## 6. MVP IMPLEMENTATION PRIORITIES (24-HOUR HACKATHON)

```
[ P0: MUST BE FULLY IMPLEMENTED ]
  1. Membership (M1)
  2. Court Booking (M2)
  3. Ledger + Owner Dashboard (M7/M9)
                │
                ▼
[ P1: IMPLEMENT AFTER P0 COMPLETE ]
  4. Bar POS (M4)
  5. Kitchen Screen (M4)
  6. Gear Shop & Inventory (M3)
  7. Online Shop Orders (M3)
  8. Public Website & Trial Booking (M5)
                │
                ▼
[ P2: IMPLEMENT ONLY IF TIME REMAINS ]
  9. CRM Pipeline & Follow-ups (M6)
 10. Invoicing & Tax Reports (M7)
 11. HR, Shift Roster & Payroll (M8)
```

> **Core Directive:** A flawless, production-ready P0 + P1 experience is vastly superior to an incomplete implementation of all 9 modules.

---

## 7. ROUTE ARCHITECTURE & GUARD STRUCTURE

```
/ (Root Layout)
├── Public Routes (Unauthenticated)
│   ├── /                         -> Public Landing Page
│   ├── /about                    -> Club Overview & Facilities
│   ├── /courts                   -> Sport & Court Specifications
│   ├── /availability             -> Live 7-Day Court Availability Matrix
│   ├── /membership               -> Plan Comparison & Tiers
│   ├── /shop                     -> Public Gear Shop Catalog
│   ├── /shop/:productId          -> Product Details Page
│   ├── /trial                    -> Book a Trial Session Form
│   ├── /contact                  -> Enquiry & Location Form
│   ├── /login                    -> Unified Multi-Role Auth Screen
│   └── /register                 -> Visitor Self-Registration
│
├── Member Portal Routes (/member/*) [Role: Member]
│   ├── /member                   -> Member Portal Dashboard
│   ├── /member/book              -> Self-Serve Court Booking Grid
│   ├── /member/bookings          -> My Active & Past Bookings
│   ├── /member/bookings/:id      -> Booking Details & Cancellation Modal
│   ├── /member/membership        -> Active Plan & Expiry Details
│   ├── /member/shop              -> Member Shop (Auto-applied discounts)
│   ├── /member/orders            -> Gear Order History
│   ├── /member/orders/:id        -> Order Fulfillment Tracking
│   ├── /member/tab               -> Active Bar Tab & Ledger Items
│   ├── /member/profile           -> Personal Info & Emergency Contacts
│   └── /member/card              -> Digital Member ID & QR Display
│
├── Front Desk Staff Routes (/staff/frontdesk/*) [Roles: Front Desk, Owner]
│   ├── /staff/frontdesk          -> Front Desk Overview & Today's Schedule
│   ├── /staff/frontdesk/members  -> Member Directory & Fast Search
│   ├── /staff/frontdesk/members/:id -> Full 360° Member Profile
│   ├── /staff/frontdesk/bookings -> Master Desk Booking Grid
│   └── /staff/frontdesk/crm      -> Lead Capture & Follow-up List
│
├── Bar & Cafeteria Staff Routes (/staff/bar/*) [Roles: Bar Staff, Owner]
│   ├── /staff/bar                -> Active Table Grid & Quick POS
│   ├── /staff/bar/tables         -> Table Layout & Status Management
│   ├── /staff/bar/orders         -> Active Cafeteria Orders
│   ├── /staff/bar/tabs           -> Open Member Running Tabs
│   └── /staff/bar/shift          -> Shift Register Open/Close & Daily Cash
│
├── Kitchen Screen Route (/staff/kitchen) [Roles: Kitchen, Bar Staff, Owner]
│   └── /staff/kitchen            -> High-Contrast KDS Screen
│
├── Shop Staff Routes (/staff/shop/*) [Roles: Shop Staff, Owner]
│   ├── /staff/shop               -> Counter Retail POS Terminal
│   ├── /staff/shop/inventory     -> Stock Management & Reorder Alerts
│   └── /staff/shop/orders        -> Online Order Packing & Fulfillment
│
└── Owner / Admin Executive Suite (/admin/*) [Role: Owner]
    ├── /admin                    -> Executive Master Dashboard
    ├── /admin/members            -> Full Member Database & Plan Admin
    ├── /admin/bookings           -> Master Reservation Control
    ├── /admin/bar                -> Bar Sales & Menu Setup
    ├── /admin/shop               -> Retail Analytics & Product Master
    ├── /admin/inventory          -> Central Warehouse Stock Audit
    ├── /admin/crm                -> Drag-and-Drop CRM Kanban Pipeline
    ├── /admin/accounting         -> Financial Ledger & Invoicing
    ├── /admin/hr                 -> Staff Roster, Attendance & Payroll
    ├── /admin/reports            -> PDF/Excel Export Center
    └── /admin/settings           -> Club Config (Courts, Rates, Taxes)
```

### Security Route Guards
*   `ProtectedRoute`: Validates token freshness and user session.
*   `RoleGuard`: Verifies `user.role` against route permission arrays. Redirects unauthorized users to `/403` or their primary role home dashboard.

---

## 8. MEMBERSHIP FRONTEND SPECIFICATION (M1)

### 8.1 Plan Definition & Dynamic Benefits
Membership benefits are **dynamic server data** and must never be hardcoded into UI code.

```typescript
interface MembershipPlan {
  id: string;
  name: 'Gold' | 'Silver' | 'Junior';
  price: number;              // Monthly plan fee (INR)
  durationMonths: number;     // Contract duration
  courtDiscountPercent: number; // Discount on court bookings (e.g. Gold=100%, Silver=50%)
  freeSessionsPerMonth: number;
  shopDiscountPercent: number; // e.g. Gold=15%, Silver=5%
  barDiscountPercent: number;  // e.g. Gold=10%, Silver=5%
  maxBookingsPerDay: number;   // Business Rule: Hard ceiling (e.g. 2)
  ageLimitMax?: number;        // Junior Plan rule: strictly < 18 years
  status: 'active' | 'archived';
}
```

### 8.2 Registration & Profile Requirements
*   **Member Registration Form:** Captures Name, Phone, Email, Date of Birth, Photo Upload/Camera Capture, Selected Plan, Start Date, Emergency Contact Name & Phone.
*   **Age Enforcement:** If Date of Birth yields age >= 18, selecting the **Junior Plan** throws an immediate form validation error.
*   **Auto-Generated Identifiers:** Upon submission, the UI displays the generated **Member ID** (e.g., `CC-2026-8842`) and renders a scannable **QR Code**.

### 8.3 Member 360° Profile Screen
The Member Profile (`/staff/frontdesk/members/:id`) consolidates all member interactions into a tabbed layout:
1.  **Identity Banner:** Photo, Name, Member ID, QR Code badge, Plan tier, Expiry badge (`Active` | `Expiring Soon` | `Expired`).
2.  **Tab 1: Bookings History:** Active upcoming court slots, past reservations, cancellation history.
3.  **Tab 2: Financial Ledger:** Recent shop purchases, bar tab receipts, plan subscription payments.
4.  **Tab 3: Active Bar Tab:** Real-time running cafeteria tab items with instant "Settle Tab" action button.
5.  **Tab 4: Activity Timeline:** Audit trail of check-ins, bookings, and purchases.

---

## 9. COURT BOOKING FRONTEND SPECIFICATION (M2)

### 9.1 Core Booking Business Rules Matrix

| Rule ID | Constraint | Enforcement Mechanism in Frontend |
| :--- | :--- | :--- |
| **BR1** | Session Duration | Exactly **60 minutes** per booking block. |
| **BR2** | Slot Increments | Slots start every **30 minutes** (e.g., 06:00, 06:30, 07:00). A 60-minute booking at 06:00 automatically occupies both the `06:00-06:30` and `06:30-07:00` grid cells. |
| **BR3** | Daily Limit | Maximum **2 bookings per member per day**. The UI checks active daily count and disables slot selection if limit is reached. |
| **BR4** | No Overlaps | Zero overlapping bookings allowed on the same court. Unavailable slots are rendered in a visually disabled state. |
| **BR5** | Dynamic Rates | Walk-in users pay full court rate; members pay discounted rate based on their active plan benefit data. |
| **BR6** | Social Play | Friday Social Play allows multi-player registration on a single court with per-player entry fee. |

### 9.2 The Interactive Booking Grid
The Booking Grid is the central operational tool for Front Desk and Member booking screens.

#### Visual Layout Matrix Structure
```
┌──────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Court / Time │   06:00 - 06:30  │   06:30 - 07:00  │   07:00 - 07:30  │   07:30 - 08:00  │
├──────────────┼──────────────────┴──────────────────┼──────────────────┼──────────────────┤
│ Court 1      │ [    BOOKED: Rajesh (Gold)        ] │ AVAILABLE        │ MAINTENANCE      │
│ (Badminton)  │ [    06:00 AM - 07:00 AM         ] │ ₹0 (Plan Free)   │ Out of Service   │
├──────────────┼─────────────────────────────────────┼──────────────────┴──────────────────┤
│ Court 2      │ AVAILABLE                           │ [  SOCIAL PLAY: Friday Open Night  ] │
│ (Tennis)     │ ₹400 / hr                           │ [  4 / 8 Players Joined            ] │
└──────────────┴─────────────────────────────────────┴─────────────────────────────────────┘
```

#### Slot Visual States Legend
*   🟢 **Available:** Clickable card showing calculated price based on active user context.
*   🔴 **Booked:** Non-clickable slot displaying member name/walk-in badge and booking status.
*   🔵 **Social Play:** Interactive badge showing current participant count (e.g., `4/8 Joined`) with "Join Social Play" CTA.
*   ⚪ **Maintenance:** Striped dark grey cell indicating court unavailable.
*   🟡 **Selected:** High-contrast outline highlighting currently selected slot(s) prior to confirmation.
*   🔒 **Disabled:** Dimmed slot indicating user daily limit exceeded or past time block.

### 9.3 Booking Drawer & Validation Sequence
Clicking an available slot opens the **Booking Confirmation Drawer**:
1.  **Summary Display:** Court Name, Sport Type, Date, Start Time, End Time (Start + 60m).
2.  **User Selection:** Search/Select Member OR Toggle Walk-In.
3.  **Real-Time Price Calculation:**
    $$\text{Base Rate} - \text{Plan Discount} = \text{Final Payable Amount}$$
4.  **Validation Stage:**
    *   *Check 1:* Is slot still free? (Optimistic concurrency UI validation)
    *   *Check 2:* Does member have $< 2$ bookings today?
    *   *Check 3:* Is member age eligible (if junior slot restriction)?
5.  **Payment Mode Selector:** Cash | Card | UPI | Charge to Room/Tab.
6.  **Action:** Confirm Booking button with inline loading indicator.

---

## 10. BAR & CAFETERIA POS FRONTEND SPECIFICATION (M4)

### 10.1 Table Layout Grid
Designed specifically for touchscreen tablets.
*   **Table Cards:** Display Table #, Seating Capacity, Current Status (`Free` [Green] vs `Occupied` [Amber]).
*   **Occupied Card Metrics:** Shows Active Member/Guest Name, Elapsed Time (e.g., `42 mins`), Running Item Count, Current Order Total (₹).

### 10.2 Order Entry & Kitchen Dispatch Interface
*   **Category Tabs:** `Beverages` | `Snacks` | `Proteins & Shakes` | `Meals`
*   **Item Grid:** Large touch targets displaying Item Name, Price, Stock status, and fast `+ Add` button.
*   **Order Summary Sidebar:**
    *   Attached Table # and Member Search bar.
    *   Itemized list with quantity steppers (`-`, `+`) and item-level notes (e.g., *"Less sugar"*).
    *   Discount auto-applied based on Member Plan (e.g., 10% Gold Bar Discount).
    *   **Dispatch Action:** `Send to Kitchen` button fires instantaneous notification ticket to Kitchen Display Screen.

### 10.3 Kitchen Display Screen (KDS)
*   **Purpose:** Zero-distraction order queue for kitchen staff.
*   **Layout:** 3 Kanban columns: `NEW ORDERS` ➔ `IN PREPARATION` ➔ `READY TO SERVE`.
*   **Ticket Card Content:** Order #, Table #, Order Elapsed Timer (color shifts from green to red past 15 mins), Detailed Item List + Special Notes.
*   **One-Touch Advance:** Tapping a ticket card advances its state instantly.

---

## 11. GEAR SHOP & INVENTORY FRONTEND SPECIFICATION (M3)

### 11.1 Omnichannel Inventory Synchronization UI
The frontend explicitly communicates shared stock availability across Counter POS and Public Online Store.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Product Master: Wilson Pro Staff 97 Racket                             │
│ SKU: WR-97-V14 | Category: Rackets | Price: ₹18,999                    │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Total Stock Pool: 12 Units       │ Low Stock Threshold: 3 Units        │
├──────────────────────────────────┼─────────────────────────────────────┤
│ Channel Availability:            │ Status:                             │
│  - Counter POS: 12 Available     │  🟢 In Stock (Shared Pool Active)   │
│  - Online Store: 12 Available    │                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
```

*   **Stock Lock Rule:** Placing an item in an active cart temporarily holds stock. If stock reaches `0`, both POS and Online Store render disabled `"OUT OF STOCK"` buttons.

### 11.2 Public Store vs Member Shop Experience
*   **Public Guest View:** Displays standard Retail Price (MSRP).
*   **Member View:** Displays standard price with strikethrough and highlights member plan pricing (e.g., `"Gold Member Price: ₹16,149 (15% OFF)"`).

---

## 12. PUBLIC WEBSITE FRONTEND SPECIFICATION (M5)

### 12.1 Layout Breakdown
1.  **Hero Section:** High-impact visual carousel, brand headline *"Elevate Your Game at Champions Club"*, dual CTAs: `Book a Court` & `Explore Memberships`.
2.  **Active Sports Grid:** Interactive cards showcasing available sports (Tennis, Padel, Badminton, Squash).
3.  **Live Court Availability Ticker:** Real-time widget showing free slots available today.
4.  **Membership Plans Showcase:** Side-by-side pricing cards comparing Gold, Silver, and Junior tiers.
5.  **Equipment Shop Preview:** Featured gear carousel with instant "Buy Now" links.
6.  **Trial Session Booking Form:** Name, Phone, Email, Preferred Sport, Preferred Date & Time Slot.
7.  **Public Enquiry Contact Form:** Name, Phone, Message area, location map.

---

## 13. CRM & SALES PIPELINE FRONTEND SPECIFICATION (M6)

### 13.1 Drag-and-Drop Kanban Board
*   **Pipeline Stages:** `NEW LEAD` ➔ `CONTACTED` ➔ `QUOTED` ➔ `WON` (Converted) ➔ `LOST`.
*   **Lead Card:** Lead Name, Contact Info, Source Tag (`Public Website`, `Walk-In`, `Trial Booking`), Assigned Staff Avatar, Last Activity Date.
*   **Conversion Action:** Moving card to `WON` triggers modal to instantly convert lead into a registered Member profile.

---

## 14. OWNER EXECUTIVE DASHBOARD SPECIFICATION (M9)

The Owner Dashboard is an actionable executive control tower.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ OWNER EXECUTIVE DASHBOARD                                         [Today] [Week] [Month]│
├───────────────┬───────────────┬───────────────┬───────────────┬─────────────────────────┤
│ TOTAL REVENUE │ COURT REVENUE │ SHOP REVENUE  │ BAR REVENUE   │ ACTIVE MEMBERS          │
│ ₹1,48,500     │ ₹62,000       │ ₹38,500       │ ₹24,000       │ 412                     │
│ ▲ +14% vs wk  │ 41.7% of total│ 25.9% of total│ 16.1% of total│ (28 Expiring Soon)     │
└───────────────┴───────────────┴───────────────┴───────────────┴─────────────────────────┘
```

### 14.1 Key Visual Components
1.  **Top KPI Bar:** Revenue Today, Revenue This Week, Revenue This Month, Active Member Count, Court Utilization Rate (%).
2.  **Revenue Split Charts:** Interactive Pie Chart by Source (Courts vs Shop vs Bar vs Memberships) & Donut Chart by Payment Mode (Cash, Card, UPI, Online).
3.  **Utilization Heatmap:** 7-Day peak hours breakdown matrix per court.
4.  **ACTION REQUIRED Panel (Operational Alerts):**
    *   ⚠️ **Low Stock Alert:** Products at or below reorder threshold.
    *   ⌛ **Expiring Memberships:** Members expiring within 7 days needing renewal follow-up.
    *   💵 **Outstanding Tab Balances:** Unsettled member tabs exceeding threshold.
    *   📞 **Uncontacted Leads:** New website trial requests waiting > 24 hours.

---

## 15. ACCOUNTING & HR FRONTEND SPECIFICATION (M7 & M8 - P2 SCOPE)

### 15.1 Financial Ledger (`/admin/accounting`)
*   **Unified Transaction Table:** Columns: Date, Source Module, Transaction Reference ID, Member/Customer Name, Tax (GST ₹), Total Amount (₹), Payment Mode, Receipt Download link.

### 15.2 HR & Staff Operations (`/admin/hr`)
*   **Staff Roster Table:** Shift assignment timeline per employee.
*   **Leave Approval Queue:** List of pending leave requests from Front Desk, Bar, or Shop staff with `Approve` / `Reject` actions.

---

## 16. DESIGN STATES & SYSTEM STATES MATRIX

Every primary UI screen must explicitly handle 7 core visual states:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ UI SCREEN STATE LIFECYCLE                                                               │
├─────────────────┬───────────────────────────────────────────────────────────────────────┤
│ 1. LOADING      │ Animated Tailwind Skeletons matching exact component wireframes.      │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 2. SUCCESS      │ Clean, data-populated visual view with micro-interactions.            │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 3. EMPTY        │ Helpful illustration + clear CTA (e.g. "No active bookings today").   │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 4. ERROR        │ Human-readable error notice + "Retry" CTA button.                     │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 5. DISABLED     │ Visually dimmed states with tooltip explanations for locked actions.  │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 6. PERM DENIED  │ 403 Forbidden banner directing users back to their role home.        │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 7. OFFLINE/NET  │ Toast banner alerting user of lost internet connectivity.             │
└─────────────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 17. NOTIFICATIONS & ALERTS ARCHITECTURE (M18)

The notification hub alerts users to critical operational events:

```typescript
interface NotificationItem {
  id: string;
  type: 'booking_confirm' | 'booking_cancel' | 'expiry_warning' | 'low_stock' | 'new_lead' | 'order_ready';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
```

*   **Header Bell Widget:** Badge displaying unread alert count. Dropdown listing recent alerts with filter by category.

---

## 18. RESPONSIVE DEVICE STRATEGY

| Target Role | Device Category | Form Factor & Navigation Strategy |
| :--- | :--- | :--- |
| **Owner / Front Desk** | **Desktop (1024px+)** | Multi-column layouts, fixed sidebar navigation, collapsible data tables, keyboard shortcuts (`Cmd+K` global search). |
| **Bar / Kitchen POS** | **Tablet (768px - 1024px)** | Touch-first grid layouts, large tap targets ($min \text{ } 48\text{px} \times 48\text{px}$), modal drawers, persistent cart drawer. |
| **Member / Visitor** | **Mobile (< 768px)** | Bottom tab bar navigation, touch swipeable cards, single-column booking wizard, digital QR card scanner modal. |

---

## 19. FRONTEND API CONTRACTS & SERVICES LAYER

All asynchronous data communication is strictly decoupled from visual React components via typed API service modules.

### Service Modules Catalog
*   `authApi`: Session login, logout, token refresh, current role info.
*   `memberApi`: CRUD operations on members, search queries, profile metrics.
*   `membershipApi`: Fetching plan tiers, updating dynamic plan benefits.
*   `bookingApi`: Fetching court grid slots, creating reservations, cancelling slots.
*   `courtApi`: Court configuration management, maintenance status toggles.
*   `shopApi`: Product catalog queries, checkout cart submission, online orders.
*   `inventoryApi`: Stock queries, stock intake logging, low stock alerts.
*   `barApi`: Table status management, order creation, member tab operations.
*   `kitchenApi`: Fetching KDS order tickets, state transition mutations.
*   `crmApi`: Lead pipeline updates, drag-and-drop column transitions.
*   `ledgerApi`: Transactions log fetching, sales export triggers.
*   `dashboardApi`: Aggregated KPI queries, charts data provider.
*   `hrApi`: Shift rosters, leave request approvals.

### TypeScript Interface Expectations Sample (`bookingApi.ts`)

```typescript
export interface CourtSlot {
  id: string;
  courtId: string;
  courtName: string;
  startTime: string; // ISO 8601 timestamp
  endTime: string;   // ISO 8601 timestamp
  status: 'available' | 'booked' | 'social_play' | 'maintenance';
  bookingDetails?: {
    bookingId: string;
    memberName: string;
    memberId?: string;
    isWalkIn: boolean;
  };
  price: number;
}

export interface CreateBookingPayload {
  courtId: string;
  startTime: string;
  endTime: string;
  memberId?: string;
  isWalkIn: boolean;
  walkInDetails?: { name: string; phone: string };
  paymentMode: 'cash' | 'card' | 'upi' | 'tab';
}
```

---

## 20. COMPONENT ARCHITECTURE CATALOG

### 20.1 Global / Reusable Components
*   `AppShell`: Primary layout frame rendering role-based sidebars and topbars.
*   `SidebarNav`: Collapsible left navigation panel driven by user role permissions.
*   `MobileNav`: Fixed bottom tab bar for mobile viewports.
*   `Topbar`: Header component featuring breadcrumbs, global search launcher, notification bell, and user avatar menu.
*   `CommandPalette`: Keyboard-accessible (`Cmd+K`) global search modal.
*   `DataTable`: Virtualized table component with sorting, pagination, and multi-field filtering.
*   `StatusBadge`: Color-coded pill badge for booking, membership, and order statuses.
*   `ConfirmDialog`: Generic modal for dangerous action confirmations (e.g., booking cancellation).

### 20.2 Domain-Specific Components
*   `BookingGrid`: The main visual 30-minute interval court matrix.
*   `BookingDrawer`: Sliding side drawer for reservation creation & payment.
*   `MemberCard`: Visual preview displaying member photo, plan tier, and status.
*   `DigitalMemberCard`: Scannable QR code display formatted for smartphone screens.
*   `TableCard`: Touchscreen card component representing cafeteria tables.
*   `KitchenOrderCard`: High-contrast ticket block for the KDS view.
*   `ProductCard`: Retail product display card with discount badges.
*   `PipelineColumn`: Kanban column container supporting drag-and-drop lead cards.
*   `RevenueCard`: Top-level KPI summary tile with trend percentage indicators.

---

## 21. SECURITY, AUTHENTICATION & ACCESS

1.  **JWT Token Storage:** Auth tokens are stored securely in HTTP-only cookies (or encrypted `localStorage` fallback with automatic memory wipe on logout).
2.  **Automatic Invalidation:** HTTP interceptor intercepts `401 Unauthorized` responses, clearing session state and forcing redirection to `/login`.
3.  **Role Verification:** Route transition hooks re-verify client state permissions before rendering page subtrees.
4.  **Zero Sensitive Financial Data:** No raw credit card digits or banking PINs are ever stored or handled directly by frontend code. Payment flows hand off to gateway modals (Razorpay / UPI intents).

---

## 22. PERFORMANCE TARGETS & OPTIMIZATION

| Target Metric | Benchmark Limit | Frontend Optimization Strategy |
| :--- | :--- | :--- |
| **Member Search Response** | $< 1.0 \text{ second}$ | Debounced text inputs (200ms) with memory caching via TanStack Query. |
| **Desk Booking Flow** | $< 30.0 \text{ seconds}$ | Keyboard-optimized drawer navigation & auto-filled pricing calculations. |
| **Grid Slot Availability Check** | $< 0.5 \text{ seconds}$ | Light payload REST queries with optimistic local selection rendering. |
| **Double Bookings** | **Strictly 0** | Dual verification (UI collision check + server exclusion constraint handling). |

---

## 23. REALISTIC DEMO DATA SPECIFICATION

To ensure a compelling demonstration, the application includes realistic seed dataset fixtures:

*   **Members:** 400+ generated member profiles distributed across Gold, Silver, and Junior tiers.
*   **Courts:** 6 configurable courts (2 Tennis, 2 Badminton, 2 Padel).
*   **Bookings:** Pre-populated grid showing realistic peak-hour activity (06:00 - 09:00 AM & 05:00 - 10:00 PM).
*   **Shop Products:** Authentic items (Wilson Rackets, Dunlop Balls, Asics Shoes) with active stock levels and low-stock alerts.
*   **Cafeteria Menu:** Hot drinks, protein shakes, and snacks linked to active table orders.
*   **Indian Context:** Indian phone number formatting (+91), Indian names, Prices in ₹ INR, payment options featuring UPI (GPay, PhonePe, Paytm), and GST breakdowns.

---

## 24. HACKATHON DEMO WALKTHROUGH STORY (20-STEP FLOW)

```
[ Step 1: Visitor Landing ] -> Visitor lands on Public Website homepage (/)
[ Step 2: Explore Availability ] -> Visitor checks live court availability (/availability)
[ Step 3: Trial Booking ] -> Visitor submits a Trial Session booking form (/trial)
[ Step 4: Lead Creation ] -> System creates lead in CRM pipeline
[ Step 5: Staff Lead Review ] -> Front Desk views new lead in CRM (/staff/frontdesk/crm)
[ Step 6: Member Registration ] -> Front Desk converts lead into a registered Gold Member (/staff/frontdesk/members)
[ Step 7: Digital ID Issued ] -> Member receives digital member QR card (/member/card)
[ Step 8: Self-Serve Booking ] -> Member logs in and opens court booking grid (/member/book)
[ Step 9: Plan Discount Applied ] -> System automatically applies Gold plan 100% discount on court slot
[ Step 10: Desk Reservation ] -> Front Desk completes booking confirmation on behalf of member
[ Step 11: Gear Shop Visit ] -> Member visits online shop (/member/shop) and orders tennis balls
[ Step 12: Inventory Deducted ] -> System auto-deducts inventory count from shared pool
[ Step 13: Cafeteria Visit ] -> Member arrives at club bar; Bar Staff opens Table #4 (/staff/bar)
[ Step 14: Order Sent to Kitchen ] -> Bar Staff inputs order; ticket routes to KDS screen instantly (/staff/kitchen)
[ Step 15: Food Preparation ] -> Kitchen staff marks order status PREPARING -> SERVED
[ Step 16: Member Discount ] -> 10% Gold Bar discount auto-calculates on tab total
[ Step 17: Tab Settlement ] -> Member settles tab via UPI QR code scan
[ Step 18: Owner Login ] -> Owner opens Executive Dashboard (/admin)
[ Step 19: Financial Audit ] -> Owner reviews real-time revenue breakdown (Courts + Shop + Bar + Memberships)
[ Step 20: Operational Alerts ] -> Owner inspects low-stock alerts & expiring memberships panel (DEMO FINISH)
```

---

## 25. ACCEPTANCE CRITERIA CHECKLIST

- [x] **Role Isolation:** All 7 roles possess distinct navigation, screen access, and permission guards.
- [x] **P0 Membership:** Plan setup, registration, member search, 360° profile, and digital card functional.
- [x] **P0 Court Booking:** 30-min interval visual grid enforces 60-min sessions, max 2 daily bookings, and zero double bookings.
- [x] **P0 Owner Dashboard:** Real-time revenue charts by source and payment mode with action-required alerts.
- [x] **P1 Bar POS & KDS:** Touchscreen table management, tab settlement, and real-time KDS order feed functional.
- [x] **P1 Shop & Inventory:** Counter sales and online store share the exact same inventory pool with low-stock warnings.
- [x] **P1 Public Website:** Responsive public portal with plans, court availability, trial booking, and enquiry forms.
- [x] **Responsive Layouts:** Desktop-optimized for Owner/Front Desk, Tablet-optimized for Bar/Kitchen, Mobile-optimized for Members.
- [x] **Design States:** Complete handling of Loading, Success, Empty, Error, Disabled, and Permission Denied states across screens.
- [x] **API Abstraction:** All server communications handled through typed API service modules.
- [x] **Demo Readiness:** Populated with realistic Indian demo data without generic placeholder text.

---

## 26. IMPLEMENTATION PRINCIPLE

When writing frontend code during implementation:
1.  **Prioritize Flow & UX:** Validate core user journeys before aesthetic visual embellishments.
2.  **Component Reusability:** Build domain components modularly to prevent duplication.
3.  **Strict State Management:** Keep UI state local; rely on server state caching (TanStack Query) for backend data.
4.  **Production Quality:** Deliver clean typography, responsive layout grid structures, and smooth micro-interactions that feel like a high-end commercial SaaS application.
