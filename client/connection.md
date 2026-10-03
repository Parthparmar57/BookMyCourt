# BookMyCourt — Frontend ⇄ Backend Connection Plan

**Goal:** Make the React client (`client/`) fully dynamic against the live backend (`server/`) — replacing all mock data with real API calls, real JWT auth, React Query data flow, and Socket.IO real-time — **without changing anything in `server/`**. All work happens in `client/` only.

> **Status:** This is a **planning document only**. No code has been changed yet. It defines the phased plan, the exact endpoint/field mappings, and acceptance criteria for each phase.

---

## 0. Current State (what we're migrating from)

| Area | Today (mock) | Target (dynamic) |
|---|---|---|
| Data source | `src/data/mockData.js` + `src/services/apiServices.js` (setTimeout + in-memory arrays) | Real REST calls to `server` at `/api/*` |
| Auth | `src/context/AuthContext.jsx` role-switcher using `MOCK_USERS` | Real JWT login/register/refresh/me + token storage |
| Fetching | `useState`+`useEffect` calling mock services directly in pages | React Query (`@tanstack/react-query`, already installed) hooks |
| Real-time | none | Socket.IO for court availability + kitchen queue |
| Payments | none | Razorpay checkout (create-order → verify) |

**Already installed in `client/package.json`** (no new deps needed for the core): `axios`, `@tanstack/react-query`, `react-router-dom@7`, `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand`, `date-fns`, `qrcode.react`, `recharts`, `framer-motion`. **Add later (Phase 5/7):** `socket.io-client` (real-time), and the Razorpay checkout script (CDN, no npm dep).

---

## Backend contract (reference — do not change server)

- **Base URL:** everything is under `/api` (e.g. `POST /api/auth/login`). Default server port **5000**.
- **Response envelope (every endpoint):**
  ```json
  { "success": true, "message": "…", "data": { /* payload */ } }
  ```
  Errors: `{ "success": false, "message": "…", "errors": { field: ["msg"] } | null }`.
  → The client must **unwrap `.data`** everywhere, and read `.message` / `.errors` for failures.
- **Auth:** JWT. Send `Authorization: Bearer <accessToken>`.
  - `POST /api/auth/login` `{ login, password }` → `data: { user, accessToken, refreshToken }` and sets an **httpOnly `refreshToken` cookie** scoped to `/api/auth`.
  - `POST /api/auth/register` `{ name, email, phone, password }` → `data: { user, accessToken, refreshToken }` (role always forced to `MEMBER`).
  - `POST /api/auth/refresh` (reads refresh cookie **or** `{ refreshToken }` body) → `data: { accessToken }`.
  - `POST /api/auth/logout` → clears the cookie.
  - `GET /api/auth/me` → `data: user` (includes `member` / `employee` relations).
- **Status codes to handle:** `400` validation, `401` no/invalid token, `403` wrong role / ownership, `404`, `409` conflict (duplicate / overlap / open-tab), `422` business rule, `429` rate-limited, `503` DB timeout (retryable).
- **Rate limits:** auth 20/15min, public 100/15min, global 1000/15min.
- **CORS:** server allows `CLIENT_URL` (default `http://localhost:5173`) + any `localhost`/`127.0.0.1` in dev, with `credentials: true`. For cookie-based refresh, axios must use `withCredentials: true`.

Full endpoint catalogue: see [`../docs/API_DOCUMENTATION.md`](../docs/API_DOCUMENTATION.md).

---

## Phase Overview

| Phase | Title | Outcome | Depends on |
|---|---|---|---|
| **1** | Environment & HTTP foundation | `.env`, axios instance, interceptors, envelope unwrap, error normalization | — |
| **2** | Authentication & session | Real login/register/refresh/me, token storage, AuthContext rewrite, route guards | 1 |
| **3** | Data layer (React Query) | Query/mutation hooks + real API service modules, query-key strategy | 1, 2 |
| **4** | Module wiring | Each page reads/writes live data (public, members, bookings, shop, bar, kitchen, dashboard, CRM) | 3 |
| **5** | Real-time | Socket.IO for availability + kitchen KDS | 4 |
| **6** | Forms & validation | zod schemas aligned to server, surface server field errors | 2, 4 |
| **7** | Payments & cleanup | Razorpay flow; delete mock data & fallbacks | 4 |
| **8** | Verification & build | E2E role walkthroughs, env per environment, proxy/build config | all |

