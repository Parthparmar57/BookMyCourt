# BookMyCourt — Backend API Test & Security Assessment Report

**Project:** BookMyCourt (The Champions Club Backend)
**Scope:** All REST endpoints documented in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) — functional, validation, authorization, and security testing
**Test date:** 2026-10-03
**Prepared by:** Senior API Tester · Security Engineer · Backend Developer (live black-box + white-box review)
**Build under test:** branch `server/parth` @ `2416db4`

---

## 1. Executive Summary

The backend was deployed to an **isolated test database** and every documented endpoint was exercised with a scripted harness covering happy paths, input validation, role-based access control (RBAC), and a dedicated security battery (authN/authZ, JWT integrity, injection, IDOR/BOLA, rate limiting, headers, CORS).

| Metric | Result |
|---|---|
| Total test cases executed | **156** |
| Passed | **143 (91.7%)** |
| Failed (raw) | 13 |
| Failures that are genuine defects | **5** (3 security + 1 functional + 1 reliability) |
| Failures that were correct behaviour (test-data/business-rule) | 4 |
| Failures caused by remote-DB latency only | 4 (transaction timeout) |
| Endpoints reaching ~100% functional coverage | 11/11 modules |

### Verdict

The API is **well-architected and security-conscious**. Authentication, RBAC, input validation (Zod), injection resistance, secret handling, rate limiting, and security headers are all **solid**. However, there are **three broken object-level authorization (BOLA/IDOR) issues** on list endpoints that leak other members' data, **one endpoint (`GET /employees/:id`) that is completely broken**, and a **transaction-timeout reliability risk** that will surface in production against the configured remote database.

**Recommended gate:** Fix the HIGH findings (SEC-01, BUG-01, REL-01) before production release.

---

## 2. Severity Dashboard

| ID | Severity | Type | Title | Status |
|---|---|---|---|---|
| **SEC-01** | 🔴 High | Broken Access Control | `GET /bookings` returns all members' bookings to any MEMBER | Open |
| **BUG-01** | 🔴 High | Functional defect | `GET /employees/:id` always returns 500 (Prisma `orderBy`) | Open |
| **REL-01** | 🟠 High | Reliability | Interactive transaction timeouts (P2028) on write flows | Open |
| **SEC-02** | 🟡 Medium | Broken Access Control | `GET /shop-orders` not scoped to the requesting member | Open |
| **SEC-03** | 🟡 Medium | Broken Access Control | `GET /tabs` exposes all members' open tabs | Open |
| **OBS-01** | 🔵 Low | API consistency | `POST /leads/:id/quotations` ignores URL `:id`, requires `leadId` in body | Open |
| **OBS-02** | 🔵 Low | UX / semantics | Re-opening a tab returns `201` instead of `409`/existing | Open |
| **OBS-03** | 🔵 Low | Observability | CORS rejections logged as "Unhandled server error" | Open |

---

## 3. Test Environment & Methodology

### 3.1 Isolation & safety (important)

The repository's `.env` points `DATABASE_URL` at a **live remote Neon (production/dev) database** and contains **real SMTP and Razorpay credentials**. To avoid polluting real data or sending real emails/charges, testing was performed against a **dedicated, disposable database**:

- Provisioned a separate database `bmc_apitest` on the same Neon server (never touched the real `neondb`).
- Pushed the Prisma schema, applied `manual_constraints.sql` (GiST overlap, stock ≥ 0, one-open-tab index), and ran the seed.
- Ran the server on port `5055` with test JWT secrets, **`MOCK_PAYMENTS=true`**, and **SMTP unset** (email disabled) so no external side effects occurred.

### 3.2 Tooling

- Node 22 built-in `fetch` harness (156 assertions) → machine-readable results.
- Role tokens obtained via `/auth/login` for all six seeded roles (`OWNER`, `FRONT_DESK`, `BAR_STAFF`, `KITCHEN`, `SHOP_STAFF`, `MEMBER`), password `Password@123`.
- White-box review of controllers/services/middleware to confirm root causes.

### 3.3 Coverage per test type

| Category | Passed / Total |
|---|---|
| Functional (happy path + validation + CRUD chains) | 109 / 119 |
| Security (authN, authZ, injection, IDOR, JWT, rate limit, headers, CORS) | 32 / 35 |
| Robustness (404, malformed JSON) | 2 / 2 |

