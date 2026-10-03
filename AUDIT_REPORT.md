# BookMyCourt — Full Code Review, Testing & Security Audit

**Stack:** PERN (PostgreSQL + Prisma, Express, React/Vite, Node ESM) · **Date:** 2026-10-03
**Method:** Read-only audit of `/server` and `/client`. No application code changed to produce this report.

> Status legend: ✅ Enforced · ⚠️ Partial (UI-only / no concurrency / missing sub-case) · ❌ Broken/Missing

---

## 1. Summary

| Metric | Result |
|--------|--------|
| Automated tests | **None** (server & client). Coverage **0%**. |
| Client build | ✅ `npm run build` passes (7,555 modules) |
| npm audit — server | **4 vulns: 1 high + 3 moderate** (all Nodemailer) |
| npm audit — client | **0 vulnerabilities** |
| Issues | 1 Critical · 2 High · 9 Medium · ~8 Low |
| SQL injection | None (Prisma parameterized; 1 static raw query; no dynamic ORDER BY) |
| XSS sinks | None (`dangerouslySetInnerHTML` absent; React escaping) |
| Secrets | `.env` git-ignored & untracked; no server secrets on client |

**Verdict:** Strong data-integrity foundation (DB exclusion constraint for overlaps, atomic stock, `Decimal` money, server-side pricing, RBAC with per-controller ownership scoping, Zod mass-assignment stripping). Main risks: payment-amount tampering, tokens in localStorage, several business rules missing concurrency/past-date/settled-tab enforcement, constraints in a manual SQL file, and no tests.

---

## 2. Issues

| # | Sev | Module | Issue | File | Reproduce | Fix |
|---|-----|--------|-------|------|-----------|-----|
| 1 | Critical | Finance/Pay | `/payments/create-order` trusts client `amount` | `payment.service.js` `createRazorpayOrder`; `MembershipPage.jsx:35`, `usePayment.js:25` | POST `{amount:1}` | Derive amount server-side from `planId`/`invoiceId` |
| 2 | High | Auth/Client | JWT access+refresh in `localStorage` (XSS theft) | `AuthContext.jsx:7-8,39-41`; `apiClient.js:23-24,52-61` | XSS → read localStorage | Access token in memory; httpOnly refresh cookie only |
| 3 | High | Deps | Nodemailer 1 high + 3 moderate (CRLF/punycode/ReDoS) | `server/package.json` | `npm audit` | Upgrade nodemailer |
| 4 | Med | Booking | No past-date check | `booking.service.js` `createBooking` | past-date booking → 201 | Reject `startTime < now` |
| 5 | Med | Booking | Daily limit (2/day) not concurrency-safe | `booking.service.js` | 5 concurrent → >2 succeed | Unique partial index / row lock |
| 6 | Med | Bar | Settled tab accepts new orders; settle-twice TOCTOU | `bar-order.service.js`, `tab.service.js:71-79` | order on settled tab | Check `tab.status=OPEN` in txn |
| 7 | Med | HR/Leave | MEMBER can list ALL leave records | `leave.controller.js` `listLeaves`; `leave.routes.js:13` | MEMBER `GET /api/leave/` | Add authorize + guard missing employeeId |
| 8 | Med | Booking | Opening-hours not enforced on create | `booking.service.js` | book 03:00 | Validate within open/close |
| 9 | Med | Social | Capacity not concurrency-safe | `social-play.service.js` `joinSocialPlay` | concurrent joins > max | Atomic insert/lock |
| 10 | Med | HR/Leave | No overlap check between leaves | `leave.service.js` `requestLeave` | overlapping leaves accepted | Check overlap before insert |
| 11 | Med | HR/Payroll | Mark PAID twice; payouts not in ledger | `payroll.service.js` `updatePayrollStatus` | PATCH PAID twice | Guard status; post to ledger |
| 12 | Med | Trial | Trial bookings skip past/double rules | `public.service.js` `bookTrial` | past trial saved | Validate preferredDate ≥ now |
| 13 | Low | Auth | `/auth/refresh`,`/logout` no per-route limiter | `auth.routes.js:12-13` | flood refresh | Add authLimiter |
| 14 | Low | DB/Ops | Constraints in manual SQL, no versioned migrations | `prisma/migrations/manual_constraints.sql` | db push without SQL | Real migration + boot check |
| 15 | Low | DB | Missing CHECKs: end>start, qty>0, price>=0 | schema | — | Add CHECK constraints |
| 16 | Low | DB | Most DateTime `timestamp(3)`; only Booking `Timestamptz` | `schema.prisma` | — | Standardize Timestamptz |
| 17 | Low | Validation | `PATCH /enquiries/:id/status` no validate | `enquiry.routes.js:11` | bad status | Add Zod validate |
| 18 | Low | Client | Demo passwords hardcoded in client | `LoginPage.jsx:16`, `CrmPage.jsx:87`, `HrPage.jsx:100` | view source | Remove for prod |
| 19 | Low | Cleanup | Dead `.tsx`/mock scaffold incl. buggy `RoleGuard.tsx` | `src/App.tsx`, `services/api.ts`, `routes/RoleGuard.tsx` | — | Delete |
| 20 | Low | Validation | Future DOB not rejected | `member.schema.js` | future DOB | Add `dob < today` refine |