---

## Phase 1 — Environment & HTTP Foundation

**Goal:** One configured axios client that every service uses; the envelope and errors are handled in one place.

**Files to add/edit (client only):**
- `client/.env` (and `.env.example`): `VITE_API_URL=http://localhost:5000/api`
- `client/vite.config.js`: add a dev proxy so the browser calls same-origin `/api` (avoids CORS entirely in dev):
  ```js
  server: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } }
  ```
  With the proxy, set `VITE_API_URL=/api`.
- `client/src/lib/apiClient.js` (new): the axios instance.

**Reference implementation (goes in `apiClient.js`):**
```js
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,            // send/receive the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the { success, data } envelope + normalize errors (+ 401 refresh, Phase 2)
apiClient.interceptors.response.use(
  (res) => res.data?.data ?? res.data,
  (err) => {
    const r = err.response;
    return Promise.reject({
      status: r?.status,
      message: r?.data?.message || err.message,
      errors: r?.data?.errors || null,
      retryable: r?.status === 503 || r?.status === 429,
    });
  }
);
```

**Acceptance criteria:**
- `apiClient.get('/health')`-style call returns unwrapped data.
- No component imports `axios` directly — all go through `apiClient`.
- Switching `VITE_API_URL` repoints the whole app.

---

## Phase 2 — Authentication & Session

**Goal:** Replace the mock role-switcher with real JWT auth and role-aware routing.

**Files to edit/add (client only):**
- `src/services/auth.service.js` (new): `login`, `register`, `refresh`, `logout`, `getMe`.
- `src/context/AuthContext.jsx` (rewrite): real user/token state, bootstrap from `/auth/me`.
- `src/lib/apiClient.js`: add the **401 → refresh → retry** flow.
- `src/app/router.jsx`: add `<ProtectedRoute roles={[…]}>` guards per section.
- `src/modules/website/pages/LoginPage.jsx`: wire to real login.

**Token strategy:**
- `accessToken` → `localStorage` (sent via `Authorization` header by the request interceptor).
- `refreshToken` → already an **httpOnly cookie** set by the server (path `/api/auth`); the browser sends it automatically when `withCredentials: true`. Treat the `refreshToken` in the login response body as a fallback only.

**401 refresh flow (add to the response interceptor):**
```
request → 401 →
  if not already retried and not an /auth/* call:
    call POST /api/auth/refresh (cookie sent automatically)
    on success: store new accessToken, replay original request
    on failure: clear session, redirect to /login
```
Guard against refresh storms (single in-flight refresh promise shared by concurrent 401s).

**AuthContext target shape:**
```js
{ user, role, isAuthenticated, isLoading, login(login,password), register(payload), logout() }
```
- On app load: if `accessToken` exists → call `getMe()` to hydrate `user` (and `user.member` / `user.employee`); else `isAuthenticated=false`.
- `role` comes from `user.role` (real enum), **not** a manual switch.

**Role → route guard mapping (already-defined routes in `router.jsx`):**
| Route prefix | Allowed roles |
|---|---|
| `/` (public: home, courts, membership, shop, trial, login) | everyone (no guard) |
| `/admin/*` | `OWNER` |
| `/staff/frontdesk/*` | `OWNER`, `FRONT_DESK` |
| `/staff/bar/*` | `OWNER`, `BAR_STAFF` |
| `/staff/shop/*` | `OWNER`, `SHOP_STAFF` |
| `/staff/kitchen/*` | `OWNER`, `KITCHEN`, `BAR_STAFF` |
| `/member/*` | `MEMBER` |

- After login, redirect by role: `OWNER→/admin`, `FRONT_DESK→/staff/frontdesk`, `BAR_STAFF→/staff/bar`, `SHOP_STAFF→/staff/shop`, `KITCHEN→/staff/kitchen`, `MEMBER→/member`.
- A `ProtectedRoute` whose `roles` doesn't include `user.role` → redirect to `/login` (or a 403 page).

**Login form note:** the server field is `login` (accepts email **or** phone) + `password`. Seed creds for testing: `owner@championsclub.com … member@championsclub.com`, all `Password@123`.

