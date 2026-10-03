# Sports Club Management System: Requirements

> Build the digital backbone of a club that has outgrown WhatsApp and Excel.

## 1. Project Overview

The goal is to build **one unified software platform** that solves the day-to-day operational problems of **The Champions Club**, a busy sports club. The platform must cover court bookings, membership, the gear shop, the bar/cafeteria, the public website, and the owner's finance and HR needs.

## 2. Club Background

| Item | Details |
|---|---|
| Sports / courts | Tennis, padel and badminton (Section 1). Section 2 mentions "tennis and cricket courts". Because of this mismatch, the system should support any sport/court type. |
| Gear shop | Sells rackets, balls, shoes, accessories and apparel |
| Bar & cafeteria | Serves food and drinks after matches |
| Membership tiers | **Gold** (premium, full access), **Silver** (standard), **Junior** (under 18, discounted) |
| Front desk | Handles walk-ins, phone calls and staff schedules |

## 3. Current Problems

| Area | How it works today | Required solution |
|---|---|---|
| Court bookings | Arranged over WhatsApp | Online and front-desk booking system |
| Member lists | Kept in Excel sheets | Central member database |
| Bar receipts | Written on paper | Digital bar POS |
| Court availability | Checked by phone calls | Live availability view |
| Revenue & operations | No visibility at all | Dashboards and reports |

**Impact today:** the owner is losing money, members are frustrated, and staff are overwhelmed.

## 4. User Roles

| Role | Description |
|---|---|
| Owner / Admin | Views finances, reports and dashboards; manages staff, payroll, leave and taxes |
| Front Desk Staff | Registers members, handles bookings for walk-ins and phone calls |
| Shop Staff | Handles counter sales, online orders and stock |
| Bar / Kitchen Staff | Takes orders, manages tables and tabs, prepares orders |
| Member | Books courts, shops online, runs bar tabs, views history |
| Walk-in / Guest | Books courts and pays at full price, buys at the bar or shop |
| Public Visitor | Browses the website, books a trial, sends enquiries |

## 5. Functional Requirements

### Module 1: Membership Management
*Scene: "A new member walks in"*

| ID | Requirement | Feature explanation |
|---|---|---|
| MEM-01 | Register a new member at the front desk | Sign-up form capturing the member's personal details |
| MEM-02 | Assign a plan: Gold, Silver or Junior | Each member is linked to a membership tier |
| MEM-03 | Define what each plan entitles the member to | Plan-based benefits: court rates, shop discount, bar discount |
| MEM-04 | Track membership expiry automatically | Store start and end dates; send automatic expiry reminders; support renewal |
| MEM-05 | Let any staff member recognise a member quickly | Fast search by name, phone or member ID; QR/member card scan |
| MEM-06 | Show the member's history with the club | Member profile with bookings, purchases, bar orders and payments |

### Module 2: Court Booking
*Scene: "Booking a court on a busy evening"*

| ID | Requirement | Feature explanation |
|---|---|---|
| BKG-01 | Handle bookings from messages, walk-ins and phone calls at the same time | One booking system used by the front desk and by members online |
| BKG-02 | Show which courts are free | Real-time availability calendar/grid |
| BKG-03 | Sessions last **1 hour** | Fixed 60-minute booking duration |
| BKG-04 | A new slot opens **every 30 minutes** | Start times at :00 and :30 (overlapping slots) |
| BKG-05 | Each member can play **at most twice a day** | Block a third booking for the same member on the same day |
| BKG-06 | Members pay less than walk-ins, or nothing, depending on their plan | Plan-based pricing (e.g., Gold free, Silver discounted, walk-in full price) |
| BKG-07 | Handle plan changes | Pricing and entitlements update when a member's plan changes |
| BKG-08 | Handle cancellations | Cancel a booking and release the slot |
| BKG-09 | **Friday night social play**: many people share one court | Social play mode with multiple players per court (group capacity) |
| BKG-10 | **Two people must never be on the same court at the same time** | Double-booking prevention, including simultaneous booking attempts |

### Module 3: Gear Shop & Inventory
*Scene: "Gearing up before a match"*

| ID | Requirement | Feature explanation |
|---|---|---|
| SHP-01 | Urgent purchases at the counter | In-club POS for quick billing |
| SHP-02 | Order from home and **collect at the club** | Online shop with click & collect |
| SHP-03 | Order from home and **have it delivered** | Home delivery with order status tracking |
| SHP-04 | Sell rackets, balls, shoes, accessories and apparel | Product catalog with categories |
| SHP-05 | Always know what is in stock | Live inventory tracking |
| SHP-06 | Know when something is running low | Low-stock alerts based on a minimum threshold |
| SHP-07 | Counter and online orders come from the **same shelf** | Single shared inventory for both sales channels |
| SHP-08 | Apply member discounts at the shop | Plan-based discount applied automatically |

