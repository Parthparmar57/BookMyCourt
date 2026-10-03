# BookMyCourt — Backend API Documentation

**Service:** BookMyCourt (The Champions Club Backend)
**Base URL:** `/api`
**Stack:** Node.js · Express · Prisma · PostgreSQL · Razorpay · Socket.IO
**Generated:** 2026-10-03

---

## 1. Conventions

| Aspect | Detail |
|---|---|
| Base path | All routes are mounted under `/api` (e.g. `/api/auth/login`). |
| Auth scheme | JWT. Send `Authorization: Bearer <accessToken>` header **or** an `accessToken` cookie. |
| Token refresh | `POST /api/auth/refresh` issues a new access token using the refresh token. |
| Validation | Request `body`, `params`, and `query` are validated by Zod schemas (`src/shared/schemas`). Invalid input → `400`. |
| Authorization | Role-gated via `authorize(...roles)` middleware. Missing/invalid token → `401`; wrong role → `403`. |
| Rate limits | Global: 1000 req / 15 min. Auth (`/auth/register`,`/auth/login`): 20 / 15 min. Public (`/public/*`): 100 / 15 min. |
| Real-time | Socket.IO channels for live court bookings and kitchen queue. |

### Roles

`OWNER` · `FRONT_DESK` · `BAR_STAFF` · `KITCHEN` · `SHOP_STAFF` · `MEMBER`

- **Public** = no authentication required.
- **optionalAuth** = works with or without a token; response may be enriched (e.g. member pricing) when logged in.

---

## 2. Module Overview

| # | Module | Base Path(s) | Purpose |
|---|---|---|---|
| 1 | Auth | `/auth` | Registration, login, token refresh, session identity. |
| 2 | Users | `/users` | Staff user administration (OWNER only). |
| 3 | Membership | `/membership`, `/plans`, `/members` | Plans catalogue & member lifecycle. |
| 4 | Courts | `/courts`, `/bookings`, `/social-play` | Courts, bookings, availability, social play. |
| 5 | Shop | `/shop`, `/products`, `/inventory`, `/shop-orders` | Pro-shop catalogue, stock, retail orders. |
| 6 | Bar | `/bar`, `/menu`, `/bar-tables`, `/bar-orders`, `/tabs`, `/kitchen`, `/shifts` | F&B menu, tables, tabs, kitchen, cash shifts. |
| 7 | CRM | `/crm`, `/public`, `/enquiries`, `/leads` | Public website intake, enquiries, sales leads. |
| 8 | Finance | `/finance`, `/payments`, `/ledger`, `/invoices`, `/expenses` | Razorpay, ledger, invoices, expenses. |
| 9 | HR | `/hr`, `/employees`, `/attendance`, `/leave`, `/payroll` | Staff HR records, attendance, leave, payroll. |
| 10 | Dashboard | `/dashboard` | Owner KPIs and court utilisation. |
| 11 | Reports | `/reports` | Tax, inventory, membership reports + Excel export. |

---

## 3. Auth (`/api/auth`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/auth/register` | Public (rate-limited) | — | Register a new user account. |
| POST | `/auth/login` | Public (rate-limited) | — | Authenticate; returns access + refresh tokens. |
| POST | `/auth/refresh` | Public | — | Exchange a valid refresh token for a new access token. |
| POST | `/auth/logout` | Public | — | Clear session / invalidate cookies. |
| GET | `/auth/me` | Bearer | Any logged-in | Return the current authenticated user's profile. |

---

## 4. Users (`/api/users`)

> All routes require **OWNER**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all staff users. |
| GET | `/users/:id` | Get a single user. |
| POST | `/users` | Create a staff user. |
| PATCH | `/users/:id` | Update a user. |
| DELETE | `/users/:id` | Delete a user. |

---

## 5. Membership

### 5.1 Plans (`/api/plans`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/plans` | optionalAuth | — | List membership plans. |
| GET | `/plans/:id` | Public | — | Get one plan. |
| POST | `/plans` | Bearer | OWNER | Create a plan. |
| PATCH | `/plans/:id` | Bearer | OWNER | Update a plan. |
| DELETE | `/plans/:id` | Bearer | OWNER | Delete a plan. |