**Acceptance criteria:**
- Real login stores token, hydrates user, redirects by role.
- Refresh on access-token expiry is transparent; logout clears token + cookie and returns to `/login`.
- Deep-linking to a guarded route while unauthenticated redirects to login.

---

## Phase 3 — Data Layer (React Query)

**Goal:** All server state flows through React Query; `apiServices.js` is rewritten to hit real endpoints (same export names where possible to limit page churn).

**Files:**
- `src/services/*.service.js` (new, one per domain) — thin functions over `apiClient`.
- `src/hooks/*` (new) — `useQuery`/`useMutation` wrappers with stable query keys.
- `src/app/providers.jsx` — already wraps `QueryClientProvider`; keep.

**Query-key convention:**
```
['members', { q, page }]  ['member', id]
['courts']  ['availability', { date, courtId }]  ['bookings', filters]
['products']  ['inventory','low-stock']  ['shop-orders', filters]
['menu']  ['bar-tables']  ['bar-orders']  ['tabs']  ['kitchen','queue']
['dashboard','summary']  ['dashboard','utilisation']  ['leads', filters]
['invoices', filters]  ['expenses']  ['ledger', filters]  ['reports', type]
```

**Mutation → invalidation rules (examples):**
- `createBooking`/`cancelBooking` → invalidate `['bookings']` + `['availability']`.
- `createMember`/`renewMember` → invalidate `['members']`, `['member', id]`.
- `stockIn`/`updateProduct` → invalidate `['products']`, `['inventory','low-stock']`.
- `settleTab`/`openTab` → invalidate `['tabs']`.
- `updateKitchenStatus` → invalidate `['kitchen','queue']` (also pushed via socket, Phase 5).

**Loading/error UX:** standardize on skeletons for `isLoading`, toast/banner for errors using the normalized `{ message, errors }`. Retry `503`/`429` once with backoff (React Query `retry`).

**Acceptance criteria:**
- No page imports `mockData` for server state.
- Cache invalidation keeps lists fresh after mutations.

---

## Phase 4 — Module-by-Module Wiring

Each sub-section lists the **page(s)**, the **endpoints**, and the **field mapping** (mock → server). Wire pages to the Phase-3 hooks.

### 4.1 Public website (no auth)
**Pages:** `HomePage`, `MembershipPage`, `AvailabilityPage`, `ShopPage`, `TrialPage`, `LoginPage`
| Need | Endpoint |
|---|---|
| Plans pricing cards | `GET /api/public/plans` |
| Court availability widget | `GET /api/public/availability` |
| Shop catalogue | `GET /api/public/shop` |
| Trial booking form | `POST /api/public/trial` |
| Enquiry / chat widget | `POST /api/public/enquiry` |
| Login | `POST /api/auth/login` |

