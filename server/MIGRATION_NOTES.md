# Migration & Run Notes — Production Hardening

These steps apply the schema and database-level changes introduced by the
production-hardening work. Run them against your database (dev first).

## 1. Environment

`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are now **required** (min 32 chars)
and have no fallback — the app refuses to start without them. Generate real ones:

```bash
openssl rand -hex 32   # run twice, one per secret
```

`RAZORPAY_*` and `SMTP_*` are optional: if unset, online payments return 503 and
email is silently skipped (no fake keys are ever used). See `.env.example`.

## 2. Install & generate

```bash
npm install
npx prisma generate
```

## 3. Sync schema

New columns/models: `Booking.cancelReason/cancelledById/cancelledAt/refundAmount`,
`AuditLog`, `MenuItem.name @unique`, `SocialParticipant @@unique([bookingId, memberId])`.

```bash
npx prisma db push        # dev
# or: npx prisma migrate dev --name production_hardening
```

## 4. Apply DB-level invariants (NOT expressible in Prisma schema)

These are the authoritative guarantees for no-double-booking, no-overselling and
one-open-tab-per-member:

```bash
psql "$DATABASE_URL" -f prisma/migrations/manual_constraints.sql
# or:
npx prisma db execute --file prisma/migrations/manual_constraints.sql --schema prisma/schema.prisma
```

This creates:
- `booking_no_overlap` — GiST EXCLUDE constraint (requires `btree_gist`) blocking
  overlapping non-cancelled bookings on the same court.
- `product_stock_nonneg` — CHECK (stock >= 0).
- `bartab_one_open_per_member` — partial unique index for one OPEN tab per member.

## 5. Seed (optional, dev)

```bash
npm run db:seed
```

## 6. Run

```bash
npm run dev      # or: npm start
```