### 5.2 Members (`/api/members`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/members` | OWNER, FRONT_DESK | Register a new member (auto member no. + QR). |
| GET | `/members` | OWNER, FRONT_DESK, BAR_STAFF, SHOP_STAFF | Search members. |
| GET | `/members/:id` | OWNER, FRONT_DESK, BAR_STAFF, SHOP_STAFF, MEMBER | Get member profile. |
| POST | `/members/:id/renew` | OWNER, FRONT_DESK, MEMBER | Renew membership. |

---

## 6. Courts

### 6.1 Courts (`/api/courts`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/courts` | optionalAuth | — | List courts. |
| GET | `/courts/:id` | Public | — | Get one court. |
| POST | `/courts` | Bearer | OWNER | Create a court. |
| PATCH | `/courts/:id` | Bearer | OWNER | Update a court. |
| DELETE | `/courts/:id` | Bearer | OWNER | Delete a court. |

### 6.2 Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/bookings/availability` | optionalAuth | — | Check slot availability for a court/date. |
| GET | `/bookings` | Bearer | OWNER, FRONT_DESK, MEMBER | List bookings. |
| POST | `/bookings` | Bearer | OWNER, FRONT_DESK, MEMBER | Create a booking (DB-level overlap prevention). |
| PATCH | `/bookings/:id/cancel` | Bearer | OWNER, FRONT_DESK, MEMBER | Cancel a booking (with reason/refund). |

### 6.3 Social Play (`/api/social-play`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/social-play` | optionalAuth | — | List social play sessions. |
| POST | `/social-play` | Bearer | OWNER, FRONT_DESK | Create a social session. |
| POST | `/social-play/:id/join` | Bearer | OWNER, FRONT_DESK, MEMBER | Join a session (member or guest). |
| DELETE | `/social-play/:id/participants/:participantId` | Bearer | OWNER, FRONT_DESK, MEMBER | Remove a participant / leave. |

---

## 7. Shop

### 7.1 Products (`/api/products`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/products` | optionalAuth | — | List products. |
| GET | `/products/:id` | Public | — | Get one product. |
| POST | `/products` | Bearer | OWNER, SHOP_STAFF | Create a product. |
| PATCH | `/products/:id` | Bearer | OWNER, SHOP_STAFF | Update a product. |
| DELETE | `/products/:id` | Bearer | OWNER | Delete a product. |

### 7.2 Inventory (`/api/inventory`)

> All routes require **OWNER** or **SHOP_STAFF**.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/inventory/stock-in` | Record stock receipt (supplier, qty, cost). |
| GET | `/inventory/logs` | List inventory movement logs. |
| GET | `/inventory/low-stock` | List products at/below reorder level. |

### 7.3 Shop Orders (`/api/shop-orders`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/shop-orders` | OWNER, SHOP_STAFF, MEMBER | Create a retail order. |
| GET | `/shop-orders` | OWNER, SHOP_STAFF, MEMBER | List orders. |
| GET | `/shop-orders/:id` | Any logged-in | Get one order. |
| PATCH | `/shop-orders/:id/status` | OWNER, SHOP_STAFF | Update order status (fulfilment). |

---

## 8. Bar / F&B

### 8.1 Menu (`/api/menu`)

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/menu` | optionalAuth | — | List menu items. |
| POST | `/menu` | Bearer | OWNER | Create a menu item. |
| PATCH | `/menu/:id` | Bearer | OWNER | Update a menu item. |
| DELETE | `/menu/:id` | Bearer | OWNER | Delete a menu item. |

### 8.2 Bar Tables (`/api/bar-tables`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/bar-tables` | OWNER, BAR_STAFF, KITCHEN | List tables and statuses. |
| POST | `/bar-tables` | OWNER, BAR_STAFF | Create a table. |
| PATCH | `/bar-tables/:id` | OWNER, BAR_STAFF | Update table (status/capacity). |
| DELETE | `/bar-tables/:id` | OWNER | Delete a table. |

### 8.3 Bar Orders (`/api/bar-orders`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/bar-orders` | OWNER, BAR_STAFF | Create a bar order. |
| GET | `/bar-orders` | OWNER, BAR_STAFF, KITCHEN | List bar orders. |
| POST | `/bar-orders/:id/settle` | OWNER, BAR_STAFF | Settle / pay a bar order. |

