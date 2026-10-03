-- Database-level invariants that Prisma schema cannot express.
-- Apply AFTER `prisma db push` / `prisma migrate` with:
--   psql "$DATABASE_URL" -f prisma/migrations/manual_constraints.sql
-- (or: npx prisma db execute --file prisma/migrations/manual_constraints.sql --schema prisma/schema.prisma)
-- All statements are idempotent-safe to re-run.

-- Required for an EXCLUDE constraint that mixes equality (uuid) with a range (&&).
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- BR2 / G1: no two non-cancelled bookings may overlap on the same court.
-- This is the authoritative guarantee — two concurrent inserts cannot both win.
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS booking_no_overlap;
ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "courtId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  )
  WHERE (status <> 'CANCELLED');

-- BR10: stock can never go negative.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS product_stock_nonneg;
ALTER TABLE "Product"
  ADD CONSTRAINT product_stock_nonneg CHECK (stock >= 0);

-- A member may have at most one OPEN bar tab at a time.
DROP INDEX IF EXISTS bartab_one_open_per_member;
CREATE UNIQUE INDEX bartab_one_open_per_member
  ON "BarTab" ("memberId")
  WHERE status = 'OPEN';
