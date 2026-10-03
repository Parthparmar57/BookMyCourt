# Tech Stack: Sports Club Management System (PERN)

**Stack:** PostgreSQL · Prisma · Express.js · React · Node.js
**Language:** JavaScript only (no TypeScript), ES Modules (`"type": "module"`, `import` / `export`)
**Validation strategy:** one shared set of **Zod** schemas used on both the frontend (forms) and backend (API), plus **database constraints** in PostgreSQL as the final safety net.

> Use the latest stable version of each library at project start and lock versions in `package-lock.json`.

---

## 1. Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| Database | PostgreSQL | Main relational database; exclusion constraints prevent double booking |
| ORM | Prisma | Schema, migrations, seeding, database queries (only ORM used) |
| Backend runtime | Node.js (LTS) | Server runtime |
| Backend framework | Express.js | REST API |
| Frontend | React + Vite | Staff panels, member portal, public website |
| Language | JavaScript (ES Modules) | `import`/`export` in frontend, backend and shared package |
| Validation | Zod (shared) | Same schemas validate forms and API requests |
| Realtime | Socket.IO | Live kitchen screen, booking grid, dashboard updates |
| Payments | Razorpay (test mode) | Card, UPI, online payments |

---

## 2. Frontend (React)

| Category | Library | Why |
|---|---|---|
| Build tool | Vite | Fast dev server and build (`.jsx` files) |
| Routing | React Router | Pages and role-based protected routes |
| Server state | TanStack Query (React Query) | API fetching, caching, auto refresh |
| Client state | Zustand | Logged-in user, role, cart, POS ticket |
| HTTP client | Axios | API calls with JWT interceptor |
| Forms | React Hook Form | Fast forms with minimal re-renders |
| Form validation | Zod + @hookform/resolvers | Connects shared Zod schemas to forms |
| UI styling | Tailwind CSS | Fast, consistent styling |
| UI components | shadcn/ui (Radix UI) | Accessible dialogs, tables, dropdowns, tabs |
| Icons | lucide-react | Icon set |
| Tables | TanStack Table | Member lists, orders, ledger with sort/filter/pagination |
| Calendar / slots | FullCalendar (or custom grid) | Court availability grid |
| Charts | Recharts | Owner dashboard charts |
| Dates | date-fns | Slot math, expiry dates, formatting |
| QR display | qrcode.react | Member card QR |
| QR scanning | html5-qrcode | Scan member card at desk, bar, shop |
| Notifications | sonner (toast) | Success and error messages |
| Realtime client | socket.io-client | Kitchen screen, live booking grid |
| Payments UI | Razorpay Checkout script | Online payment popup |

---

## 3. Backend (Node.js + Express)

| Category | Library | Why |
|---|---|---|
| Framework | Express | REST API |
| ORM | Prisma (`prisma`, `@prisma/client`) | Models in `schema.prisma`, `prisma migrate`, `prisma studio`, queries |
| Request validation | Zod | Validate `body`, `params`, `query` with shared schemas |
| Env validation | Zod (env schema) or envalid | App refuses to start with missing/invalid env vars |
| Auth tokens | jsonwebtoken | Access and refresh tokens |
| Password hashing | bcrypt | Secure password storage |
| Security headers | helmet | Sets safe HTTP headers |
| CORS | cors | Allow only the frontend origin |
| Rate limiting | express-rate-limit | Protect login and public forms |
| Cookies | cookie-parser | HTTP-only refresh token cookie |
| File upload | multer | Member photo, product images |
| Realtime | socket.io | Push new orders, bookings, stock alerts |
| Scheduled jobs | node-cron | Expiry reminders, auto-expire members, low-stock check |
| Email | nodemailer | Booking confirmation, reminders, quotes, invoices |
| PDF | pdfkit | Invoices, quotations, payslips, reports |
| Excel export | exceljs | Report downloads |
| QR generation | qrcode | Member QR code images |
| Payments | razorpay (Node SDK) | Create orders, verify payment signatures |
| Logging | pino + pino-http (or winston + morgan) | Request and error logs |
| Error handling | Custom error middleware | One consistent error response format |
| API docs | swagger-ui-express + zod-to-openapi | Auto API documentation from Zod schemas |

---

## 4. Database (PostgreSQL)

| Feature | How it is used |
|---|---|
| `btree_gist` extension | Needed for the booking exclusion constraint |
| Exclusion constraint | Blocks overlapping bookings on the same court at DB level |
| `CHECK` constraints | Price ≥ 0, quantity > 0, stock ≥ 0, end time > start time |
| `UNIQUE` constraints | Email, phone, member ID, SKU |
| Foreign keys | Every booking, order, invoice tied to valid member/court/product |
| Enums | Role, plan tier, booking status, order status, payment mode |
| Transactions | Sale + stock decrement + ledger entry happen together or not at all |
| Indexes | Member phone/name search, booking by court and date, ledger by date |

