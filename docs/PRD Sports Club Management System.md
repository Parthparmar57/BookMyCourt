# PRD: Sports Club Management System

Oct 3, 2026 · @YGB

## 1. Overview

We will build one unified platform that runs The Champions Club: members, court bookings, the gear shop, the bar and cafeteria, the public website, and the owner's money in one place. Every sale, booking and payment lands in the same database, so the owner sees the whole club on one dashboard.

### The problem today

| Area | How it runs today | Pain |
| --- | --- | --- |
| Court bookings | WhatsApp messages | Double bookings, missed requests |
| Member lists | Excel sheets | No plan tracking, no expiry alerts |
| Bar receipts | Paper | Lost tabs, kitchen confusion, no daily total |
| Court availability | Phone calls | Front desk overloaded at peak hours |
| Revenue and operations | No visibility | Owner losing money, cannot plan |

### Product goals

| # | Goal | How we know it works |
| --- | --- | --- |
| G1 | Zero double bookings | System rejects any overlapping booking on the same court |
| G2 | Members recognised in seconds | Search by phone, name, ID or QR returns the profile instantly |
| G3 | No lost bar tabs or orders | Every order is digital, tied to a table or member, visible to the kitchen |
| G4 | One shared stock for shop | Counter and online sales reduce the same stock count |
| G5 | Club found online | Public website shows plans, prices, availability, shop and trial booking |
| G6 | Owner sees all money in one place | Dashboard shows revenue by source and payment mode for day, week, month |

## 2. Problem statement explained

The Champions Club has courts, a gear shop, and a bar and cafeteria, with members on three plans: Gold (premium, full access), Silver (standard) and Junior (under 18, discounted). The PS walks through one week at the club in six scenes; each scene is a set of requirements.

| Scene | What happens | What the system must do |
| --- | --- | --- |
| 1. A new member walks in | Someone signs up at the front desk | Record who they are and their plan; know what the plan gives (court rates, shop and bar discounts); track expiry automatically; let any staff recognise them fast and see their history |
| 2. Booking a court on a busy evening | 6 pm rush: messages, a walk-in, a phone call all at once | 1-hour sessions starting every 30 minutes; max 2 bookings per member per day; members pay less or nothing, walk-ins pay full; handle cancellations and plan changes; Friday social play with many people per court; never two bookings on the same court at the same time |
| 3. Gearing up before a match | A string snaps 10 minutes before play; another member orders shoes from home | Sell rackets, balls, shoes, accessories, apparel; track stock and warn when low; counter sales and online orders use the same stock; online orders can be picked up or delivered |
| 4. After the match, at the bar | 20 people arrive at once; paper orders and lost tabs | Digital orders sent to the kitchen; tables tracked; member discount applied automatically; open tabs settled before leaving; cash, card or UPI; staff shifts; daily earnings at closing |
| 5. A stranger finds the club online | Someone searches for a place to play nearby | Public website with club info, plans, prices, this week's availability, shop; trial booking; enquiries are captured, followed up, quoted and converted to members |
| 6. The owner, at the end of the month | "How much did we earn, from where, and what do we owe?" | All income from courts, shop and bar in one place by payment mode; invoices for memberships and business clients; payroll; leave approval; tax reports; dashboards for today, week, month; shareable reports |

Note: the PS intro says tennis, padel and badminton, but the club description says tennis and cricket courts. Sports and courts will be configurable so either works.

## 3. Users and roles

The system has seven role-based users; each login sees only the screens its role needs.

| # | Role | Who | Can do | Cannot do |
| --- | --- | --- | --- | --- |
| 1 | Owner / Admin | Club owner, manager | Everything: settings, plans, prices, courts, menu, products, reports, dashboard, invoices, payroll, leave approval, tax | No limits |
| 2 | Front Desk | Reception staff | Register and renew members, search members, book and cancel courts, walk-in bookings, social play, handle enquiries and follow-ups, request leave | Change prices or plans, see payroll or full financial reports |
| 3 | Bar Staff | Bar and cafeteria counter staff | Manage tables, take orders, open and settle member tabs, take payments (cash/card/UPI), open and close shift, view own shift report, request leave | Edit menu prices, see other modules' revenue |
| 4 | Kitchen | Cooks and kitchen helpers | View incoming orders on kitchen screen, mark orders Preparing and Served | Take payments, see bills, members or reports |
| 5 | Shop Staff | Gear shop counter staff | Counter sales, add stock, view low-stock alerts, pack and fulfil online orders, update order status, request leave | Change product prices, see payroll or full reports |
| 6 | Member | Gold, Silver, Junior members | Portal: book and cancel courts, join social play, order gear online, view tab, history and expiry, renew membership, view digital member card | See other members' data or any staff screens |
| 7 | Visitor | Public, not logged in | View website, plans, prices, this week's availability and shop; book a trial session; send an enquiry | Book as a member, order from shop, see any private data |