---

## 4. Detailed Findings

### 🔴 SEC-01 — Broken Object-Level Authorization on `GET /bookings` (High)

**Endpoint:** `GET /api/bookings` (route allows `OWNER, FRONT_DESK, MEMBER`)
**Observed:** Logged in as the seeded `MEMBER`, the call returned **HTTP 200 with every booking in the system**, including other members' bookings and **walk-in customer names and phone numbers (PII)**.

**Root cause** — `src/modules/courts/bookings/booking.controller.js`:
```js
export const listBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.query); // req.user is ignored
  return success(res, result);
});
```
The service filters only by the optional `memberId` query param; a MEMBER is never constrained to their own records.

**Impact:** Any authenticated member can enumerate the entire booking ledger and harvest walk-in PII → privacy breach / GDPR-style exposure.

**Remediation:** Scope the query by the caller when the role is `MEMBER`:
```js
export const listBookings = asyncHandler(async (req, res) => {
  const query = { ...req.query };
  if (req.user.role === 'MEMBER') {
    const me = await memberService.getByUserId(req.user.id);
    query.memberId = me.id;            // force own records
  }
  const result = await bookingService.listBookings(query);
  return success(res, result);
});
```

---

### 🔴 BUG-01 — `GET /employees/:id` always returns 500 (High)

**Endpoint:** `GET /api/employees/:id` (OWNER)
**Observed:** Returns **HTTP 500** on every call (reproduced on two independent runs).

**Root cause** — `src/modules/hr/employees/employee.service.js`, `getEmployeeById`:
```js
payrolls: { orderBy: { year: 'desc', month: 'desc' } },
```
Prisma rejects a multi-field `orderBy` **object** on a to-many relation:
```
Argument `orderBy`: Invalid value provided.
Expected PayrollOrderByWithRelationInput[], provided Object.
```

**Impact:** The employee detail view is entirely non-functional.

**Remediation:** Use the array form for multi-field ordering:
```js
payrolls: { orderBy: [{ year: 'desc' }, { month: 'desc' }] },
```

---

### 🟠 REL-01 — Interactive transaction timeouts under DB latency (High)

**Endpoints affected (intermittent):** `POST /members`, `POST /shop-orders`, `POST /bar-orders`, `POST /invoices/:id/payment`, `POST /payroll/run`, and other multi-step writes.
**Observed:** Intermittent **HTTP 500** with Prisma error `P2028`:
```
Transaction already closed ... timeout for this transaction was 5000 ms,
however 5295 ms passed ... Consider increasing the interactive transaction
timeout or doing less work in the transaction.
```
On retry against a less-loaded connection several of these **succeeded (201/200)**, confirming the code is logically correct but the transactions run right at the **default 5 s `prisma.$transaction` limit**.

**Why this matters for production, not just the test:** the application's configured `DATABASE_URL` is the **same remote Neon pooler**. The round-trip latency that triggered the timeouts here will be present in the real deployment, so these 500s **will occur in production** under normal/peak load.

**Remediation (any/all):**
1. Raise the transaction budget where multiple queries are chained:
   ```js
   await prisma.$transaction(async (tx) => { /* ... */ }, { timeout: 15000, maxWait: 10000 });
   ```
2. Reduce the number of sequential queries inside each transaction (batch reads, precompute outside the transaction).
3. Co-locate the app and database (same region) and prefer the Neon **non-pooled** endpoint for transactional work, or tune pool size.

---

### 🟡 SEC-02 — `GET /shop-orders` not scoped to the member (Medium)

**Endpoint:** `GET /api/shop-orders` (allows `OWNER, SHOP_STAFF, MEMBER`)
**Root cause** — `listShopOrders(req.query)` ignores `req.user`; no per-member filter (`src/modules/shop/orders/shop-order.controller.js`).
**Impact:** A member can read all retail orders (customers, items, amounts).
**Remediation:** Same pattern as SEC-01 — force `memberId` for the `MEMBER` role. Also consider adding an explicit ownership check in `GET /shop-orders/:id` (currently only `auth`, no role/ownership gate).

---

### 🟡 SEC-03 — `GET /tabs` exposes all open tabs (Medium)