**No-double-booking constraint** (added as a raw SQL Prisma migration):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (
    "courtId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  )
  WHERE (status <> 'CANCELLED' AND type = 'NORMAL');
```

---

## 5. Validation Libraries Summary

| Where | Library | What it validates |
|---|---|---|
| Frontend forms | React Hook Form + Zod + @hookform/resolvers | Field format, required fields, instant error messages |
| Shared package | Zod | One schema per entity, imported by frontend and backend |
| API requests | Zod middleware (`validate(schema)`) | Every `body`, `params`, `query` before the controller runs |
| Business rules | Service layer (custom code) | 2 bookings/day, plan pricing, stock available, Junior age |
| Environment | Zod env schema / envalid | DB URL, JWT secret, Razorpay keys present |
| Payments | Razorpay signature check (`crypto` HMAC) | Payment really came from Razorpay |
| Database | PostgreSQL constraints | Final guard: overlaps, uniques, non-negative stock |

**Validation layers (request flow):**

| Step | Layer | Example failure |
|---|---|---|
| 1 | Frontend form (Zod) | "Phone must be 10 digits" |
| 2 | API middleware (Zod) | 400 Bad Request: invalid date format |
| 3 | Auth + role middleware | 401 not logged in / 403 Kitchen cannot open billing |
| 4 | Service business rules | 422: member already has 2 bookings today |
| 5 | Database constraint | 409 Conflict: court already booked for that time |

---

## 6. Field Validation Rules by Form

### 6.1 Member Registration

| Field | Rule |
|---|---|
| Full name | Required, 2–100 characters, letters and spaces |
| Phone | Required, 10 digits (Indian mobile, starts 6–9), unique |
| Email | Required, valid email, unique |
| Date of birth | Required, past date |
| Plan | Required, one of Gold / Silver / Junior |
| Junior plan | Allowed only if age < 18 on start date |
| Start date | Required, today or later |
| Photo | Optional, JPG/PNG, max 2 MB |
| Emergency contact | Optional, 10-digit phone |

### 6.2 Court Booking

| Field | Rule |
|---|---|
| Court | Required, must exist and be open (not under maintenance) |
| Date | Required, today or future, within booking window (e.g. 7 days) |
| Start time | Required, on a 30-minute mark (:00 or :30), within opening hours |
| Duration | Fixed 60 minutes; end time must be within opening hours |
| Member or walk-in | Member ID if member; name + phone if walk-in |
| Daily limit | Member has fewer than 2 active bookings that day |
| Membership status | Expired member is charged walk-in rate |
| Overlap | No other active booking on same court overlapping the time |
| Price | Calculated by server from plan; never trusted from client |

### 6.3 Social Play Session

| Field | Rule |
|---|---|
| Day | Must be Friday |
| Max players | Integer, 2–20 |
| Fee per player | Number ≥ 0 |
| Join | Session not full; player not already joined |

### 6.4 Product / Stock

| Field | Rule |
|---|---|
| Name | Required, 2–120 characters |
| SKU | Required, unique, uppercase letters/numbers/dashes |
| Category | One of Rackets / Balls / Shoes / Accessories / Apparel |
| Price | Required, number > 0, max 2 decimals |
| GST % | One of 0, 5, 12, 18, 28 |
| Stock | Integer ≥ 0 |
| Reorder level | Integer ≥ 0 |
| Image | Optional, JPG/PNG/WebP, max 2 MB |

### 6.5 Shop Order (Counter or Online)

| Field | Rule |
|---|---|
| Items | At least 1 item |
| Quantity | Integer ≥ 1 and ≤ available stock |
| Fulfilment | Pickup or Delivery (online only) |
| Address | Required only if Delivery; PIN code 6 digits |
| Payment mode | Cash / Card / UPI / Online |
| Discount | Applied by server from member plan |

### 6.6 Bar Order and Bill

| Field | Rule |
|---|---|
| Table | Required, must exist |
| Items | At least 1 menu item that is marked available |
| Quantity | Integer 1–50 |
| Notes | Optional, max 200 characters |
| Tab | Only for active members; must be settled before day close |
| Payment mode | Cash / Card / UPI |
| Split bill | Sum of splits must equal bill total |
| Shift | Staff must have an open shift to take orders |

### 6.7 Enquiry / Trial Booking (Public)

| Field | Rule |
|---|---|
| Name | Required, 2–100 characters |
| Phone | Required, 10 digits |
| Email | Optional, valid email |
| Message | Optional, max 1000 characters |
| Trial slot | Must be a free slot in the future |
| Spam protection | Rate limit per IP + honeypot field |

### 6.8 Invoice, Expense, HR

| Form | Field | Rule |
|---|---|---|
| Business invoice | GSTIN | Optional, 15-character valid GSTIN format |
| Business invoice | Due date | On or after invoice date |
| Expense | Amount | Number > 0 |
| Leave request | Dates | To date ≥ from date; not overlapping existing leave |
| Leave request | Balance | Days requested ≤ remaining leave |
| Payroll | Net pay | Basic + allowances − deductions ≥ 0 |
| Shift | Closing cash | Number ≥ 0 |

### 6.9 Login

| Field | Rule |
|---|---|
| Email / phone | Required, valid format |
| Password | Min 8 characters, at least 1 letter and 1 number |
| Attempts | Max 5 per 15 minutes per IP (express-rate-limit) |

---

## 7. Example: Shared Zod Schema + Express Middleware (JavaScript)

```js
// packages/shared/src/schemas/booking.schema.js
import { z } from 'zod';

export const createBookingSchema = z.object({
  courtId: z.string().uuid(),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/, "Start time must be on :00 or :30"),
  memberId: z.string().uuid().optional(),
  walkIn: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone"),
  }).optional(),
}).refine(d => d.memberId || d.walkIn, {
  message: "Either a member or walk-in details are required",
});
```

```js
// server/src/middleware/validate.js
export const validate = (schema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    req.body = result.data;
    next();
  };
