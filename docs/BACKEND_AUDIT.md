# Production Readiness & Requirements Audit — Champions Club Backend

**Date:** 2026-10-03
**Scope:** `backend/` — Express + Prisma (PostgreSQL), ~140 files, 9 modules.
**Checked against:** `docs/PRD Sports Club Management System.md`

## Verdict

The backend is broad and the architecture is clean (modular structure, Prisma singleton,
bcrypt hashing, Zod validation, transactions used in many places). **However it is not
production-ready.** There are multiple critical security and financial-integrity bugs, and the
two headline guarantees of the PRD — **G1 "zero double bookings"** and a **100% accurate
ledger** — are not actually enforced. Several P0/P1 rules and most P2 requirements are missing
or broken.

---

## 🔴 CRITICAL — fix before any deployment

### Security / Auth

1. **Hardcoded JWT secrets as defaults** — `src/config/env.js:8-9`. Both `JWT_ACCESS_SECRET`
   and `JWT_REFRESH_SECRET` fall back to fixed strings that are *also committed in
   `.env.example`*. Because every env var has a `.default()`, validation **never fails**
   (`env.js:20-24` is dead code in prod). If secrets aren't set, the app signs tokens with a
   public, repo-known key → **anyone can forge an OWNER token**. Require secrets with no
   default; fail-fast in production.

2. **Privilege escalation via public registration** — `src/shared/schemas/auth.schema.js:14` +
   `auth.service.js`. The register schema accepts `role` from the body and passes it to
   `prisma.user.create`. `/api/auth/register` is public → anyone can POST `{"role":"OWNER"}`
   and self-create an admin. Strip `role` server-side (force `MEMBER`).

3. **CORS reflects every origin with credentials** — `src/config/cors.js`. Origin callback
   returns `true` for all origins while `credentials: true`. Combined with the httpOnly refresh
   cookie, this is an open CSRF surface. Lock to a `CLIENT_URL` allowlist.

4. **Mass-assignment on user update** — `user.routes.js:16` has no `validate()`, and
   `user.service.js` does `{ ...data }` into `prisma.user.update`. Caller can set `role`,
   `passwordHash`, etc. Add an explicit whitelist schema.

5. **IDOR on member & financial data** — `member.routes.js:32` (`GET /members/:id`),
   `invoice.routes.js:29-39` (`GET /invoices/:id`, `/pdf`, and `listInvoices` for MEMBER with no
   scoping), and `member.routes.js:34` (`renewMembership` by URL param, no ownership check). Any
   logged-in member can read anyone's profile/DOB/invoices and even renew/alter another member's
   plan. Also **booking creation** (`booking.service.js:79`) lets a MEMBER pass any `memberId` —
   no self-check.

### Money / Payments

6. **Razorpay signature bypass + client-controlled amount** — `payment.service.js:16-54`.
   Verification is skipped for any `orderId` starting with `order_mock_`; `createRazorpayOrder`
   silently falls back to a mock order on *any* exception (incl. real credential failure in
   prod); `amount` comes from the body and is never cross-checked against the Razorpay order.
   `payment.routes.js` has **no `authorize` and no `validate`**. → Any logged-in user can write
   arbitrary PAID transactions into the ledger. Pure fraud vector.

7. **Invoice double-payment / no amount guard** — `invoice.service.js:89-118`. Marks invoice
   PAID on any amount (even partial), no idempotency, no "already paid" check → calling the
   endpoint twice posts two ledger transactions and inflates revenue/tax.

### Data Integrity / Concurrency

8. **Double bookings are NOT prevented (G1 / BR2 / NFR concurrency).**
   `booking.service.js:101-113` does `findFirst` then `create` inside a default-isolation (READ
   COMMITTED) transaction, with **no DB exclusion constraint** (the `@@index` on Booking is
   non-unique). Two concurrent requests both pass the check and both insert → double booking. The
   PRD explicitly names the Postgres `EXCLUDE` constraint as the required mechanism. **This is the
   #1 product goal and it fails under concurrency.**

9. **Overlap check ignores SOCIAL bookings** — `booking.service.js:106` filters `type: NORMAL`.
   A normal booking can be created on a court already held by a social session (and vice-versa).
   The availability grid *does* show it booked, so UI and API disagree. Social-play creation
   (`social-play.service.js:32-56`) also does **no court-overlap or `isOpen` check** →
   double-books the physical court.