**Endpoint:** `GET /api/tabs` (allows `OWNER, BAR_STAFF, MEMBER`)
**Root cause** — `tab.controller.listTabs` calls `tabService.listOpenTabs()` with no member filter.
**Impact:** A member can list every member's open bar tab (spend patterns, balances).
**Remediation:** For the `MEMBER` role, filter tabs to their own `memberId`, or remove `MEMBER` from the route's allowed roles if members are not meant to use this endpoint.

---

### 🔵 OBS-01 — Quotation endpoint ignores URL param (Low)

`POST /leads/:id/quotations` validates `{ body: createQuotationSchema }`, and that schema **requires `leadId` and `validUntil` in the body** — the `:id` in the URL is not used for validation. A caller who (reasonably) relies on the URL `:id` gets a confusing `400 "leadId Required"`.
**Remediation:** Inject `req.params.id` as `leadId` before validation, or validate the param and drop `leadId` from the body schema. (Endpoint works correctly once the body includes both fields — verified `201`.)

### 🔵 OBS-02 — Re-opening a tab returns 201 (Low)

Opening a second tab for a member who already has an open tab returns **`201 Success`** rather than `409`. The DB-level `bartab_one_open_per_member` unique index **does hold** (verified: only one tab row existed), so no duplicate is created — but the response semantics are misleading. Return `409 Conflict` or `200` with the existing tab.

### 🔵 OBS-03 — CORS rejections logged as unhandled errors (Low)

A request from a disallowed `Origin` is correctly blocked, but the thrown `Error: Origin ... is not allowed by CORS` surfaces as a `level:50 "Unhandled server error"` log line. Functionally safe; noisy for monitoring. Handle the CORS error explicitly (respond `403`) to keep error logs clean.

---

## 5. Security Assessment — What Passed ✅

The following controls were tested and behave correctly:

| Control | Test | Result |
|---|---|---|
| **Privilege escalation / mass assignment** | `POST /auth/register` with `role: "OWNER"` injected | ✅ Role forced to `MEMBER` |
| **Authentication required** | Protected routes without token | ✅ `401` |
| **RBAC enforcement** | 18 wrong-role attempts across every module (e.g. MEMBER→users/ledger/dashboard, FRONT_DESK→courts/employees/payroll, BAR_STAFF→delete table) | ✅ All `403` |
| **JWT integrity** | Tampered token, malformed token, forged `alg:none` token | ✅ All `401` |
| **SQL injection** | `' OR 1=1--` in member search; injection in login fields | ✅ Safe (parameterized via Prisma); no `500`, no bypass |
| **IDOR (object ownership)** | MEMBER reading another member's `/members/:id` | ✅ `403` "You can only view your own profile" |
| **Scoped reads** | MEMBER `/invoices` list | ✅ Scoped via `req.user` |
| **Rate limiting** | 30-request burst on `/auth/login` | ✅ `429` enforced (limit 20 / 15 min) |
| **Security headers** | Helmet on responses | ✅ `x-content-type-options: nosniff` etc. present |
| **CORS** | Request with `Origin: evil.example.com` | ✅ Not reflected / rejected |
| **Secret hygiene** | `env.js` refuses to boot without ≥32-char JWT secrets; no fake fallback keys | ✅ Verified |
| **Input validation** | ~40 invalid-payload cases (bad UUID, bad email/phone, negative price, bad enum, future DOB, bad time format, empty item arrays, invalid GSTIN, month 13) | ✅ All `400` |
| **Robustness** | Unknown route, malformed JSON body | ✅ `404` / `400` |

---

## 6. Business Rules Validated ✅

Several initial "failures" were the API **correctly enforcing business rules** with test data that intentionally violated them. Re-tested with valid data, all passed:

| Rule | Evidence |
|---|---|
| **Court double-booking prevention** (GiST EXCLUDE) | Overlapping booking on same court/slot → rejected |
| **Membership age limit (BR6)** | Registering a 36-year-old on the "Junior" plan (maxAge 18) → `422 "Member age is 36. This plan requires age under 18"`; same person on "Gold" → `201` |
| **Social play Fridays-only** | Session on a non-Friday → `400`; on `2027-01-01` (Friday) → `201`, join `200`, leave `200` |
| **One open tab per member** | Enforced at DB level (unique partial index) |
| **Lead → Quotation → Convert flow** | Full CRM pipeline verified end-to-end → member created with QR |
| **Invoice payment** | Marks invoice `PAID`, writes transaction → `200` |