### Role hierarchy

&#91;embedded content: role hierarchy · 7 roles, 5 levels\]

The Owner sits above three peer staff roles; Kitchen sits under Bar Staff. Below the line are customers: a Visitor becomes a Member by signing up.

| Level | Role | Reports to | Access scope | Why it sits here |
| --- | --- | --- | --- | --- |
| 1 | Owner / Admin | No one | Whole system | Sets prices, plans and staff; sees all money; approves leave and payroll |
| 2 | Front Desk | Owner | Members, bookings, CRM | Runs the daily front office; first contact for members and walk-ins |
| 2 | Bar Staff | Owner | Bar POS, tables, tabs, own shift | Handles bar and cafeteria sales and payments |
| 2 | Shop Staff | Owner | Shop POS, inventory, online orders | Handles gear sales and stock |
| 3 | Kitchen | Bar Staff (orders flow from bar) | Kitchen order screen only | Prepares food; never handles money or customer data |
| 4 | Member | None (customer) | Own profile, bookings, orders, tab | Logged-in user who sees only their own data |
| 5 | Visitor | None (public) | Public website pages | No login; sees only public information |

**Hierarchy rules**

- Higher sees more: the Owner sees everything any lower role sees; each staff role sees only its own module.
- Level 2 roles are peers: Front Desk, Bar Staff and Shop Staff do not see each other's areas; only the Owner sees all three together.
- Kitchen sits under Bar: it works only on orders Bar Staff create, so it has the smallest staff access.
- A Member can do everything a Visitor can, plus see their own private data.
- Money approvals go up to the Owner: refunds, price changes, extra discounts, leave and payroll.

## 4. Modules

The system has nine modules. Membership and the Ledger are the shared core: every other module reads members and writes money.

| # | Module | Solves scene | Main users |
| --- | --- | --- | --- |
| M1 | Membership | 1. New member | Front Desk, Member |
| M2 | Court Booking | 2. Busy evening | Front Desk, Member, Visitor |
| M3 | Gear Shop and Inventory | 3. Gearing up | Shop Staff, Member |
| M4 | Bar and Cafeteria POS | 4. At the bar | Bar Staff, Kitchen |
| M5 | Public Website | 5. Stranger online | Visitor |
| M6 | CRM / Leads | 5. Stranger online | Front Desk, Owner |
| M7 | Accounting and Invoicing | 6. Owner | Owner |
| M8 | HR and Payroll | 6. Owner | Owner, all staff (leave requests) |
| M9 | Owner Dashboard and Reports | 6. Owner | Owner |

## 5. Functional requirements

Each table lists the forms or screens, their key fields, and the features and rules they must support.

### M1. Membership

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Plan Setup | Name (Gold/Silver/Junior), price, duration, court rate, free sessions, shop discount %, bar discount %, max bookings per day, age limit | Admin-editable; benefits stored as data, not hard-coded |
| Member Registration | Name, phone, email, date of birth, photo, plan, start date, emergency contact | Auto member ID and QR card; Junior allowed only under 18; end date calculated from plan |
| Member Search | Name, phone, member ID, QR scan | Result in under 1 second from any staff screen |
| Member Profile | Details, plan, status, expiry, bookings, purchases, bar tabs, payments | Full history in one view |
| Renewal / Upgrade | Member, new plan, payment mode | Extends expiry; pro-rated upgrade; creates invoice |
| Expiry Reminders | Automatic | Email/SMS at 15, 7 and 1 days before expiry; status becomes Expired on end date |

### M2. Court Booking

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Court Setup | Court name, sport, opening hours, walk-in rate, status (open/maintenance) | Sports configurable |
| Availability Grid | Date, sport, court | Slots every 30 minutes, colour-coded free / booked / social play |
| Booking Form | Member or walk-in, court, date, start time, price, payment mode | 60-minute session; overlap check; 2-per-day limit; price auto-set by plan |
| Walk-in Booking | Name, phone, court, time, payment | Full walk-in rate |
| Cancellation | Booking, reason, refund | Slot freed immediately; refund per policy |
| Social Play Session | Court, Friday date and time, max players, fee per player | Many players share one court; join and leave list |

### M3. Gear Shop and Inventory

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Product Master | Name, category, SKU, brand, size/colour variant, price, tax %, image | Categories: rackets, balls, shoes, accessories, apparel |
| Stock In | Product, supplier, quantity, cost, date | Increases stock |
| Low-Stock Alert | Reorder level per product | Alert when stock falls below level |
| Counter Sale (POS) | Member or guest, items, payment mode | Auto member discount; reduces stock |
| Online Order | Items, pickup or delivery, address, payment | Same stock as counter; cannot order out-of-stock items |
| Order Tracking | Status: Placed, Packed, Ready / Shipped, Delivered | Member notified at each step |