10. **Stock overselling (BR10)** — `shop-order.service.js:28-46`. Read-then-decrement is
    non-atomic and `Product.stock` has no CHECK ≥ 0 → concurrent orders drive stock negative. Fix
    with conditional `updateMany({ where:{ id, stock:{ gte: qty }}})` + fail on `count===0`.

11. **Duplicate `*No` generation across the whole codebase** —
    `Date.now().toString().slice(-6)` used for `transactionNo`, `orderNo`, `invoiceNo`,
    `memberNo`, `quotationNo`, `employeeNo`, etc. (booking, shop, bar, tab, member, invoice,
    expense, lead, employee, social-play). These columns are `@unique`; the last-6-digits window
    repeats every ~16 min and collides outright in the same ms → P2002 error rolls back the
    transaction = **failed checkout/booking under load**. Replace with a DB sequence / atomic
    counter / UUID suffix.

12. **Shift report & daily closing always zero** — `Order.shiftId` is in the schema but
    **never written** on order creation, so `shift.orders` is always empty → `expectedCash`, cash
    difference, and "sales by payment mode & staff" are non-functional (M4 requirement broken).

13. **Leave balance corruption** — `leave.service.js:43-73`. No guard on current status →
    re-approving decrements again; balance only checked at request time, not approval → can go
    negative; APPROVED→REJECTED never re-credits. Also `days` is taken from the request body
    (`leave.schema.js:8`), not derived from the date range → staff can take 10 days while
    decrementing 1.

---

## 🟠 HIGH

- **Cancellation is lossy** — `booking.service.js:162-186`: the `reason` param is accepted but
  **never stored** (no field in schema), there's **no refund logic** (PRD requires refund per
  policy), and the court's ledger transaction is **not reversed** → cancelled bookings keep
  inflating dashboard revenue.
- **BR3 uses a hardcoded constant** — `MAX_PER_DAY = 2` (`shared/constants/booking.js`) instead
  of the member's `plan.maxBookingsDay`. Violates "configurable without code" (NFR) and the
  per-plan field.
- **Bar ledger double-posting** — `bar-order.service.js`: an order with both `barTabId` and
  `paymentMode` posts to the ledger immediately *and* adds to the tab total, which is posted again
  on `settleTab`. `settleBarOrder` has no "already settled" guard. Split-bill totals aren't
  validated to sum to `order.total`.
- **"Won → convert lead to Member" not implemented** — `lead.service.js:91-113` sets stage WON
  but never creates a User/Member. Core CRM outcome missing.
- **Social-play capacity & duplicate-join race** — `social-play.service.js:58-111`: `maxPlayers`
  and already-joined checks are outside the transaction, no unique `(bookingId, memberId)`
  constraint → over-capacity + duplicate charges.
- **No graceful shutdown; `uncaughtException` keeps running** — `server.js:17-23`. No
  SIGTERM/SIGINT → dropped requests, leaked Prisma connections on deploy; running after an
  uncaught exception leaves undefined state.
- **Rate limiting ineffective** — `app.js` sets no `trust proxy` (so `req.ip` is the LB), and the
  limiter is only on two public CRM routes; login and the rest of `/api` are unprotected against
  brute force.

---

## 🟡 MEDIUM

- **Tax charged on pre-discount amount** — shop & bar order services compute line tax on gross
  subtotal, then subtract discount → discounted members are over-taxed (wrong under GST, should
  tax `subtotal − discount`). Tab settlement also posts `tax: 0`, understating GST in the ledger.
- **Float money math** — invoice line/total math in JS `Number` with no 2-dp rounding before
  `Decimal(10,2)` → paisa drift, line sums ≠ invoice total.
- **Court utilization is wrong** — `dashboard.service.js:122-134` counts booking *rows* as
  "hours" and hard-codes a 17-slot denominator, ignoring each court's open/close hours.
- **Timezone drift** — `Transaction/Invoice/Expense.date` are plain `DateTime` (no tz) while
  `Booking.startTime` is `Timestamptz`; all day/week/month filters and the expiry cron use
  server-local time with no IST/timezone set → "today's revenue" and expiry day shift with server
  TZ.
- **Pro-rated upgrade missing** — `renewMembership` always charges full plan price and adds full
  duration regardless of mid-cycle upgrade.
