# BookMyCourt: Enterprise Sports Club Management & ERP Platform

BookMyCourt is a unified, full-stack enterprise resource planning (ERP) and operations management platform engineered specifically for premier sports clubs, racket arenas, padel centers, and athletic complexes. The platform consolidates high-frequency court booking, tiered membership lifecycles, real-time commercial point-of-sale (kitchen, cafeteria, and pro shop), customer relationship management (CRM), double-entry financial ledger accounting, and human resource administration into a single reactive architecture.

---

## 1. System Architecture

The application is structured into decoupled client and server workspaces with transactional database guarantees, relational data integrity, and bidirectional real-time synchronization.

### 1.1 Architecture Topology

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Application (React 19 + Vite)"]
        A1["Public Visitor Portal"]
        A2["Member Self-Service Portal"]
        A3["Staff Operations (Front Desk, Bar POS, KDS, Shop)"]
        A4["Executive Admin Suite (Owner Analytics & HR)"]
    end

    subgraph NetworkLayer ["Transport & API Gateway"]
        B1["HTTP/REST API with JSON Schema Validation (Zod)"]
        B2["WebSocket Gateway (Socket.IO Real-time Events)"]
        B3["Secure HTTP-Only Cookie Session Management"]
    end

    subgraph ServerLayer ["Backend Service Layer (Express.js)"]
        C1["Authentication & RBAC Middleware"]
        C2["Court Reservation & Pricing Engine"]
        C3["Bar Tab & POS Processing Engine"]
        C4["Kitchen Display Queue Orchestrator"]
        C5["Financial Ledger & GST Invoice Engine"]
        C6["Staff Payroll & Leave Lifecycle Service"]
    end

    subgraph DataLayer ["Persistence & Database (PostgreSQL + Prisma)"]
        D1[("PostgreSQL Relational Storage")]
        D2["PostgreSQL GiST Range Exclusion Constraints"]
        D3["Prisma ORM Client & Query Engine"]
    end

    A1 -->|REST Calls| B1
    A2 -->|REST + WS| B1
    A2 -->|Live Updates| B2
    A3 -->|REST + WS| B1
    A3 -->|Live Orders & Bookings| B2
    A4 -->|REST + Analytics| B1

    B1 --> C1
    B2 --> C4
    B2 --> C2
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    C1 --> C6

    C2 --> D3
    C3 --> D3
    C4 --> D3
    C5 --> D3
    C6 --> D3

    D3 --> D1
    D2 -.->|Guarantees No Overlapping Slots| D1
