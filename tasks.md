# Implementation Task List — Champions Club (Frontend)

**Document Version:** 1.0.0  
**Project:** Champions Club — Sports Club Management System  
**Tracked Progress:** 3 / 6 Phases Completed

---

## Phase 1: Project Setup & Base Architecture [COMPLETED]
- [x] Initialize Vite + React + TypeScript application (`create-vite`)
- [x] Install core dependencies (`tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `framer-motion`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `clsx`, `tailwind-merge`, `react-router-dom`, `canvas-confetti`, `@hello-pangea/dnd`)
- [x] Configure Tailwind CSS, CSS color tokens in `src/index.css`, fonts, and Vite path aliases (`@/`)
- [x] Establish directory structure (`src/components`, `src/pages`, `src/services`, `src/context`, `src/types`, `src/data`, `src/hooks`, `src/routes`, `src/utils`)

## Phase 2: Data Models, Types, API Layer & Mock Fixtures [COMPLETED]
- [x] Define comprehensive TypeScript interfaces (`User`, `Member`, `MembershipPlan`, `Court`, `Booking`, `Product`, `BarTable`, `BarOrder`, `KitchenTicket`, `Lead`, `LedgerTransaction`, `Employee`, `Notification`)
- [x] Create realistic Indian seed mock dataset (`src/data/mockData.ts`) featuring 400+ members, 6 courts, populated bookings, gear inventory, cafeteria menu, tables, leads, ledger transactions, and operational alerts
- [x] Implement mock API service layer (`authApi`, `memberApi`, `bookingApi`, `shopApi`, `barApi`, `kitchenApi`, `crmApi`, `dashboardApi`, `ledgerApi`, `notificationApi`) with simulated network latency and query caching

## Phase 3: Core UI Components & App Shell [COMPLETED]
- [x] Build base UI component library (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `Drawer`, `Toast`, `Skeleton`, `Table`, `Tabs`)
- [x] Build App Shell layout (`Sidebar`, `Topbar`, `MobileNav`, `CommandPalette` for `Cmd+K` instant search, `NotificationCenter`)
- [x] Implement Auth & Role Switcher Context (`src/context/AuthContext.tsx`) allowing 1-click switching between all 7 roles (Owner, Front Desk, Bar Staff, Kitchen, Shop Staff, Member, Visitor) for seamless testing
- [x] Configure React Router with `ProtectedRoute` & `RoleGuard`

## Phase 4: P0 Feature Modules (Must Be Fully Implemented) [IN PROGRESS]
- [x] **Core Domain Components:** Built `BookingGrid`, `BookingDrawer`, `DigitalMemberCard`, `MemberRegistrationModal`
- [ ] **M1 Membership:** Plan setup, Member directory with instant search (< 1s), Member registration with age validation (< 18 Junior restriction), Auto-generated Member ID & scannable QR Code, 360° Member Profile view, Renewal/Upgrade workflows
- [ ] **M2 Court Booking Page:** Interactive 30-minute interval grid matrix, 60-min session enforcement, daily limit check (max 2/member/day), overlap slot locking, walk-in vs member rates, Booking Drawer with price breakdown, Friday Social Play multi-player session, Booking Cancellation flow
- [ ] **M7/M9 Owner Dashboard & Financial Ledger:** Revenue KPI cards (Today, Week, Month), Revenue by Source Donut & Trend Area charts (Recharts), Court Utilization Heatmap, ACTION REQUIRED Operational Alerts panel, Transaction Ledger table with filters

## Phase 5: P1 Feature Modules (High Priority Operations) [PENDING]
- [ ] **M4 Bar POS & Kitchen Display Screen (KDS):** Touch-friendly Table Layout Grid (Free/Occupied), Touch Order Drawer with item steppers, Member tab management, Split payment modal (Cash, Card, UPI), Shift register open/close summary, 3-column KDS (`NEW` ➔ `PREPARING` ➔ `SERVED`)
- [ ] **M3 Gear Shop & Inventory:** Omnichannel product catalog with shared stock pool, Member plan discounts, Retail Counter POS, Online order fulfillment workflow (`Placed` ➔ `Packed` ➔ `Ready` ➔ `Delivered`), Low stock alerts & Stock adjustment table
- [ ] **M5 Public Website:** Guest portal homepage, Hero banner, Active sports showcase, Live court availability widget, Membership tier comparison cards, Public shop preview, Trial booking form, Enquiry contact form

## Phase 6: P2 Feature Modules, Design States & Polish [PENDING]
- [ ] **M6 CRM Pipeline:** Drag-and-drop Kanban board (`NEW` ➔ `CONTACTED` ➔ `QUOTED` ➔ `WON` ➔ `LOST`), Lead details modal, Follow-up logger, Lead to Member conversion
- [ ] **M8 HR & Payroll:** Employee directory, shift roster schedule, leave request approval queue, payslip viewer
- [ ] **7 Design States & Micro-interactions:** Loading skeletons, empty states, human-readable error messages, toasts, Framer Motion transitions
- [ ] **20-Step Walkthrough Rehearsal:** Validate full end-to-end 20-step hackathon demo story without dead ends