### M4. Bar and Cafeteria POS

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Menu Setup | Item, category, price, tax %, available | Admin-managed |
| Table Layout | Table number, capacity, status | Free / occupied view |
| New Order | Table, member or guest, items, notes | Sent to kitchen screen instantly |
| Kitchen Screen | Order, table, items, status (New, Preparing, Served) | Replaces paper slips |
| Member Tab | Member, running items, total | Open tab, settle before leaving; auto plan discount |
| Bill and Payment | Items, discount, tax, total, payment mode | Cash, card or UPI; split bill; receipt |
| Shift | Staff, start and end time, opening and closing cash | Sales recorded per shift |
| Daily Closing | Date | Total sales by payment mode and staff; cash difference |

### M5. Public Website

| Page / Form | Content | Features and rules |
| --- | --- | --- |
| Home / About | Club info, sports, photos, location | Mobile-friendly, search-engine friendly |
| Plans and Prices | From Plan Setup | Always current |
| Availability | This week's free slots | Live from Court Booking |
| Shop | From Product Master | Browse; members can order |
| Trial Booking | Name, phone, email, sport, date and time | Creates a booking and a lead |
| Enquiry Form | Name, phone, email, interest, message | Creates a lead; notifies staff |

### M6. CRM / Leads

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Lead | Name, contact, source, interest, assigned staff | Auto-created from website |
| Pipeline Board | Stages: New, Contacted, Quoted, Won, Lost | Drag-and-drop board |
| Follow-up | Lead, date, type (call/email/visit), notes | Reminder on due date |
| Quotation | Lead, plan, price, discount, valid until | Sent as PDF; Won converts lead to member |

### M7. Accounting and Invoicing

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Transaction Ledger | Date, source (court/shop/bar/membership), amount, tax, payment mode, reference | Every sale posts here automatically |
| Membership Invoice | Member, plan, period, amount, tax | Auto-created on join or renewal |
| Business Client Invoice | Company, tax ID, services, amount, due date | For corporate bookings and events |
| Payment Received | Invoice, amount, mode, date | Tracks what clients still owe |
| Expenses / Bills | Vendor, category, amount, due date, paid status | Tracks what the club owes |
| Tax Report | Period | Tax collected by category; export |

### M8. HR and Payroll

| Form / Screen | Key fields | Features and rules |
| --- | --- | --- |
| Employee | Name, role, joining date, salary, bank details | Linked to staff login |
| Shift Roster | Employee, date, shift time | Weekly view |
| Attendance | Employee, date, check-in, check-out | Feeds payroll |
| Leave Request | Employee, type, dates, reason | Owner approves or rejects; leave balance |
| Payroll | Month, employee, basic, allowances, deductions, net pay | Payslip generated |

### M9. Owner Dashboard and Reports

| Screen | Shows | Features |
| --- | --- | --- |
| Dashboard | Revenue today, this week, this month by source | KPI cards and charts |
| Payment Mode Split | Cash, card, UPI, online | Chart |
| Court Utilisation | Occupancy % by court and hour | Peak-hour view |
| Membership Stats | Active, expiring soon, new, expired by plan | Renewal list |
| Inventory Report | Stock value, low stock, best sellers | Reorder planning |
| Receivables / Payables | Money owed to and by the club | Ageing view |
| Export / Share | Any report | PDF and Excel download, email |

## 6. Key business rules

These rules come straight from the PS and must be enforced by the system, not left to staff.

| ID | Rule | Where enforced |
| --- | --- | --- |
| BR1 | A session is 60 minutes; start times are every 30 minutes | Booking form, availability grid |
| BR2 | No two bookings may overlap on the same court (a 6:00 booking blocks a 6:30 start) | Database constraint on time ranges, plus UI check |
| BR3 | A member can book at most 2 sessions per day | Booking form |
| BR4 | Court price depends on plan: walk-in full rate, members reduced or free | Booking form, pulled from Plan Setup |
| BR5 | Friday social play allows many players on one court, up to a set maximum | Social Play Session |
| BR6 | Junior plan only for members under 18 | Member Registration |
| BR7 | Membership expires on its end date; reminders sent before | Scheduled job |
| BR8 | Expired members are charged as walk-ins and get no discounts | Booking, shop and bar POS |
| BR9 | Member discounts apply automatically at shop and bar | Shop POS, online order, bar bill |
| BR10 | Counter and online sales share one stock; no sale below zero stock | Inventory |
| BR11 | Every payment posts to one ledger with source and payment mode | Ledger |
| BR12 | A bar tab must be settled before the member's tab is closed for the day | Bar POS, daily closing |