### 8.4 Tabs (`/api/tabs`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/tabs` | OWNER, BAR_STAFF | Open a member tab. |
| GET | `/tabs` | OWNER, BAR_STAFF, MEMBER | List tabs. |
| GET | `/tabs/:id` | OWNER, BAR_STAFF, MEMBER | Get one tab. |
| POST | `/tabs/:id/settle` | OWNER, BAR_STAFF | Settle a tab. |

### 8.5 Kitchen (`/api/kitchen`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/kitchen/queue` | OWNER, KITCHEN, BAR_STAFF | Live kitchen order queue. |
| PATCH | `/kitchen/:id/status` | OWNER, KITCHEN, BAR_STAFF | Update item/order prep status. |

### 8.6 Shifts (`/api/shifts`)

> All routes require **OWNER** or **BAR_STAFF**.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/shifts/open` | Open a cash shift (opening cash). |
| POST | `/shifts/:id/close` | Close a shift (closing/actual cash reconciliation). |
| GET | `/shifts/active` | Get the currently open shift. |
| GET | `/shifts/:id/report` | Shift report (sales, cash variance). |

---

## 9. CRM

### 9.1 Public Website (`/api/public`)

> All routes are **public** (rate-limited to 100 / 15 min).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/public/enquiry` | Submit a website enquiry. |
| POST | `/public/trial` | Book a trial session. |
| GET | `/public/plans` | Public plans listing. |
| GET | `/public/availability` | Public court availability. |
| GET | `/public/shop` | Public shop catalogue. |

### 9.2 Enquiries (`/api/enquiries`)

> All routes require **OWNER** or **FRONT_DESK**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/enquiries` | List enquiries. |
| PATCH | `/enquiries/:id/status` | Update enquiry status. |

### 9.3 Leads (`/api/leads`)

> All routes require **OWNER** or **FRONT_DESK**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/leads` | List leads. |
| POST | `/leads` | Create a lead. |
| GET | `/leads/:id` | Get a lead. |
| PATCH | `/leads/:id` | Update a lead (stage, assignment). |
| POST | `/leads/:id/follow-ups` | Add a follow-up entry. |
| POST | `/leads/:id/quotations` | Create a quotation for a lead. |
| PATCH | `/leads/quotations/:id/status` | Update quotation status. |
| POST | `/leads/:id/convert` | Convert a lead into a member. |

---

## 10. Finance

### 10.1 Payments (`/api/payments`)

> Roles: **OWNER, FRONT_DESK, MEMBER, SHOP_STAFF, BAR_STAFF**.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments/create-order` | Create a Razorpay order. |
| POST | `/payments/verify` | Verify a Razorpay payment signature. |

### 10.2 Ledger (`/api/ledger`)

> All routes require **OWNER**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ledger` | List transactions. |
| GET | `/ledger/summary` | Ledger summary by source/mode. |

### 10.3 Invoices (`/api/invoices`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/invoices` | OWNER | Create an invoice. |
| GET | `/invoices` | OWNER, FRONT_DESK, MEMBER | List invoices. |
| GET | `/invoices/:id` | OWNER, FRONT_DESK, MEMBER | Get one invoice. |
| GET | `/invoices/:id/pdf` | OWNER, FRONT_DESK, MEMBER | Download invoice PDF. |
| POST | `/invoices/:id/payment` | OWNER | Record a payment against an invoice. |

### 10.4 Expenses (`/api/expenses`)

> All routes require **OWNER**.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/expenses` | Create an expense. |
| GET | `/expenses` | List expenses. |
| PATCH | `/expenses/:id/pay` | Mark an expense as paid. |

---

## 11. HR

### 11.1 Employees (`/api/employees`)

> All routes require **OWNER**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List employees. |
| POST | `/employees` | Create an employee. |
| GET | `/employees/:id` | Get an employee. |
| PATCH | `/employees/:id` | Update an employee. |

### 11.2 Attendance (`/api/attendance`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/attendance/check-in` | OWNER, FRONT_DESK, BAR_STAFF, KITCHEN, SHOP_STAFF | Staff check-in. |
| POST | `/attendance/check-out` | OWNER, FRONT_DESK, BAR_STAFF, KITCHEN, SHOP_STAFF | Staff check-out. |
| GET | `/attendance` | OWNER | List attendance records. |

