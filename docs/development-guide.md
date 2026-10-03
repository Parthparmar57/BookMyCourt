# Phase-wise Development Guide: Sports Club Management System

**Team:** 4 members, 2 Backend (BE-1, BE-2) and 2 Frontend (FE-1, FE-2)
**Timeline:** 24-hour hackathon, 7 phases
**Stack:** PostgreSQL · Prisma · Express · React · Node.js, JavaScript (ES Modules) only
**Reference files:** `techstack.md`, `folder-structure.md`, PRD

---

## 1. Team Ownership

Each person owns whole modules end to end on their side, so two people never edit the same files.

| Member | Role | Owns (modules) | Also responsible for |
|---|---|---|---|
| **BE-1** | Backend Lead | auth, users, plans, members, courts, bookings, social-play, ledger, dashboard, reports | Prisma schema, migrations, seed data, booking constraint, merging PRs to `main` |
| **BE-2** | Backend | products, inventory, shop-orders, menu, bar-tables, bar-orders, kitchen, tabs, shifts, payments, public, leads, quotations, invoices, expenses, employees, leave, payroll | Socket.IO, cron jobs, email, PDF/Excel export |
| **FE-1** | Frontend Lead | auth (login), layouts, router, Owner dashboard, members, plans, courts, bookings, social-play, leads, accounting, hr, reports | Shared UI kit (shadcn), axios + React Query setup, ProtectedRoute |
| **FE-2** | Frontend | shop, inventory, bar, kitchen, website (public), member-portal | Tailwind theme, QR scanner, Razorpay checkout, responsive tablet/mobile views |

**Pairs that talk the most:**

| Pair | Shared work |
|---|---|
| BE-1 ↔ FE-1 | Members, bookings, dashboard |
| BE-2 ↔ FE-2 | Shop, bar, kitchen, website |
| BE-1 ↔ BE-2 | Prisma schema (BE-1 owns the file, BE-2 sends model changes) |
| FE-1 ↔ FE-2 | Shared components, layouts, auth store |

---

## 2. Phase Overview

| Phase | Hours | Goal | Checkpoint at end |
|---|---|---|---|
| 0. Setup | 0–2 | Repo, tools, schema plan, API contract | Everyone runs the app locally |
| 1. Foundation | 2–5 | Auth, roles, DB schema, layouts | Login works for all 7 roles |
| 2. Core (P0) | 5–10 | Members + court booking | Book a court end to end, double booking blocked |
| 3. Operations (P1) | 10–15 | Shop, bar, kitchen | Bar order appears live on kitchen screen |
| 4. Public + Money (P1) | 15–19 | Website, leads, ledger, owner dashboard | Dashboard shows revenue from all sources |
| 5. Extras (P2) | 19–21 | Invoices, HR, payroll, reports, exports | P2 features working or cut |
| 6. Polish + Demo | 21–24 | Bug fixes, UI, seed data, rehearsal | Full demo runs twice without errors |

---

## 3. Phase 0: Setup (Hours 0–2)

**Goal:** everyone can run the project and agrees on the data model and API shape before writing features.

| Member | Tasks |
|---|---|
| **BE-1** | Create monorepo (root, `server/`, `client/`, `packages/shared/`) with npm workspaces and `"type": "module"`; `docker-compose.yml` for PostgreSQL; `prisma init`; push repo to GitHub |
| **BE-2** | Set up Express skeleton: `app.js`, `server.js`, `config/env.js`, `lib/prisma.js`, middleware (`validate`, `errorHandler`, `notFound`), utils (`ApiError`, `asyncHandler`); install backend libraries |
| **FE-1** | Create Vite React app in `client/`; install Tailwind, shadcn/ui, React Router, TanStack Query, Zustand, Axios, React Hook Form, Zod; set up `shared/lib/axios.js` and `queryClient.js` |
| **FE-2** | Set up `packages/shared` (`@club/shared`) with `constants/roles.js`, `constants/enums.js`, `constants/booking.js`; Tailwind theme (colours, fonts); install qrcode.react, html5-qrcode, recharts, date-fns, sonner |
| **All (30 min together)** | Agree on Prisma models list, API route names (section 10), response format, branch rules |

**Done when:** `npm run dev` starts both apps on every laptop and the DB container runs.

---

## 4. Phase 1: Foundation (Hours 2–5)

**Goal:** database schema exists, login works, and each role lands on its own layout.

| Member | Tasks |
|---|---|
| **BE-1** | Write full `schema.prisma` (User, Plan, Member, Court, Booking, SocialParticipant, Product, Order, OrderItem, MenuItem, BarTable, Transaction, Invoice, Lead, Employee, Shift, LeaveRequest); run first migration; add booking `no_overlap` raw SQL migration; write `seed.js` (3 plans, 4 courts, 1 user per role, 10 members) |
| **BE-2** | Build `auth` module: login, refresh, logout, me; bcrypt + JWT; `auth.js` and `authorize.js` middleware; rate limit on login; `users` module (Owner creates staff) |
| **FE-1** | `app/router.jsx` with route groups per role; `ProtectedRoute.jsx`; `authStore.js` (Zustand); Login page; axios interceptor for token refresh; redirect each role to its home page |
| **FE-2** | All 5 layouts (`OwnerLayout`, `StaffLayout`, `KitchenLayout`, `MemberLayout`, `PublicLayout`) with sidebar showing only allowed menu items; shared components (`DataTable`, `FormField`, `StatCard`, `Loader`, `QrScanner`) |