```

---

## 8. Auth and Role-Based Access

| Item | Choice |
|---|---|
| Login | Email/phone + password, bcrypt hash check |
| Access token | JWT, 15 minutes, sent in `Authorization` header |
| Refresh token | JWT, 7 days, HTTP-only secure cookie |
| Roles (enum) | OWNER, FRONT_DESK, BAR_STAFF, KITCHEN, SHOP_STAFF, MEMBER (Visitor = no login) |
| Backend guard | `authorize(...roles)` middleware on every protected route |
| Frontend guard | `<ProtectedRoute roles={[...]}>` + sidebar shows only allowed menus |

| Route group | Allowed roles |
|---|---|
| `/api/admin/*`, `/api/payroll/*`, `/api/reports/*` | OWNER |
| `/api/members/*`, `/api/bookings/*`, `/api/leads/*` | OWNER, FRONT_DESK |
| `/api/bar/*` | OWNER, BAR_STAFF |
| `/api/kitchen/*` | OWNER, KITCHEN, BAR_STAFF |
| `/api/shop/*`, `/api/inventory/*` | OWNER, SHOP_STAFF |
| `/api/me/*` | MEMBER |
| `/api/public/*` | Anyone (rate limited) |

---

## 9. Testing and Code Quality

| Category | Library | Use |
|---|---|---|
| Backend tests | Jest (or Vitest) + Supertest | API and business-rule tests (overlap, 2/day limit) |
| Frontend tests | Vitest + React Testing Library | Form validation and components |
| Linting | ESLint | Code quality |
| Formatting | Prettier | Consistent code style |
| Git hooks | Husky + lint-staged | Lint before commit |

---

## 10. DevOps and Deployment

| Item | Choice |
|---|---|
| Local database | Docker (`postgres` image) |
| Monorepo | npm workspaces: `client/`, `server/`, `packages/shared/` |
| Frontend hosting | Vercel or Netlify |
| Backend hosting | Render or Railway |
| Database hosting | Neon, Supabase or Railway PostgreSQL |
| Env files | `.env` (never committed), `.env.example` committed |

**Required environment variables**

| Variable | Example / note |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/club` |
| `JWT_ACCESS_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Long random string |
| `CLIENT_URL` | `http://localhost:5173` (for CORS) |
| `RAZORPAY_KEY_ID` | Test key |
| `RAZORPAY_KEY_SECRET` | Test secret |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Email sending |

---

## 11. Folder Structure

The project uses a **modular (feature-based)** structure: each feature (members, bookings, bar-orders, …) has its own folder with routes, controller, service and validation. The full tree, file responsibilities, naming rules and starter code are in **`folder-structure.md`**.

```
sports-club/
├── client/                 # React + Vite (.jsx), src/modules/<feature>/
├── server/                 # Express + Prisma, src/modules/<feature>/
│   └── prisma/             # schema.prisma, migrations, seed.js
└── packages/
    └── shared/             # Zod schemas + constants (@club/shared)
```