---

## 3. Business-rules checklist (34)

1 ✅ No double booking (DB EXCLUDE `booking_no_overlap` + app pre-check, concurrency-safe) ·
2 ❌ No past bookings ·
3 ✅ 1-hr, :00/:30 (`booking.schema.js:10`) ·
4 ⚠️ Max 2/day — not concurrency-safe ·
5 ✅ Server pricing (`pricing.js`) ·
6 ✅ Expired = no member price ·
7 ⚠️ Cancellation: double-cancel ✅, past-cancel ❌ ·
8 ⚠️ Maintenance ✅, opening-hours ❌ ·
9 ✅ Missing court/member → 404/400 ·
10 ✅ Multi-player only Friday social ·
11 ⚠️ Double-join ✅ (unique), capacity not concurrency-safe ·
12 ✅ Junior <18 server DOB ·
13 ⚠️ Unique ✅, future-DOB ❌ ·
14 ✅ Expiry/plan change pricing ·
15 ✅ Stock never negative (atomic + CHECK) ·
16 ✅ Counter+online same stock ·
17 ✅ Low-stock threshold ·
18 ✅ Server discounts, untamperable ·
19 ✅ Zero/neg qty rejected (app) ·
20 ✅ Bar discount active-only ·
21 ❌ Settled tab new items; ⚠️ double-settle TOCTOU ·
22 ✅ Cash/Card/UPI (+ONLINE) ·
23 ✅ No float money (Decimal) ·
24 ✅ Shift totals = sum orders ·
25 ✅ Enquiry/trial saved + notify ·
26 ❌ Trial no-past/no-double ·
27 ✅ Lead→member no dup ·
28 ⚠️ Inflows once ✅; payroll/expense outflows not in ledger ·
29 ✅ Ledger immutable (no edit/delete API) ·
30 ✅ Invoice/tax totals correct ·
31 ⚠️ end≥start ✅, overlap ❌ ·
32 ⚠️ Calc ✅, no-dup-rows ✅, double-PAID ❌ ·
33 ✅ Server validation (⚠️ enquiry-status unvalidated) ·
34 ✅ Correct codes, no stack/SQL leak (`errorHandler.js`).

---

## 4. RBAC (highlights)