### 4.2 Members
**Page:** `MembersPage` — **Endpoints:** `GET/POST /api/members`, `GET /api/members?q=`, `GET /api/members/:id`, `POST /api/members/:id/renew`
| Mock field | Server field |
|---|---|
| `id` = `BMC-2026-8842` | `id` (UUID) + display `memberNo` (`MEM-001001`) |
| `planId` = `plan-gold` | `planId` (UUID) — fetch via `GET /api/plans` |
| `expiryDate` | `endDate` |
| `age` (precomputed) | derive from `dob` |
| `activeTabBalance`, `activeBookingsCountToday` | from `GET /api/members/:id` profile includes (tabs/bookings) |
| `emergencyContact: {name,phone}` | server `emergencyContact` is a **string (phone)** — adjust the form |
> Plans list for the dropdown comes from `GET /api/plans` (replace `MOCK_PLANS`). Server plan fields: `price, durationMonths, courtRate, freeSessions, shopDiscountPct, barDiscountPct, maxBookingsDay, maxAge` (note names differ from mock's `courtDiscountPercent` etc.).

### 4.3 Bookings & Courts
**Page:** `BookingsPage` — **Endpoints:** `GET /api/courts`, `GET /api/bookings/availability?date=&courtId=`, `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id/cancel`
- Replace `getSlots()` mock with the **availability** endpoint (returns per-slot open/booked for a date).
- `createBooking` body: `{ courtId, date, startTime ("HH:00"/"HH:30"), type, walkIn?: {name,phone}, memberId?, paymentMode }`. A logged-in MEMBER omits member/walk-in (books for self).
- Handle `409` (overlap) and `422` (daily-limit/age) with inline messages.
- Court `status` mock `MAINTENANCE` → server `isOpen: false`.

### 4.4 Shop & Inventory
**Page:** `ShopInventoryPage` (+ public `ShopPage`) — **Endpoints:** `GET/POST /api/products`, `PATCH /api/products/:id`, `POST /api/inventory/stock-in`, `GET /api/inventory/logs`, `GET /api/inventory/low-stock`, `POST /api/shop-orders`, `PATCH /api/shop-orders/:id/status`
- `updateStock(delta)` mock → `POST /api/inventory/stock-in { productId, quantity, cost?, supplier? }`.
- Product fields: `sku, category (enum), price, taxPct, stock, reorderLevel`.

### 4.5 Bar & Tabs
**Page:** `BarPage` — **Endpoints:** `GET /api/menu`, `GET /api/bar-tables`, `POST /api/bar-orders`, `POST /api/bar-orders/:id/settle`, `GET/POST /api/tabs`, `POST /api/tabs/:id/settle`
- Opening a tab for a member who already has one now returns **409** — surface "member already has an open tab".
- A MEMBER viewing `/member/tab` only sees **their own** tab (server now scopes this).

### 4.6 Kitchen (KDS)
**Page:** `KitchenPage` — **Endpoints:** `GET /api/kitchen/queue`, `PATCH /api/kitchen/:id/status`
- `advanceKitchenTicket` mock state machine (`NEW→IN_PREPARATION→READY_TO_SERVE`) → server statuses `PREPARING → SERVED → COMPLETED` via `PATCH /kitchen/:id/status`.
- Live updates via socket in Phase 5 (poll as a fallback until then).

### 4.7 Owner Dashboard & CRM
**Page:** `OwnerDashboardPage` (also mapped to `/admin/crm`, `/accounting`, `/hr`) — **Endpoints:** `GET /api/dashboard/summary`, `GET /api/dashboard/utilisation`, `GET /api/leads`, `GET /api/ledger`, `GET /api/reports/*`
- Replace `MOCK_DASHBOARD_METRICS` and `MOCK_LEADS`.
- Recharts data comes from `dashboard/utilisation` and `reports`.
> The router currently points `/admin/crm`, `/accounting`, `/hr` all at `OwnerDashboardPage`. Building dedicated CRM/Finance/HR pages is optional scope; endpoints exist (`/leads`, `/invoices`, `/expenses`, `/employees`, `/attendance`, `/leave`, `/payroll`).

**Acceptance criteria (Phase 4):** every page renders live data for its role; no `MOCK_*` import remains in wired pages; mutations reflect immediately via query invalidation.

---

## Phase 5 — Real-Time (Socket.IO)

**Goal:** Live court availability and kitchen queue without polling.

- **Add dep:** `socket.io-client`.
- Server emits via `src/sockets/booking.socket.js` and `src/sockets/kitchen.socket.js`.
- **Files:** `src/lib/socket.js` (singleton connection to the server origin, pass the access token for auth), `src/hooks/useBookingSocket.js`, `src/hooks/useKitchenSocket.js`.
- On socket events, call `queryClient.invalidateQueries` / `setQueryData` for `['availability', …]` and `['kitchen','queue']`.
- **Fallback:** keep React Query `refetchInterval` (e.g. 10s) for KDS if the socket drops.

> Confirm the exact event names/handshake by reading the two server socket files (read-only) before wiring.

**Acceptance criteria:** booking a slot updates other open clients' grids; kitchen status changes appear on the KDS without refresh.

---

## Phase 6 — Forms & Validation

**Goal:** Client validation mirrors server zod rules; server field errors surface on inputs.

- Use `react-hook-form` + `@hookform/resolvers/zod` (installed) with schemas that match the server (`server/src/shared/schemas/*`) — e.g. phone `^[6-9]\d{9}$`, SKU uppercase, booking time `:00/:30`, GSTIN format.
- On `400` responses, map `errors` (`{ field: [msg] }`) back onto form fields; on `422` show the business-rule message as a form-level error.
- Keep the existing client-side rules (e.g. Junior-plan age < 18) but let the **server be authoritative** (it returns `422`).

**Acceptance criteria:** invalid inputs blocked client-side; server validation errors render next to the right fields.

---

## Phase 7 — Payments & Cleanup

**Payments (Razorpay):**
- Flow: `POST /api/payments/create-order { amount }` → open Razorpay checkout (CDN script, key `rzp_test_…`) → on success `POST /api/payments/verify { razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
- Used by membership purchase/renew, online shop orders, member bookings.
- Note: server may run with `MOCK_PAYMENTS=true` (test) — handle both mock and live responses.

**Cleanup:**
- Delete `src/data/mockData.js` once every page is live.
- Remove the mock bodies from `src/services/apiServices.js` (or delete and switch imports to the new `*.service.js`).
- Remove the `delay()` simulation and any `MOCK_*` imports.

**Acceptance criteria:** repo-wide search for `MOCK_` / `mockData` returns nothing in `src/`.

---

## Phase 8 — Verification & Build

- **Role walkthroughs (E2E):** log in as each seeded role and exercise its pages against a running `server` (point `VITE_API_URL` at it).
- **Error states:** verify `401` (token expiry → silent refresh), `403` (wrong role → guard), `409`/`422` (conflict/business), `429`/`503` (retry UX).
- **Env matrix:** `.env.development` (`/api` via proxy) and `.env.production` (`VITE_API_URL=https://<api-host>/api`). Ensure the server's `CLIENT_URL` matches the deployed frontend origin for CORS.
- **Build:** `npm run build` (Vite) — confirm no `import.meta.env` vars are missing; the dev proxy does not apply in production, so the prod base URL must be absolute.

**Acceptance criteria:** all six roles complete their core journeys against the live API; production build points at the correct API host.

---

## Endpoint ⇄ Page Traceability Matrix

| Server endpoint(s) | Client page / feature | Phase |
|---|---|---|
| `POST /auth/login`, `/register`, `/refresh`, `/me`, `/logout` | `LoginPage`, `AuthContext` | 2 |
| `GET /public/plans`, `/availability`, `/shop`; `POST /public/trial`, `/enquiry` | public website pages, chat widget | 4.1 |
| `GET/POST /members`, `GET /members/:id`, `POST /members/:id/renew` | `MembersPage` | 4.2 |
| `GET /plans` (dropdowns) | `MembersPage`, `MembershipPage` | 4.2 |
| `GET /courts`, `/bookings/availability`, `GET/POST /bookings`, `PATCH /bookings/:id/cancel` | `BookingsPage` | 4.3 |
| `GET/POST /products`, `PATCH /products/:id`, `/inventory/*`, `/shop-orders` | `ShopInventoryPage`, `ShopPage` | 4.4 |
| `GET /menu`, `/bar-tables`, `/bar-orders`, `/tabs` | `BarPage` | 4.5 |
| `GET /kitchen/queue`, `PATCH /kitchen/:id/status` | `KitchenPage` | 4.6 |
| `GET /dashboard/summary`, `/utilisation`, `/leads`, `/ledger`, `/reports/*` | `OwnerDashboardPage` | 4.7 |
| `POST /payments/create-order`, `/verify` | checkout flows | 7 |
| Socket: booking, kitchen | availability grid, KDS | 5 |

---

## Risks / Notes

- **Field-shape drift:** mock IDs (`BMC-2026-…`, `plan-gold`) differ from server UUIDs + `memberNo`/`planId`. Build small adapter/mapper functions per entity to keep components stable.
- **Member-scoped lists:** `/bookings`, `/shop-orders`, `/tabs` are now auto-scoped for the `MEMBER` role server-side — the client should **not** try to pass another member's id.
- **CORS vs proxy:** prefer the Vite dev proxy to avoid CORS during development; in production set an absolute `VITE_API_URL` and ensure server `CLIENT_URL` matches.
- **Refresh cookie path:** the refresh cookie is scoped to `/api/auth`; refresh calls must hit that path with `withCredentials: true`.
- **Retryable errors:** treat `503` (DB timeout) and `429` (rate limit) as retryable with backoff.
- **No server changes:** every item above is implemented in `client/`. If a genuine gap is found (missing endpoint/field), log it here rather than editing `server/`.

---

*This document is the connection blueprint. Implementation will proceed phase by phase on approval; no client code has been modified yet.*