### Module 4: Bar & Cafeteria
*Scene: "After the match, at the bar"*

| ID | Requirement | Feature explanation |
|---|---|---|
| BAR-01 | Handle many customers arriving at once (e.g., 20 people) | Fast digital order-taking POS |
| BAR-02 | Replace paper orders and stop tabs from getting lost | Digital orders linked to a customer and table |
| BAR-03 | The kitchen must know who ordered what | Kitchen display or order tickets showing order, table and customer |
| BAR-04 | Members get their discount without asking | Automatic discount once the member is identified |
| BAR-05 | Members can run a **tab** and settle up before leaving | Open tab / running bill per member, closed at checkout |
| BAR-06 | Accept **cash, card and UPI** | Multiple payment methods |
| BAR-07 | Staff work in **shifts** | Shift management; sales tracked per staff member and shift |
| BAR-08 | Track tables | Table management (status, orders per table) |
| BAR-09 | Owner knows what the bar earned that day | End-of-day bar sales / closing report |

### Module 5: Public Website & Lead Management (CRM)
*Scene: "A stranger finds the club online"*

| ID | Requirement | Feature explanation |
|---|---|---|
| WEB-01 | The club must be findable online | Public website, SEO-friendly, with location and contact details |
| WEB-02 | Show the club, its plans and prices | Pages for the club, membership plans and pricing |
| WEB-03 | Show what is free this week | Public court availability view |
| WEB-04 | Show what the shop sells | Public product catalog |
| WEB-05 | Visitors can book a **trial session** on the spot | Online trial-session booking |
| WEB-06 | Enquiries must not vanish | Enquiry/contact form that saves every lead |
| WEB-07 | Someone at the club must hear about it | Staff notification on each new enquiry |
| WEB-08 | Follow up on the enquiry | Lead tracking with status (New → Contacted → Quoted → Converted / Lost) |
| WEB-09 | Send a quote | Quotation generation and sending |
| WEB-10 | Welcome a new member | Convert a lead into a member in one step |

### Module 6: Finance, HR & Reporting
*Scene: "The owner, at the end of the month"*

| ID | Requirement | Feature explanation |
|---|---|---|
| FIN-01 | How much did we earn, and from where? | Revenue report by source: courts, shop, bar |
| FIN-02 | Money arrives by card, cash and online | Revenue report by payment method |
| FIN-03 | What do we owe? | Expense and payables tracking |
| FIN-04 | All money in one place | Central finance dashboard combining all modules |
| FIN-05 | Invoice memberships | Membership invoicing |
| FIN-06 | Invoice business clients | Business/corporate client invoicing |
| FIN-07 | Pay employees | Payroll management |
| FIN-08 | Approve leave | Leave requests and approval workflow |
| FIN-09 | Report taxes | Tax reports (e.g., GST) |
| FIN-10 | See performance today, this week and this month | Dashboard with date-range filters |
| FIN-11 | Share the numbers when needed | Export/share reports (PDF, Excel) |

## 6. Key Business Rules

| Rule | Value |
|---|---|
| Session length | 1 hour |
| Slot interval | Every 30 minutes |
| Max bookings per member per day | 2 |
| Court conflict | Never two bookings on the same court at the same time (except social play) |
| Social play | Friday nights, many players share one court |
| Junior tier | Under 18, discounted |
| Pricing | Members pay less than walk-ins, or nothing, depending on plan |
| Discounts | Applied automatically at the shop and the bar based on plan |
| Payment methods | Cash, card, UPI |
| Inventory | One shared stock for counter and online sales |

## 7. Module Summary

| # | Module | Main users | Key features |
|---|---|---|---|
| 1 | Membership | Front desk, members | Registration, tiers, entitlements, expiry alerts, history |
| 2 | Court Booking | Front desk, members, walk-ins | 1-hr slots, 30-min intervals, 2/day limit, plan pricing, cancellations, social play, no double-booking |
| 3 | Gear Shop | Shop staff, members, online customers | POS, online store, click & collect, delivery, shared inventory, low-stock alerts |
| 4 | Bar & Cafeteria | Bar staff, kitchen, members, guests | Digital orders, kitchen tickets, tabs, auto discounts, cash/card/UPI, shifts, tables, daily report |
| 5 | Website & CRM | Public visitors, staff | Public site, plans/prices, availability, shop, trial booking, enquiry tracking, quotes |
| 6 | Finance & HR | Owner, admin | Revenue reports, payables, invoicing, payroll, leave, taxes, dashboards, sharing |