**Done when:** you can log in as each of the 6 login roles (Visitor needs none) and see the correct layout and menu.

---

## 5. Phase 2: Core Features, P0 (Hours 5–10)

**Goal:** the showpiece works: members and court booking with all business rules.

| Member | Tasks |
|---|---|
| **BE-1** | `plans` CRUD; `members` module (register with Junior age check, search by name/phone/ID/QR, profile with history, renew); generate member QR; `courts` CRUD; `bookings` module (availability by date, create with 2-per-day limit, plan pricing via `utils/pricing.js`, cancel, catch `no_overlap` → 409); `social-play` (create Friday session, join, leave, max players) |
| **BE-2** | `products` and `inventory` modules (product CRUD, stock in, low-stock list); `menu` and `bar-tables` CRUD; Socket.IO setup in `lib/socket.js`; `membershipExpiry.job.js` (auto-expire + reminder email) |
| **FE-1** | Members pages (list with search, register form with Zod validation, profile with history tabs, renew dialog, member card with QR); Plans and Courts setup pages; **Availability grid** (30-minute slots, colour-coded); Booking form; cancel dialog; Social play page |
| **FE-2** | Start shop: product list, product form with image upload, stock-in form, low-stock badge; Bar table layout screen (static data until API is ready) |

**Done when (demo test):**
1. Register a Gold member and see the QR card.
2. Book Court 1 at 6:00 pm at Gold price.
3. Try Court 1 at 6:30 pm and see "Court already booked".
4. Book a third session for the same member that day and see "Member already has 2 bookings today".

---

## 6. Phase 3: Operations, P1 (Hours 10–15)

**Goal:** shop and bar run fully digitally, with the kitchen screen updating live.

| Member | Tasks |
|---|---|
| **BE-1** | `ledger` module: one `recordTransaction()` service that every sale calls (source, amount, tax, payment mode); connect bookings and membership payments to ledger; help BE-2 with transactions if needed |
| **BE-2** | `shop-orders` (counter sale + online order, pickup/delivery, stock decrement inside a Prisma transaction, block out-of-stock, auto member discount, status updates); `bar-orders` (create order on table, add items, emit `order:new` to kitchen); `kitchen` (list queue, update status, emit `order:updated`); `tabs` (open, add, settle); `shifts` (open, close, cash totals); `payments` (Razorpay order + signature verify); `lowStock.job.js` |
| **FE-1** | Member profile: show purchases and bar tabs from new APIs; booking payment step; integrate any booking fixes from testing |
| **FE-2** | **Shop POS** (scan QR, add items, auto discount, pay); online order flow in member portal (cart, pickup/delivery, Razorpay); order tracking; **Bar POS** (tables, order screen, add items, bill, split, pay by cash/card/UPI); member tab screen; shift open/close; **Kitchen board** (live columns New / Preparing / Served via socket) |

**Done when (demo test):**
1. Scan a member card at the shop and sell a racket string with discount; stock drops by 1.
2. Place a bar order on Table 3; it appears on the kitchen screen without refresh.
3. Kitchen marks it Served; member settles the tab by UPI.

---

## 7. Phase 4: Public Website + Money, P1 (Hours 15–19)

**Goal:** a stranger can find and contact the club, and the owner sees all money in one place.