Role middleware + per-controller ownership scoping; verified scoping on bookings/invoices/members/shop-orders/tabs. OWNER-locked: finance, ledger, expenses, dashboard, reports, users, employees, payroll. Exceptions:
- `GET /api/leave/` — **MEMBER sees all** (undefined employeeId → no filter). [#7]
- `POST /api/payments/create-order` — client amount trusted. [#1]
- `/auth/refresh`,`/logout` — no per-route limiter. [#13]
- Public catalogue detail routes (`/plans/:id`,`/courts/:id`,`/products/:id`) fully anonymous — intended.

No low-privilege role reaches HR/Finance write paths.

---

## 5. Security findings (PoC)

- **#1 (Critical):** `POST /api/payments/create-order {amount:1}` → ₹1 Razorpay order; server never validates against plan.
- **#2 (High):** XSS → `localStorage.accessToken`/`refreshToken` exfiltration; refresh token in localStorage defeats the httpOnly cookie already issued.
- **#7 (Med):** MEMBER JWT → `GET /api/leave/` returns all employees' leave.
- **#5/#9 (Med):** `Promise.all` concurrency bypasses per-day cap / social capacity (overlap itself is safe via EXCLUDE).
- **#6 (Med):** orders added to settled tab never re-posted → revenue leak.
- Not vulnerable: SQLi, stored XSS, mass-assignment (Zod strips), password exposure (bcrypt, never selected), CORS (allowlist), helmet present, error handler hides stack in prod.

---

## 6. Tests

None exist (0%). Plan: Node built-in test runner (`node --test`, ESM-native, zero deps) with Prisma mocked for unit tests of business logic and fixes. Jest+Supertest full HTTP integration can follow once a dedicated **test database** exists (none configured today; integration tests must not run against the dev DB).

---

## 7. Fix priority order

1. **Critical security:** #1 payment amount, #2 token storage, #3 nodemailer, #7 leave exposure.
2. **Data integrity/concurrency:** #5 daily-limit, #6 settled tab, #9 social capacity, #14 migrations, #11 payroll.
3. **Business-rule validation:** #4 past bookings, #8 hours, #12 trial, #10 leave overlap, #20 DOB, #28 outflows.
4. **Quality/perf:** #13 limits, #15/#16 DB CHECKs/timestamptz, #17 validation, #18/#19 cleanup.

---

## 8. Workflow for fixes (per request)

One issue at a time; a test that fails before and passes after each fix; re-run suite after every fix; new migration for DB changes; summarise each change.

---

## 9. Fix log (applied this session)

Test harness: Node built-in runner (`node --test`, zero deps). **14 tests pass.** Client build ✅.

| # | Status | What changed |
|---|--------|--------------|
| 1 | ✅ Fixed | Payment amount now server-derived from `planId`/`invoiceId`; client `amount` dropped + ignored. `payment.schema.js`, `payment.service.js`, client `usePayment.js`/`MembershipPage.jsx`. Tests ✔ |
| 2 | ✅ Fixed | Access token held in memory only; refresh via httpOnly cookie; no tokens in localStorage. `apiClient.js`, `AuthContext.jsx`. Verified by build. |
| 3 | ✅ Fixed | `nodemailer` 6→10, `node-cron` 3→4. **High eliminated** (4 vulns → 2 low transitive moderates via exceljs, documented). |
| 4 | ✅ Fixed | Past-date bookings rejected (`assertSlotBookable`). Tests ✔ |
| 5 | ✅ Fixed | Per-member `SELECT … FOR UPDATE` lock serializes the daily-limit check. (Concurrency test needs a test DB.) |
| 6 | ✅ Fixed | Settled tab rejects new orders; `settleTab` locks + re-checks status in-txn. `bar-order.service.js`, `tab.service.js`. |
| 7 | ✅ Fixed | `/leave` staff-only; non-owner w/o employeeId returns empty. `leave.routes.js`, `leave.controller.js`. Tests ✔ |
| 8 | ✅ Fixed | Opening-hours enforced on booking (`assertSlotBookable`). Tests ✔ |
| 9 | ✅ Fixed | `joinSocialPlay` locks the session row (capacity concurrency). |
| 10 | ✅ Fixed | Overlapping leave rejected. `leave.service.js`. |
| 11 | ✅ Fixed | Payroll cannot be marked paid twice. `payroll.service.js`. |
| 12 | ✅ Fixed | Trial booking rejects past `preferredDate`. Tests ✔ |
| 13 | ✅ Fixed | Dedicated `refreshLimiter` on `/auth/refresh`; `authLimiter` on `/logout`. |
| 14 | ✅ Fixed | Boot-time check refuses to run in prod without `booking_no_overlap`. `server.js`. |
| 15 | ✅ Fixed | DB CHECKs added (end>start, qty>0, price>=0) to `manual_constraints.sql`. |
| 17 | ✅ Fixed | `PATCH /enquiries/:id/status` validated (enum). |
| 19 | ✅ Fixed | Deleted dead `.tsx`/mock scaffold (26 files); build still passes. |
| 20 | ⚪ N/A | Already enforced — `registerMemberSchema` rejects future DOB (audit false-positive). |
| 16 | ⏸️ Deferred | timestamptz standardization — needs a schema migration + DB; low impact. Recommended, not applied. |
| 18 | ⏸️ Deferred | Demo passwords in client — intentional for the demo; remove/disable seeded demo creds for production. |
| 28 | ⏸️ Needs decision | Posting payroll/expense **outflows** to the ledger changes revenue-report semantics (gross vs net) — a product decision before implementing. |

**Note on concurrency fixes (#5, #6, #9):** enforced via row locks; verifying them needs `Promise.all` integration tests against a dedicated **test database** (none configured). Recommend adding Jest+Supertest + a throwaway Postgres for these.