### 11.3 Leave (`/api/leave`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/leave` | Any logged-in | Request leave. |
| GET | `/leave` | Any logged-in | List leave requests. |
| PATCH | `/leave/:id/status` | OWNER | Approve / reject a leave request. |

### 11.4 Payroll (`/api/payroll`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/payroll/run` | OWNER | Run payroll for a month/year. |
| GET | `/payroll` | OWNER | List payroll records. |
| PATCH | `/payroll/:id/status` | OWNER | Update payroll status (processed/paid). |

---

## 12. Dashboard (`/api/dashboard`)

> All routes require **OWNER**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | KPI summary (revenue, bookings, members). |
| GET | `/dashboard/utilisation` | Court utilisation metrics. |

---

## 13. Reports (`/api/reports`)

> All routes require **OWNER**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/tax` | GST / tax report. |
| GET | `/reports/tax/export` | Export tax report as Excel. |
| GET | `/reports/inventory` | Inventory report. |
| GET | `/reports/inventory/export` | Export inventory report as Excel. |
| GET | `/reports/membership` | Membership report. |

---

## 14. System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check (status, timestamp, service name). |

---

## 15. Real-time (Socket.IO)

| Channel | Source | Purpose |
|---|---|---|
| Booking events | `src/sockets/booking.socket.js` | Live court booking/availability updates. |
| Kitchen events | `src/sockets/kitchen.socket.js` | Live kitchen order queue updates. |

---

## 16. Data Model (Prisma)

Each table below maps to a Prisma model in `prisma/schema.prisma`.

| Table | Key Fields | Notable Features |
|---|---|---|
| **User** | id, name, email*, phone*, passwordHash, role | Root identity; 1:1 to Member/Employee; relations to bookings, leads, approved leaves. |
| **Plan** | id, name*, price, durationMonths, courtRate, freeSessions, shop/barDiscountPct, maxBookingsDay, maxAge | Membership plan catalogue; drives pricing & perks. |
| **Member** | id, memberNo*, userId*, planId, dob, status, qrCode, startDate, endDate | Member lifecycle; QR for check-in; relations to bookings, orders, tabs, invoices. |
| **Court** | id, name*, sport, openTime, closeTime, walkInRate, isOpen | Bookable court with operating hours and walk-in rate. |
| **Booking** | id, courtId, memberId?, walkIn fields, startTime, endTime, type, status, price, maxPlayers, cancel fields, refundAmount | **GiST EXCLUDE** constraint prevents overlapping bookings; indexed on court/time. |
| **SocialParticipant** | id, bookingId, memberId?, guest fields, fee, paymentStatus | Unique (bookingId, memberId) — member joins a session once; guests unconstrained. |
| **Product** | id, name, category, sku*, brand, variant, price, taxPct(18), stock, reorderLevel, imageUrl | Pro-shop catalogue; indexed on sku & category. |
| **InventoryLog** | id, productId, supplier, quantity, cost, type(STOCK_IN), notes, date | Stock movement audit trail. |
| **MenuItem** | id, name*, category, price, taxPct(5), isAvailable | Bar/kitchen menu catalogue. |
| **BarTable** | id, number*, capacity, status | Physical table state (AVAILABLE/OCCUPIED/RESERVED). |
| **BarTab** | id, memberId, status, openedAt, settledAt, totalAmount, notes | Running member tab; settles into orders. |
| **Shift** | id, employeeId, startTime, endTime, opening/closing/expected/actualCash, status | Cash-drawer reconciliation per staff shift. |
| **Order** | id, orderNo*, memberId?, channel, barTable?, barTab?, shift?, status, fulfilment, delivery fields, subtotal, discount, tax, total, paymentMode/Status | Unified order for shop & bar; indexed on orderNo/status/channel. |
| **OrderItem** | id, orderId, productId?, menuItemId?, quantity, unitPrice, taxPct, totalPrice | Line item linking to product or menu item. |
| **Transaction** | id, transactionNo*, date, source, amount, tax, paymentMode, reference, order?/booking?/invoice?/member? | Central ledger entry; indexed on date/source/paymentMode. |
| **Invoice** | id, invoiceNo*, member?, company/gstin/clientEmail, type, amount, tax, total, dueDate, status | Membership & business invoicing; PDF export; indexed on invoiceNo/status. |
| **InvoiceItem** | id, invoiceId, description, quantity, unitPrice, taxPct, total | Invoice line item. |
| **Expense** | id, expenseNo*, vendor, category, amount, tax, dueDate, paidDate, status, paymentMode, reference | Vendor expense tracking; indexed on status. |
| **Lead** | id, name, phone, email, source, interest, stage, assignedToId? | Sales pipeline; relations to quotations, follow-ups, trials; indexed on stage. |
| **Quotation** | id, quotationNo*, leadId, planId?, amount, discount, total, validUntil, status, pdfUrl | Quote generated for a lead. |
| **LeadFollowUp** | id, leadId, date, type(CALL), notes, status(SCHEDULED) | Follow-up activity log. |
| **Employee** | id, userId*, employeeNo*, designation, joiningDate, salary, bank/ifsc/pan, leaveBalance(18) | HR record; relations to shifts, leaves, payrolls, attendance. |
| **Attendance** | id, employeeId, date, checkIn, checkOut, status | Unique (employeeId, date) — one record per day. |
| **LeaveRequest** | id, employeeId, type, startDate, endDate, days, reason, status, approvedById? | Leave workflow (PENDING/APPROVED/REJECTED). |
| **Payroll** | id, payrollNo*, employeeId, month, year, basic/allowances/deductions/netSalary, status, paidDate, payslipUrl | Unique (employeeId, month, year); payslip export. |
| **Enquiry** | id, name, phone, email, interest, message, status(NEW) | Website enquiry capture. |
| **AuditLog** | id, actorId?, action, entity, entityId?, meta(Json) | System audit trail; indexed on entity/entityId & actorId. |
| **TrialBooking** | id, name, phone, email, sport, preferredDate/Time, status(PENDING), courtId?, leadId? | Public trial requests; convertible to leads. |

\* = unique constraint

### Enums

| Enum | Values |
|---|---|
| Role | OWNER, FRONT_DESK, BAR_STAFF, KITCHEN, SHOP_STAFF, MEMBER |
| BookingStatus | CONFIRMED, CANCELLED, COMPLETED |
| BookingType | NORMAL, SOCIAL |
| MemberStatus | ACTIVE, EXPIRED, SUSPENDED |
| OrderChannel | COUNTER, ONLINE, BAR |
| OrderStatus | PLACED, PREPARING, SERVED, PACKED, READY, SHIPPED, DELIVERED, COMPLETED, CANCELLED |
| FulfilmentType | DINE_IN, PICKUP, DELIVERY |
| PaymentMode | CASH, CARD, UPI, ONLINE |
| PaymentStatus | PENDING, PAID, REFUNDED, FAILED |
| ProductCategory | RACKETS, BALLS, SHOES, ACCESSORIES, APPAREL |
| MenuCategory | BEVERAGES, SNACKS, MEALS, DESSERTS, HEALTH_DRINKS |
| TableStatus | AVAILABLE, OCCUPIED, RESERVED |
| TabStatus | OPEN, SETTLED |
| ShiftStatus | OPEN, CLOSED |
| TransactionSource | COURT, SHOP, BAR, MEMBERSHIP, OTHER |
| InvoiceStatus | DRAFT, SENT, PAID, OVERDUE, CANCELLED |
| InvoiceType | MEMBERSHIP, BUSINESS |
| ExpenseStatus | UNPAID, PAID |
| LeadStage | NEW, CONTACTED, QUOTED, WON, LOST |
| QuotationStatus | DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED |
| LeaveType | CASUAL, SICK, PAID, UNPAID |
| LeaveStatus | PENDING, APPROVED, REJECTED |
| AttendanceStatus | PRESENT, ABSENT, HALF_DAY, ON_LEAVE |
| PayrollStatus | DRAFT, PROCESSED, PAID |

---

*Endpoint counts: 11 modules · ~90 REST endpoints · 27 data models. Backward-compatible top-level aliases (`/plans`, `/members`, `/bookings`, etc.) are mounted alongside grouped module paths — both resolve to the same handlers.*