---

## 7. Module-by-Module Result Matrix

| Module | Functional | AuthZ | Notes |
|---|---|---|---|
| Auth | ✅ | ✅ | login/register/refresh/logout/me; validation + rate limit all pass |
| Users | ✅ | ✅ | OWNER-only enforced |
| Plans | ✅ | ✅ | optionalAuth read; OWNER write |
| Members | ✅ | ✅ | age rule enforced; self-scope on profile ✅ |
| Courts | ✅ | ✅ | OWNER write; overlap prevention ✅ |
| Bookings | ⚠️ | ❌ **SEC-01** | create/cancel/availability OK; **list not member-scoped** |
| Social Play | ✅ | ✅ | Friday rule; join/leave OK |
| Products | ✅ | ✅ | SKU/price validation; delete OWNER-only |
| Inventory | ✅ | ✅ | stock-in / logs / low-stock |
| Shop Orders | ⚠️ | ❌ **SEC-02** | create (REL-01 timeout), status OK; **list not scoped** |
| Menu | ✅ | ✅ | OWNER-only writes |
| Bar Tables | ✅ | ✅ | delete OWNER-only |
| Bar Orders | ✅* | ✅ | works; *REL-01 intermittent timeout on create |
| Tabs | ⚠️ | ❌ **SEC-03** | open/settle OK; **list exposes all**; OBS-02 |
| Kitchen | ✅ | ✅ | queue + status |
| Shifts | ✅ | ✅ | open/close/report/active |
| CRM Public | ✅ | ✅ | enquiry/trial/plans/availability/shop |
| Enquiries | ✅ | ✅ | staff-only |
| Leads | ✅ | ✅ | full pipeline; OBS-01 |
| Payments | ✅ | ✅ | mock mode; validation OK |
| Ledger | ✅ | ✅ | OWNER-only |
| Invoices | ✅* | ✅ | create/get/pdf/pay; *REL-01 on payment |
| Expenses | ✅ | ✅ | create/list/pay |
| Employees | ❌ **BUG-01** | ✅ | list/create/update OK; **get-by-id 500** |
| Attendance | ✅ | ✅ | check-in/out; list OWNER-only |
| Leave | ✅ | ✅ | request/list; approve OWNER-only |
| Payroll | ✅* | ✅ | *REL-01 on run; list OK |
| Dashboard | ✅ | ✅ | OWNER-only |
| Reports | ✅ | ✅ | tax/inventory/membership + Excel export |

Legend: ✅ pass · ⚠️ partial · ❌ defect · * intermittent (REL-01)

---

## 8. Prioritised Remediation Plan

| Priority | Action | Effort |
|---|---|---|
| **P0** | BUG-01: change `payrolls` `orderBy` to array form | 1 line |
| **P0** | SEC-01/02/03: scope list endpoints (`bookings`, `shop-orders`, `tabs`) to `req.user` for the MEMBER role | ~½ day |
| **P1** | REL-01: raise `$transaction` timeout + reduce in-tx queries; verify on co-located/low-latency DB | ~½ day |
| **P2** | OBS-01: derive `leadId` from URL param in quotation route | small |
| **P2** | OBS-02 / OBS-03: tab re-open semantics; CORS error handling | small |
| **P3** | Add automated regression suite (this harness) to CI against a local Postgres | ~1 day |

---

## 9. Appendix — Reproduction

- Test DB: `bmc_apitest` on the Neon server (separate from `neondb`); schema via `prisma db push` + `manual_constraints.sql` + seed.
- Server: port `5055`, `MOCK_PAYMENTS=true`, SMTP disabled, test JWT secrets.
- Harness: `scratchpad/apitest.mjs` (156 cases) + `scratchpad/retest.mjs` (root-cause confirmation). Raw machine-readable results captured to `results.json`.
- Credentials (seed): `owner@championsclub.com` … `member@championsclub.com`, all `Password@123`.

> Note: the remote test database introduced network latency that caused the REL-01 transaction timeouts. Running the same suite against a **local Postgres** is recommended for CI to isolate true logic failures from latency — but REL-01 itself remains a genuine production concern because the deployed app uses the same remote database.

---

*End of report.*