```

### 1.2 Technology Stack

- **Client**: React 19, Tailwind CSS v4, Recharts, Lucide React, HTML5 QR Scanner, TanStack React Query, React Router DOM v7.
- **Server**: Node.js, Express.js (ES Modules), Pino Structured Logging, Zod Validation, Socket.IO, PDFKit, ExcelJS, BCrypt.
- **Database & Data Access**: PostgreSQL 15+, Prisma ORM 5.20+, PostgreSQL GiST temporal exclusion constraints for double-booking prevention.
- **Security**: Role-Based Access Control (RBAC), Helmet HTTP headers, CORS whitelisting, Express Rate Limiting, HTTP-only JWT cookies.

---

## 2. Complete Database Entity Relationship Diagram (ERD)

The data model enforces strict referential integrity across identity, athletic facilities, retail, hospitality, finance, sales, and personnel management.

```mermaid
erDiagram
    USER ||--o| MEMBER : "registers as"
    USER ||--o| EMPLOYEE : "employed as"
    USER ||--o{ BOOKING : "creates"
    USER ||--o{ LEAD : "assigned to"
    USER ||--o{ LEAVE_REQUEST : "approves"

    PLAN ||--o{ MEMBER : "assigns tier"
    PLAN ||--o{ QUOTATION : "quoted in"

    MEMBER ||--o{ BOOKING : "books"
    MEMBER ||--o{ SOCIAL_PARTICIPANT : "participates in"
    MEMBER ||--o{ ORDER : "places"
    MEMBER ||--o{ BAR_TAB : "maintains"
    MEMBER ||--o{ INVOICE : "billed via"
    MEMBER ||--o{ TRANSACTION : "settles"

    COURT ||--o{ BOOKING : "hosts"
    COURT ||--o{ TRIAL_BOOKING : "schedules"

    BOOKING ||--o{ SOCIAL_PARTICIPANT : "contains"
    BOOKING ||--o{ TRANSACTION : "generates"

    PRODUCT ||--o{ ORDER_ITEM : "ordered as"
    PRODUCT ||--o{ INVENTORY_LOG : "tracked by"

    MENU_ITEM ||--o{ ORDER_ITEM : "prepared as"

    BAR_TABLE ||--o{ ORDER : "assigned to"
    BAR_TAB ||--o{ ORDER : "aggregates"
    SHIFT ||--o{ ORDER : "rings up"

    ORDER ||--o{ ORDER_ITEM : "comprises"
    ORDER ||--o{ TRANSACTION : "settled through"

    INVOICE ||--o{ INVOICE_ITEM : "itemizes"
    INVOICE ||--o{ TRANSACTION : "paid by"

    EMPLOYEE ||--o{ SHIFT : "works"
    EMPLOYEE ||--o{ LEAVE_REQUEST : "submits"
    EMPLOYEE ||--o{ PAYROLL : "receives"

    LEAD ||--o{ QUOTATION : "receives"
    LEAD ||--o{ LEAD_FOLLOW_UP : "logged with"
    LEAD ||--o{ TRIAL_BOOKING : "books trial"

    USER {
        string id PK
        string name
        string email UK
        string phone UK
        string passwordHash
        enum role
        datetime createdAt
        datetime updatedAt
    }

    PLAN {
        string id PK
        string name UK
        decimal price
        int durationMonths
        decimal courtRate
        int freeSessions
        int shopDiscountPct
        int barDiscountPct
        int maxBookingsDay
        int maxAge
    }

    MEMBER {
        string id PK
        string memberNo UK
        string userId FK
        string planId FK
        datetime dob
        string emergencyContact
        enum status
        string qrCode
        datetime startDate
        datetime endDate
    }

    COURT {
        string id PK
        string name UK
        string sport
        string openTime
        string closeTime
        decimal walkInRate
        boolean isOpen
    }

    BOOKING {
        string id PK
        string courtId FK
        string memberId FK
        string createdById FK
        string walkInName
        string walkInPhone
        datetime startTime
        datetime endTime
        enum type
        enum status
        decimal price
        int maxPlayers
        decimal refundAmount
    }

    SOCIAL_PARTICIPANT {
        string id PK
        string bookingId FK
        string memberId FK
        string guestName
        string guestPhone
        decimal fee
        enum paymentStatus
    }

    PRODUCT {
        string id PK
        string name
        enum category
        string sku UK
        string brand
        string variant
        decimal price
        decimal taxPct
        int stock
        int reorderLevel
    }

    INVENTORY_LOG {
        string id PK
        string productId FK
        string supplier
        int quantity
        decimal cost
        string type
        datetime date
    }

    MENU_ITEM {
        string id PK
        string name UK
        enum category
        decimal price
        decimal taxPct
        boolean isAvailable
    }

    BAR_TABLE {
        string id PK
        string number UK
        int capacity
        enum status
    }

    BAR_TAB {
        string id PK
        string memberId FK
        enum status
        datetime openedAt
        datetime settledAt
        decimal totalAmount
    }

    SHIFT {
        string id PK
        string employeeId FK
        datetime startTime
        datetime endTime
        decimal openingCash
        decimal closingCash
        decimal expectedCash
        decimal actualCash
        enum status
    }

    ORDER {
        string id PK
        string orderNo UK
        string memberId FK
        string barTableId FK
        string barTabId FK
        string shiftId FK
        enum channel
        enum status
        enum fulfilment
        decimal subtotal
        decimal discount
        decimal tax
        decimal total
        enum paymentMode
        enum paymentStatus
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        string menuItemId FK
        int quantity
        decimal unitPrice
        decimal taxPct
        decimal totalPrice
    }

    TRANSACTION {
        string id PK
        string transactionNo UK
        datetime date
        enum source
        decimal amount
        decimal tax
        enum paymentMode
        string reference
        string orderId FK
        string bookingId FK
        string invoiceId FK
        string memberId FK
    }

    INVOICE {
        string id PK
        string invoiceNo UK
        string memberId FK
        string companyName
        string gstin
        string clientEmail
        enum type
        decimal amount
        decimal tax
        decimal total
        datetime dueDate
        enum status
    }

    INVOICE_ITEM {
        string id PK
        string invoiceId FK
        string description
        int quantity
        decimal unitPrice
        decimal taxPct
        decimal total
    }

    EXPENSE {
        string id PK
        string expenseNo UK
        string vendor
        string category
        decimal amount
        decimal tax
        datetime dueDate
        datetime paidDate
        enum status
        enum paymentMode
        string reference
    }

    LEAD {
        string id PK
        string name
        string phone
        string email
        string source
        string interest
        enum stage
        string assignedToId FK
    }

    QUOTATION {
        string id PK
        string quotationNo UK
        string leadId FK
        string planId FK
        decimal amount
        decimal discount
        decimal total
        datetime validUntil
        enum status
        string pdfUrl
    }

    LEAD_FOLLOW_UP {
        string id PK
        string leadId FK
        datetime date
        string type
        string status
    }

    TRIAL_BOOKING {
        string id PK
        string name
        string phone
        string email
        string sport
        datetime preferredDate
        string preferredTime
        enum status
        string courtId FK
        string leadId FK
    }

    EMPLOYEE {
        string id PK
        string userId FK
        string employeeNo UK
        string designation
        datetime joiningDate
        decimal salary
        string bankAccountNo
        string ifscCode
        string panNo
        int leaveBalance
    }

    LEAVE_REQUEST {
        string id PK
        string employeeId FK
        string approvedById FK
        enum type
        date startDate
        date endDate
        int days
        enum status
    }

    PAYROLL {
        string id PK
        string payrollNo UK
        string employeeId FK
        int month
        int year
        decimal basicSalary
        decimal allowances
        decimal deductions
        decimal netSalary
        enum status
        datetime paidDate
        string payslipUrl
    }
```

---

## 3. Core Business & Operational Flows

### 3.1 Court Booking & Concurrency Protection Flow

The court booking engine dynamically resolves rates based on membership status and prevents conflicting slot reservations using database-enforced concurrency locks.

```mermaid
sequenceDiagram
    autonumber
    actor Player as Member / Walk-in
    participant Client as Frontend Interface
    participant Guard as API & Auth Guard
    participant Engine as Booking & Pricing Service
    participant DB as PostgreSQL Database
    participant WS as WebSocket Broadcaster

    Player->>Client: Select Court, Date, and Time Range
    Client->>Guard: POST /api/bookings/calculate-price
    Guard->>Engine: Validate Plan Tier, Day Quota & Time of Day
    Engine-->>Client: Return Effective Rate (Tier Discount or Walk-in Rate)

    Player->>Client: Confirm Reservation
    Client->>Guard: POST /api/bookings
    Guard->>Engine: Initiate Transaction
    Engine->>DB: Begin Serializable/Write Lock
    Engine->>DB: Check Temporal Collision (GiST Range Constraint)
    alt Time Slot Already Reserved
        DB-->>Engine: Conflict Detected (EXCLUDE Constraint Triggered)
        Engine-->>Client: 409 Conflict: Slot Occupied
    else Time Slot Available
        Engine->>DB: Insert Booking Record (Status: CONFIRMED)
        Engine->>DB: Record Financial Transaction (Source: COURT)
        DB-->>Engine: Commit Transaction
        Engine->>WS: Emit 'booking:created' Event
        WS-->>Client: Push Live Slot Refresh to Active Screens
        Engine-->>Client: 201 Created: Booking Confirmation
    end
```

### 3.2 Kitchen Display System (KDS) & Bar Tab Lifecycle

Handles orders initiated from the Bar POS or Member Portal with real-time station routing and tab management.

```mermaid
sequenceDiagram
    autonumber
    actor BarStaff as Barista / Waiter
    participant POS as Bar POS Terminal
    participant TabService as Bar Tab Service
    participant OrderService as Order Processing Service
    participant KDS as Kitchen Display Terminal
    actor Chef as Kitchen Staff

    BarStaff->>POS: Select Table / Member Bar Tab
    BarStaff->>POS: Add Menu Items & Modifiers
    POS->>OrderService: POST /api/bar/orders (Channel: BAR, Status: PLACED)
    OrderService->>TabService: Append Subtotal to Open Member Tab
    OrderService->>KDS: WebSocket Emit 'order:placed'
    KDS-->>Chef: Visual Display Card & Notification Sound
    
    Chef->>KDS: Click 'Start Preparation'
    KDS->>OrderService: PATCH /api/kitchen/queue/:id/status (PREPARING)
    OrderService->>POS: WebSocket Emit 'order:status_changed'
    
    Chef->>KDS: Click 'Mark as Served'
    KDS->>OrderService: PATCH /api/kitchen/queue/:id/status (SERVED)
    OrderService->>KDS: Archive Ticket to Completed Orders
    
    BarStaff->>POS: Settle Tab (Cash, Card, UPI, or Member Account)
    POS->>TabService: POST /api/bar/tabs/:id/settle
    TabService->>OrderService: Set Tab Status: SETTLED
    TabService->>OrderService: Create Transaction Ledger Record (Source: BAR)
```

### 3.3 CRM Lead Pipeline to Active Member Conversion

Tracks external customer leads across Kanban stages through quotation generation, trial session, and automated member account creation.

```mermaid
flowchart LR
    L1["Inquiry Source (Website / Walk-in / Instagram)"] --> L2["Lead Record Created (Stage: NEW)"]
    L2 --> L3["Staff Outreach Logged (Stage: CONTACTED)"]
    L3 --> L4["Trial Session Booked (TrialBooking Created)"]
    L4 --> L5["Quotation Generated (Plan Price + Discount PDF)"]
    L5 --> L6{"Client Acceptance Decision"}
    L6 -- Rejected --> L7["Lead Marked as LOST"]
    L6 -- Accepted --> L8["Lead Marked as WON"]
    L8 --> L9["Automated User & Member Record Creation"]
    L9 --> L10["Member No Assigned (e.g. MEM-001042)"]
    L10 --> L11["Membership QR Code Generated & Invoice Issued"]
```

### 3.4 Staff Operations, Attendance & Monthly Payroll Flow

Controls employee shifts, leave balances, and automated salary slip generation.

```mermaid
flowchart TD
    S1["Staff Shift Clock-In (Opening Cash Recorded)"] --> S2["Staff Handles Orders & POS Settlements"]
    S2 --> S3["Shift Clock-Out (Closing Cash Reconciled with Expected Cash)"]

    E1["Employee Leave Application (Casual / Sick / Paid)"] --> E2{"Manager / Owner Review"}
    E2 -- Rejected --> E3["Status: REJECTED (Zero Balance Deducted)"]
    E2 -- Approved --> E4["Status: APPROVED (Leave Balance Deducted)"]

    P1["Monthly Payroll Run Triggered"] --> P2["Calculate Base Salary"]
    P2 --> P3["Add Allowances & Subtract Unpaid Leave Deductions"]
    P3 --> P4["Generate Payroll Record (Status: PROCESSED)"]
    P4 --> P5["Generate PDF Payslip & Record Disbursement (Status: PAID)"]
```

---

## 4. Role-Based Access Control (RBAC) Specification

| Capability / Module | Owner / Admin | Front Desk | Bar Staff | Kitchen | Shop Staff | Member |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Executive Financial Dashboard | Yes | No | No | No | No | No |
| Member Directory & KYC Registration | Yes | Yes | No | No | No | No |
| Member QR Scanning & Profile Lookup | Yes | Yes | Yes | No | Yes | Self Only |
| Court Booking Grid & Reservation Override | Yes | Yes | No | No | No | Self Only |
| Social Play Session Orchestration | Yes | Yes | No | No | No | Join Only |
| Bar POS & Table Touch Ordering | Yes | No | Yes | No | No | No |
| Kitchen Display System (KDS) Live Queue | Yes | No | View | Full | No | No |
| Member Bar Tab Settlement | Yes | No | Yes | No | No | Self Only |
| Pro Shop POS & Barcode Scanner Checkout | Yes | No | No | No | Yes | Web Orders |
| Pro Shop Inventory Inward & Reorder Logs | Yes | No | No | No | Yes | No |
| CRM Kanban Pipeline & Quotation Engine | Yes | Yes | No | No | No | No |
| Accounting Ledger, P&L, GST & Invoices | Yes | No | No | No | No | Invoices Only |
| HR Staff Directory, Attendance & Payroll | Yes | No | No | No | No | No |
| Employee Leave Request Submission | No | Yes | Yes | Yes | Yes | No |

---

## 5. REST API Route Directory

All administrative and operational endpoints require valid authorization headers (`Authorization: Bearer <token>` or HTTP-only cookie).

### 5.1 Authentication & Profile (`/api/auth`)
- `POST /api/auth/register`: Public member registration and credential assignment.
- `POST /api/auth/login`: Credential validation and JWT session issuance.
- `POST /api/auth/logout`: Session termination and cookie invalidation.
- `GET /api/auth/me`: Decoded token introspection and identity payload.
- `POST /api/auth/forgot-password`: Password reset dispatch via email.

### 5.2 Courts & Bookings (`/api/courts`, `/api/bookings`)
- `GET /api/courts`: Retrieve full court matrix, operating hours, and sports categories.
- `GET /api/bookings/availability`: Fetch slot matrix for a target court and date.
- `POST /api/bookings`: Create confirmed reservation with overlap conflict validation.
- `POST /api/bookings/:id/cancel`: Cancel reservation, apply refund policy, and release slot.
- `POST /api/bookings/social`: Create public social play session with participant limits.
- `POST /api/bookings/social/:id/join`: Register participant to active social play session.

### 5.3 Members & Membership Plans (`/api/members`, `/api/plans`)
- `GET /api/plans`: Fetch all active membership plan tiers and discount rules.
- `GET /api/members`: Paginated member directory with tier and status filtering.
- `GET /api/members/:id`: Comprehensive member profile, booking history, and active tabs.
- `POST /api/members`: Manual member registration and QR generation.
- `PATCH /api/members/:id`: Update membership tier, contact info, or operational status.

### 5.4 Hospitality POS & Kitchen Display (`/api/bar`, `/api/kitchen`)
- `GET /api/bar/menu`: Retrieve active food and beverage menu catalog.
- `GET /api/bar/tables`: Fetch real-time dining table status (`AVAILABLE`, `OCCUPIED`).
- `POST /api/bar/orders`: Create kitchen order ticket and assign to table or member tab.
- `GET /api/bar/tabs`: List active member bar tabs with aggregated balances.
- `POST /api/bar/tabs/:id/settle`: Full or partial settlement of open bar balance.
- `GET /api/kitchen/queue`: Active KDS queue filtered by `PLACED` and `PREPARING`.
- `PATCH /api/kitchen/queue/:id/status`: Advance ticket state (`PLACED` -> `PREPARING` -> `SERVED`).

### 5.5 Pro Shop Retail & Inventory (`/api/shop`)
- `GET /api/shop/products`: Retrieve retail inventory, price points, and stock balances.
- `POST /api/shop/checkout`: POS checkout transaction with tax calculation and inventory decrement.
- `POST /api/shop/inventory/stock-in`: Log inventory batch receipt and update reorder metrics.

### 5.6 CRM Sales Pipeline (`/api/crm`)
- `GET /api/crm/leads`: Fetch Kanban leads grouped by stage.
- `PATCH /api/crm/leads/:id/stage`: Update lead sales stage.
- `POST /api/crm/quotations`: Generate and persist commercial quotation document.

### 5.7 Human Resources & Payroll (`/api/hr`)
- `GET /api/hr/employees`: Retrieve staff directory, designations, and leave balances.
- `POST /api/hr/leaves`: Submit employee leave application.
- `PATCH /api/hr/leaves/:id/status`: Approve or reject pending leave application.
- `GET /api/hr/payroll`: Fetch monthly payroll runs and individual payslip archives.

### 5.8 Executive Accounting & Intelligence (`/api/dashboard`, `/api/accounting`)
- `GET /api/dashboard/summary`: Executive KPIs (Gross Revenue, Net Profit, Court Utilization, Member Counts).
- `GET /api/accounting/transactions`: Full multi-channel transaction ledger.
- `GET /api/accounting/invoices`: B2B and membership tax invoice records.
- `GET /api/accounting/expenses`: Operational club expense registry.

---

## 6. Directory Structure

```
BookMyCourt/
├── client/                               # Frontend Single Page Application
│   ├── src/
│   │   ├── app/                          # Routing configurations & providers
│   │   ├── context/                      # Auth, Sidebar & Notification context providers
│   │   ├── hooks/                        # Custom React Query & API data hooks
│   │   ├── layouts/                      # AppLayout, PublicLayout, KitchenLayout
│   │   ├── modules/                      # Feature modules
│   │   │   ├── bar/                      # Bar POS & Table management
│   │   │   ├── bookings/                 # Court reservation grids & schedules
│   │   │   ├── crm/                      # Lead pipeline & quotation generator
│   │   │   ├── dashboard/                # Executive owner dashboard & analytics
│   │   │   ├── finance/                  # Accounting, Invoices, Expenses & Tax
│   │   │   ├── hr/                       # Staff directory, leaves, payroll
│   │   │   ├── kitchen/                  # Kitchen Display System (KDS)
│   │   │   ├── members/                  # Member directory, profiles & tabs
│   │   │   ├── shop/                     # Pro shop POS & inventory controls
│   │   │   └── website/                  # Public landing, availability & auth pages
│   │   ├── services/                     # Axios HTTP client API integrations
│   │   └── shared/                       # Reusable UI components & utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Backend Express API & Database Engine
│   ├── prisma/
│   │   ├── schema.prisma                 # Primary database schema & relation definitions
│   │   ├── seed.js                       # 550+ User enterprise master seed dataset
│   │   └── migrations/                   # PostgreSQL schema migrations & GiST constraints
│   ├── src/
│   │   ├── modules/                      # Business domain controllers, services & routes
│   │   │   ├── accounting/               # Financial transactions & ledger services
│   │   │   ├── auth/                     # Authentication & JWT security
│   │   │   ├── bar/                      # Hospitality POS, tables & tab settlement
│   │   │   ├── courts/                   # Court availability & booking logic
│   │   │   ├── crm/                      # CRM leads & quotations
│   │   │   ├── hr/                       # Employee directory, leaves, payroll
│   │   │   ├── membership/               # Member lifecycle & plan tiers
│   │   │   └── shop/                     # Inventory tracking & retail checkout
│   │   ├── shared/                       # Schema validators (Zod), errors, middlewares
│   │   ├── utils/                        # Pricing algorithms, date formatters, tax helpers
│   │   └── server.js                     # Express app initialization & Socket.IO server
│   ├── feed_member_activity.js           # Activity & bar tab seeding script
│   ├── feed_hr_staff.js                  # Staff, attendance & payroll seeding script
│   └── package.json
│
└── README.md                             # Primary technical reference manual
```

---

## 7. Setup & Installation Guide

### 7.1 Prerequisites
- Node.js (version 20 LTS or higher recommended)
- PostgreSQL (version 15 or higher)
- npm (version 10 or higher)

### 7.2 Backend Configuration

1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookmycourt?schema=public"
   JWT_SECRET="enterprise_super_secret_jwt_key_2026"
   CORS_ORIGIN="http://localhost:5173"
   NODE_ENV="development"
   ```

4. Push the schema to PostgreSQL:
   ```bash
   npx prisma db push
   ```

5. Seed the database with the enterprise dataset (550+ users, courts, bar tabs, products, HR staff, and transactions):
   ```bash
   npm run db:feed
   ```
   *(Note: Alternatively, run individual scripts: `npm run db:seed`, `node feed_member_activity.js`, and `node feed_hr_staff.js`)*

6. Start the development backend:
   ```bash
   npm run dev
   ```
   The backend API will start on `http://localhost:5000`.

---

### 7.3 Frontend Configuration

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open on `http://localhost:5173`.

---

## 8. Default System Credentials

| Role | Email | Password | Primary Workspace |
| :--- | :--- | :--- | :--- |
| Owner / Executive Admin | `owner@bookmycourt.com` | `Password@123` | `/admin` |
| Front Desk Receptionist | `frontdesk@bookmycourt.com` | `Password@123` | `/staff/frontdesk` |
| Bar & Cafeteria Staff | `bar@bookmycourt.com` | `Password@123` | `/staff/bar` |
| Kitchen Chef | `kitchen@bookmycourt.com` | `Password@123` | `/staff/kitchen` |
| Pro Shop Retail Staff | `shop@bookmycourt.com` | `Password@123` | `/staff/shop` |
| VIP Member (Gold Tier) | `member@bookmycourt.com` | `Password@123` | `/member` |

---

## 9. Verification & Automated Testing

The backend includes a standalone native test suite that verifies membership verification, pricing calculations, authentication guards, and validation logic.

Execute the test suite from the server directory:
```bash
cd server
npm test
```

Build the client for production verification:
```bash
cd client
npm run build
```