- **`freeSessions` benefit never applied** in `pricing.js`.
- **Open-tab / open-shift not atomic** — `findFirst`+`create` with no unique constraint →
  duplicate open tabs per member.
- Refresh tokens can't be revoked (stateless, no rotation/store); `/auth/refresh` has no CSRF
  defense. Upload validation trusts client MIME/extension and serves files from the API origin.
  `uploads/` dir doesn't exist → `express.static` + multer writes will fail.

---

## 🟢 LOW (selected)

Weak password policy (min 6); `console.error` in `qr.js`/`pdf.js` instead of pino; `mailer.js`
swallows send failures; `deleteUser` can delete the last OWNER; order/kitchen status transitions
have no state machine; `deleteCourt`/`deletePlan` count historical rows; sockets have no auth (any
client can join the `kitchen` room); cron jobs run per-process (no leader election for horizontal
scaling); seed re-inserts menu items each run (no unique constraint).

---

## Requirements Coverage vs PRD

| Priority | Module | Status | Gaps |
|---|---|---|---|
| **P0** | M1 Membership | 🟡 Mostly done | Pro-rated upgrade **missing**; 15/7/1-day reminders **missing**; QR not a search field; profile history capped at 10; BR6/BR8/expiry-status ✅ |
| **P0** | M2 Court Booking | 🔴 Core rules broken | BR2 overlap not concurrency-safe & ignores social; BR3 hardcoded not per-plan; cancel reason/refund/ledger-reversal missing; social-play no court-overlap check |
| **P0** | M7/M9 Ledger + Dashboard | 🟡 Partial | Revenue/payment-split ✅; court utilization buggy; **receivables missing**; double-posting & cancellation inflate totals; export mostly missing |
| **P1** | M3 Gear Shop | 🟡 Partial | Catalog/stock-in ✅; **oversell race (BR10)**; order-status transitions unguarded; per-member notifications missing |
| **P1** | M4 Bar POS | 🔴 Partial/broken | Orders/kitchen/tabs ✅; **shift & daily-closing broken (shiftId)**; split-bill unvalidated; **BR12 not enforced**; double-posting |
| **P1** | M5 Public Website | 🔴 Partial | Enquiry+trial create leads ✅ (atomic); **plans/prices, live availability, shop endpoints absent**; "notify staff" missing; trial doesn't create a real court Booking |
| **P2** | M6 CRM | 🟡 Partial | Leads/pipeline/quotation ✅; **Won→Member missing**; quotation PDF missing; follow-up reminders missing |
| **P2** | M7 Invoicing/Tax | 🟡 Partial | Membership/business invoices ✅; **payment unsafe**; tax report has no PDF/Excel export; no CGST/SGST split |
| **P2** | M8 HR/Payroll | 🟡 Partial | Employee/attendance/leave/payroll exist; **leave balance corruptible**; attendance doesn't feed payroll; allowances/deductions stubbed to 0; no payslip PDF; no shift roster |

**Cross-cutting NFRs:** Role-based access ⚠️ (gaps above) · hashed passwords ✅ ·
**Email/SMS notifications: `mailer.js` exists but is called nowhere — effectively missing** ·
**Audit log: missing** (only `Booking.createdById`) ·
**PDF/Excel export: only invoice PDF + inventory Excel exist** ·
Concurrency guarantee: **not met**.

---

## Recommended fix order

1. **Secrets & auth** (1–5): require JWT secrets/fail-fast, strip `role` from register, lock
   CORS, whitelist user-update, close IDOR + add `authorize` to payments/invoices/members.
2. **Payments** (6,7): always verify Razorpay signature, verify amount against the order, remove
   mock fallback, make invoice payment idempotent + amount-guarded.
3. **Double booking & overselling** (8,9,10): add a Postgres `EXCLUDE USING gist` constraint on
   `(courtId, tstzrange(startTime,endTime))` for non-cancelled bookings; include social in
   overlap; atomic conditional stock decrement + `stock >= 0` CHECK.
4. **Number generation** (11): replace every `Date.now().slice()` with sequences/counters.
5. **Ledger accuracy** (12, bar double-post, cancellation reversal, tax-on-discount): so the
   dashboard is trustworthy.
6. **Leave/HR integrity** (13), then the missing P2 features (Won→member, reminders, exports,
   notifications, audit log).