| Member | Tasks |
|---|---|
| **BE-1** | `dashboard` module: revenue today/week/month by source (court, shop, bar, membership) and by payment mode; court utilisation %; membership stats (active, expiring, new); bar daily closing report endpoint |
| **BE-2** | `public` module (plans, weekly availability, product catalogue, trial booking, enquiry with rate limit + honeypot); `leads` (auto-create from enquiry/trial, pipeline stages, follow-ups); `quotations` (create, PDF via pdfkit, email via nodemailer, convert to member) |
| **FE-1** | **Owner dashboard** (KPI cards, revenue by source chart, payment mode chart, period switcher, utilisation chart, expiring members list); Leads pipeline board (drag between stages), lead detail, quotation form |
| **FE-2** | **Public website** (Home, About, Plans and Prices, This Week's Availability, Shop catalogue, Trial booking form, Contact/Enquiry form), mobile responsive; Member portal pages (My bookings, My orders, My tab, My card, Renew) |

**Done when (demo test):**
1. Visitor submits an enquiry on the website; it appears as a New lead.
2. Owner dashboard shows today's revenue including the booking, shop sale and bar bill from earlier phases.

---

## 8. Phase 5: Extras, P2 (Hours 19–21)

**Goal:** add P2 features only if Phases 2–4 are stable. If not, skip this phase and fix bugs instead.

| Member | Tasks |
|---|---|
| **BE-1** | `reports` module: Excel export (exceljs) and PDF for revenue, inventory, membership; tax (GST) summary by category |
| **BE-2** | `invoices` (membership + business client, PDF), `expenses`, `employees`, `leave` (request + approve + balance), simple `payroll` with payslip PDF |
| **FE-1** | Accounting pages (ledger table with filters, invoices, expenses, tax report); HR pages (employees, leave approvals, payroll run); export buttons |
| **FE-2** | Staff "Request leave" page in StaffLayout; mobile and tablet fixes for bar, kitchen and member portal |

**Cut list if behind (drop in this order):** payroll → expenses → tax report → quotations PDF → social play.

---

## 9. Phase 6: Polish + Demo (Hours 21–24)

| Member | Hours 21–23 | Hours 23–24 |
|---|---|---|
| **BE-1** | Final seed data that tells the demo story (realistic names, a week of bookings and sales); fix API bugs; deploy backend + DB | Run demo as Owner |
| **BE-2** | Fix bugs; check every endpoint has validation and role guard; deploy check (env vars, CORS) | Backup laptop with local copy running |
| **FE-1** | UI polish (empty states, loaders, error toasts); deploy frontend; test all role logins | Present the pitch script |
| **FE-2** | UI polish on website, bar, kitchen; test on phone and tablet sizes | Drive the live demo |

**Demo order (matches the PS):** new member → court booking (show double booking blocked) → shop sale → bar order → kitchen screen → website enquiry → Owner dashboard.

---

## 10. API Contract Rules (agree in Phase 0)

| Rule | Value |
|---|---|
| Base URL | `/api` |
| Route names | Plural, kebab-case: `/api/members`, `/api/shop-orders` |
| Success response | `{ "data": ... }` |
| Error response | `{ "message": "...", "errors": { "field": ["msg"] } }` |
| Status codes | 200 OK, 201 Created, 400 validation, 401 not logged in, 403 wrong role, 404 not found, 409 conflict (double booking), 422 business rule |
| Auth header | `Authorization: Bearer <accessToken>` |
| Dates | ISO strings in UTC |
| Money | Number in rupees with 2 decimals |
| Validation | Zod schemas in `@club/shared`, used by both sides |

**Frontend unblock rule:** if an API is not ready, FE builds the screen with mock data in the module's `api/` file shaped exactly like the contract, then swaps to the real call.

---

## 11. Git Workflow

| Item | Rule |
|---|---|
| Main branch | `main` always runs; only BE-1 merges |
| Branch names | `be1/bookings`, `be2/bar-orders`, `fe1/dashboard`, `fe2/kitchen` |
| Commit style | `feat(bookings): add overlap check`, `fix(bar): split bill total` |
| Merge frequency | At least once per phase; pull `main` before starting a new module |
| Schema changes | Only BE-1 edits `schema.prisma`; others request changes in chat |
| Shared package | Announce in chat before changing `@club/shared` |
| Secrets | `.env` never committed; keep `.env.example` updated |

---

## 12. Sync Points

| Time | Meeting (10 min max) | Agenda |
|---|---|---|
| Hour 2 | Phase 0 close | Schema and API contract final |
| Hour 5 | Phase 1 close | All logins working? Merge to main |
| Hour 10 | Phase 2 close | Booking demo test; decide if on track |
| Hour 15 | Phase 3 close | Shop/bar/kitchen demo test; merge |
| Hour 19 | Phase 4 close | Go / no-go for P2; freeze new features at hour 21 |
| Hour 21 | Feature freeze | Only bug fixes and polish from now |
| Hour 23 | Demo rehearsal | Full run-through, time it |

---

## 13. Definition of Done (every feature)

- [ ] API has Zod validation and role guard
- [ ] Service enforces business rules, not the controller
- [ ] Sale or payment writes to the ledger
- [ ] Frontend form shows validation errors from Zod
- [ ] Loading and error states shown
- [ ] Works with seed data
- [ ] Merged to `main` and tested once by someone else

---

## 14. Risks and Fallbacks

| Risk | Fallback |
|---|---|
| Exclusion constraint migration fails | Keep the overlap check in `booking.service.js` inside a transaction; mention DB constraint as design |
| Socket.IO issues | Kitchen screen polls every 5 seconds with React Query `refetchInterval` |
| Razorpay test mode problems | Mark payment as paid manually with mode "Online (test)" |
| Email not sending | Log emails to console and show "Reminder sent" in UI |
| Deployment fails | Demo on localhost; keep a screen recording as backup |
| Behind schedule at hour 15 | Skip Phase 5 entirely; spend hours 19–24 on stability and polish |

---

## 15. Breaks

Take a 20-minute food break at hours 6, 12 and 18, staggered so one BE and one FE are always working. Each person should try to rest 1–2 hours between hours 12 and 18 if the team is on track.
