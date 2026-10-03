# Champions Club — Full-Stack Feature Status

**Requirements:** `docs/Sports_Club_Management_System.pdf` (Odoo challenge brief)
**Scope reviewed:** `server/` (Express + Prisma) **and** `client/` (React 19 + Vite, the live `.jsx` app)
**Date:** 2026-10-03

> Legend: ✅ Done · 🟡 Partial · 🔴 Missing/Broken · 🛠️ Fixed this session · ➕ Extra

---

## 1. Verdict

The **backend is ~feature-complete** — every PDF scenario has working endpoints, business rules, a unified transaction ledger, and reports. The client's API/hook layer calls nearly every endpoint. **Most remaining gaps are in the frontend UI**: some features are unwired to any page, some are half-built.

| Layer | State |
|-------|-------|
| Backend (`server/`) | ✅ Complete (one gap: shift rostering) |
| Client API/hooks (`src/services`, `src/hooks`) | ✅ Near-complete endpoint coverage |
| Client pages/UI (`src/modules/*/pages`) | 🟡 Several gaps — see §3 |

---

## 2. Fully working (end-to-end)

Public site (home / availability / membership / trial / login / register), court bookings (walk-in, member, social play, realtime, cancel), members directory + 360° profile + QR card, bar POS (orders / tabs / table tracking / settle / member discount), kitchen display (KDS), owner dashboard (KPIs, revenue-by-source, utilisation), CRM pipeline (leads, follow-ups, enquiries, convert), finance (invoicing + per-invoice PDF, ledger, expenses), HR (employees, leave approval, payroll run), Razorpay checkout.

---

## 3. What's missing / broken

### 🛠️ Fixed this session

| # | Item | What was done |
|---|------|---------------|
| 1 | **Shop online ordering** — core PDF scenario ("order from home, collect or deliver"). | Built cart + checkout on `ShopPage` for signed-in users: add-to-cart, quantity controls, pickup/delivery selector with address + 6-digit PIN validation, payment-mode choice, and `useCreateShopOrder` submission with a success state. |
| 2 | **`ShopInventoryPage` crashed at render** (undefined hooks + half-wired product modal). | Fixed imports, corrected `stockForm`/`stockError` state, and fully wired Add / Edit / Delete product + Stock-In + CSV export. |

### 🔴 Critical — still open

| # | Gap | Evidence | Backend ready? |
|---|-----|----------|----------------|
| 3 | **QR-scan member lookup not wired** — scannable card exists, but no camera/scanner UI at desk/POS; lookup is text-search only. Needs a scanner lib (e.g. `html5-qrcode`). | `POST /members/scan` unused by client | ✅ `scanMember` |

### 🟡 Partial — backend done, UI incomplete

| # | Gap | Evidence |
|---|-----|----------|
| 4 | **Quotations ("send a quote")** — `useCreateQuotation` imported but never called; "QUOTED" is just a kanban column, no quote builder. | `modules/crm/pages/CrmPage.jsx:8` |
| 5 | **Attendance UI** — check-in/out exists in backend, no UI. | `HrPage.jsx` (text only) |
| 6 | **Report exports ("share the numbers")** — no revenue-report view and no Excel/PDF report export wired (only per-invoice PDF). | `/reports/revenue`, `*/export`, `*/pdf` unused |
| 7 | **Bar shift reconciliation** — open/close-shift + shift-report hooks exist, no page uses them. Split-bill not built. | `hooks/useBar.js` (unused shift hooks) |
| 8 | **Member self-settle tab** — `MemberTabPage` is read-only; settling is staff-only via bar POS. | `modules/members/pages/MemberTabPage.jsx` |

### ⚪ Backend gap + cleanliness

| # | Item | Notes |
|---|------|-------|
| 9 | **Staff shift scheduling/rostering** | Absent on **both** ends — only cash-shift open/close. PDF mentions front desk handling "staff schedules." |
| 10 | **Dead duplicate codebase** | Unused `.tsx` + mock scaffold: `App.tsx`, `main.tsx`, `services/api.ts`, `data/mockData.ts`, `context/AuthContext.tsx`, `src/pages/**`, `routes/RoleGuard.tsx`. Should be deleted. |
| 11 | **HomePage availability grid is hardcoded** | Renders fake Booked/Free cells, ignores the live query it already fetches. |
| 12 | **No automated tests** | Not required by the brief, but recommended given the money/ledger logic. |

---

## 4. Extra features (➕ beyond the brief)

Razorpay (verified + idempotent), audit trail, JWT + refresh tokens + RBAC (6 roles), real-time sockets, pro-rated membership upgrades, split-payment support (backend), refund ledger reversals, expense/receivables tracking, attendance (backend), inventory audit log, security hardening (Helmet, CORS allowlist, rate limiting, env validation, graceful shutdown).

---

## 5. Suggested next steps

1. ~~Fix `ShopInventoryPage` crash~~ ✅ done.
2. ~~Build shop online-ordering flow~~ ✅ done.
3. **Wire QR-scan lookup** (#3) — add a scanner library + camera modal.
4. 🟡 partials: quotations (#4), report exports (#6), attendance (#5), shift UI (#7).
5. Cleanup: delete dead `.tsx` scaffold (#10), make HomePage grid live (#11).