## 7. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Concurrency | Two people booking the same slot at the same moment: exactly one succeeds |
| Performance | Member search and availability check return in under 1 second |
| Security | Role-based access; hashed passwords; payments through a payment gateway, no card data stored |
| Devices | Desktop for front desk and owner; tablet for bar and kitchen; mobile for members and visitors |
| Notifications | Email or SMS/WhatsApp for booking confirmation, expiry, order status, new leads |
| Audit | Log who created, changed or cancelled bookings, sales and invoices |
| Data export | Reports downloadable as PDF and Excel |
| Configurability | Sports, courts, plans, prices, discounts and menu editable without code changes |

## 8. Core data entities

These are the main database tables; Member and Transaction connect every module.

| Entity | Key attributes | Linked to |
| --- | --- | --- |
| User | id, name, email, password hash, role | Member, Employee |
| Plan | name, price, duration, court rate, discounts, max bookings/day | Member |
| Member | member ID, user, plan, start date, end date, status, QR code | Booking, Order, Tab, Invoice |
| Court | name, sport, hours, walk-in rate, status | Booking |
| Booking | court, member or walk-in, start, end, type (normal/social), price, status | Court, Member, Transaction |
| SocialParticipant | booking, member or guest, fee | Booking |
| Product | name, category, variant, price, tax, stock, reorder level | OrderItem |
| Order | member, channel (counter/online/bar), table, fulfilment, status, total | OrderItem, Transaction |
| OrderItem | order, product or menu item, quantity, price | Order |
| MenuItem | name, category, price, tax | OrderItem |
| BarTable | number, capacity, status | Order |
| Transaction | date, source, amount, tax, payment mode, reference | Ledger for all modules |
| Invoice | customer (member or company), items, amount, due date, status | Transaction |
| Lead | name, contact, source, stage, assigned staff | Quotation, Member |
| Employee | user, role, salary, bank details | Shift, Leave, Payslip |
| Shift | employee, start, end, opening cash, closing cash | Order |
| LeaveRequest | employee, type, dates, status | Employee |

## 9. Priority and MVP scope (24-hour hackathon)

Build P0 fully, P1 working, and P2 only if time is left; a complete P0 + P1 beats a half-built everything.

| Priority | Module / Feature | Scope for the hackathon |
| --- | --- | --- |
| P0 | Membership | Plans, registration, search, profile, expiry status |
| P0 | Court Booking | Grid, booking, overlap block, 2-per-day limit, plan pricing, cancel, social play |
| P0 | Ledger + Owner Dashboard | Revenue by source and payment mode, today / week / month |
| P1 | Bar POS | Tables, orders, kitchen screen, tabs, auto discount, daily closing |
| P1 | Gear Shop | Products, stock, low-stock alert, counter sale, online order with pickup/delivery |
| P1 | Public Website | Plans, prices, availability, shop, trial booking, enquiry form |
| P2 | CRM pipeline | Lead board, follow-ups, quotation |
| P2 | Invoicing and Tax | Membership and business invoices, basic tax report |
| P2 | HR and Payroll | Employees, shifts, leave approval, simple payslip |

### Suggested timeline

| Hours | Work |
| --- | --- |
| 0–2 | Scope, database design, project setup, login and roles |
| 2–8 | Membership and Court Booking |
| 8–12 | Bar POS and kitchen screen |
| 12–16 | Gear Shop and online orders |
| 16–19 | Public website, enquiry form, Ledger and Dashboard |
| 19–21 | P2 items if time allows |
| 21–23 | UI polish, realistic demo data, bug fixes |
| 23–24 | Demo rehearsal: walk through the week, end on the owner dashboard |

### Suggested tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React / Next.js |
| Backend | Node.js (Express) or Django |
| Database | PostgreSQL (exclusion constraint prevents overlapping bookings) |
| Payments | Razorpay test mode for card and UPI |
| Charts | Recharts or Chart.js |
| Alternative | Odoo: use its POS, eCommerce, Website, CRM, Invoicing, Payroll apps and build only a custom Court Booking module |

## 10. Success metrics and assumptions

### Success metrics

| Metric | Target |
| --- | --- |
| Double bookings | 0 |
| Time to find a member | Under 5 seconds |
| Time to book a court at the desk | Under 30 seconds |
| Bar orders on paper | 0 |
| Sales recorded in the ledger | 100% of court, shop and bar sales |
| Enquiries without follow-up | 0 |

### Assumptions

- The club is in India, so payments include UPI and invoices include GST.
- Sports and courts are configurable, because the PS mentions both tennis/padel/badminton and tennis/cricket.
- Kitchen staff have their own Kitchen login that opens only the kitchen order screen.
- Delivery for online shop orders is arranged by the club; no courier integration in the MVP.
- Refund policy for cancellations is set by the owner (for example, full refund if cancelled 2+ hours before).
