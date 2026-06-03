-- Migration: add_user_id_to_all_tables
-- Creates the users and device_syncs tables (missing from prior baselines),
-- then adds user_id (nullable FK) to all 14 directly-synced data models.

-- ── Create Role enum ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('OWNER', 'STAFF');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Create users table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
    "id"        TEXT NOT NULL,
    "username"  TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "role"      "Role" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- ── Create device_syncs table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "device_syncs" (
    "deviceId"     TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "device_syncs_pkey" PRIMARY KEY ("deviceId")
);

-- ── Add userId to all 14 data models ─────────────────────────────────────────

-- 1. charges
ALTER TABLE "charges" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "charges_user_id_idx" ON "charges"("user_id");
ALTER TABLE "charges" DROP CONSTRAINT IF EXISTS "charges_user_id_fkey";
ALTER TABLE "charges" ADD CONSTRAINT "charges_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. parties
ALTER TABLE "parties" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "parties_user_id_idx" ON "parties"("user_id");
ALTER TABLE "parties" DROP CONSTRAINT IF EXISTS "parties_user_id_fkey";
ALTER TABLE "parties" ADD CONSTRAINT "parties_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. transaction_types
ALTER TABLE "transaction_types" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "transaction_types_user_id_idx" ON "transaction_types"("user_id");
ALTER TABLE "transaction_types" DROP CONSTRAINT IF EXISTS "transaction_types_user_id_fkey";
ALTER TABLE "transaction_types" ADD CONSTRAINT "transaction_types_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. movement_categories
ALTER TABLE "movement_categories" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "movement_categories_user_id_idx" ON "movement_categories"("user_id");
ALTER TABLE "movement_categories" DROP CONSTRAINT IF EXISTS "movement_categories_user_id_fkey";
ALTER TABLE "movement_categories" ADD CONSTRAINT "movement_categories_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. fee_transactions
ALTER TABLE "fee_transactions" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "fee_transactions_user_id_idx" ON "fee_transactions"("user_id");
ALTER TABLE "fee_transactions" DROP CONSTRAINT IF EXISTS "fee_transactions_user_id_fkey";
ALTER TABLE "fee_transactions" ADD CONSTRAINT "fee_transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. ledger_entries
ALTER TABLE "ledger_entries" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "ledger_entries_user_id_idx" ON "ledger_entries"("user_id");
ALTER TABLE "ledger_entries" DROP CONSTRAINT IF EXISTS "ledger_entries_user_id_fkey";
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. transactions
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("user_id");
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_user_id_fkey";
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. product_categories — drop global name unique, add per-user composite unique
ALTER TABLE "product_categories" DROP CONSTRAINT IF EXISTS "product_categories_name_key";
DROP INDEX IF EXISTS "product_categories_name_key";
ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "product_categories_user_id_idx" ON "product_categories"("user_id");
ALTER TABLE "product_categories" DROP CONSTRAINT IF EXISTS "product_categories_user_id_fkey";
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_userId_name_key" ON "product_categories"("user_id", "name");

-- 9. shelf_locations — drop global name unique, add per-user composite unique
ALTER TABLE "shelf_locations" DROP CONSTRAINT IF EXISTS "shelf_locations_name_key";
DROP INDEX IF EXISTS "shelf_locations_name_key";
ALTER TABLE "shelf_locations" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "shelf_locations_user_id_idx" ON "shelf_locations"("user_id");
ALTER TABLE "shelf_locations" DROP CONSTRAINT IF EXISTS "shelf_locations_user_id_fkey";
ALTER TABLE "shelf_locations" ADD CONSTRAINT "shelf_locations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "shelf_locations_userId_name_key" ON "shelf_locations"("user_id", "name");

-- 10. products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "products_user_id_idx" ON "products"("user_id");
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_user_id_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 11. product_unit_conversions
ALTER TABLE "product_unit_conversions" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "product_unit_conversions_user_id_idx" ON "product_unit_conversions"("user_id");
ALTER TABLE "product_unit_conversions" DROP CONSTRAINT IF EXISTS "product_unit_conversions_user_id_fkey";
ALTER TABLE "product_unit_conversions" ADD CONSTRAINT "product_unit_conversions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. sales
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "sales_user_id_idx" ON "sales"("user_id");
ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_user_id_fkey";
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 13. customers
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "customers_user_id_idx" ON "customers"("user_id");
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_user_id_fkey";
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 14. utang_records
ALTER TABLE "utang_records" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
CREATE INDEX IF NOT EXISTS "utang_records_user_id_idx" ON "utang_records"("user_id");
ALTER TABLE "utang_records" DROP CONSTRAINT IF EXISTS "utang_records_user_id_fkey";
ALTER TABLE "utang_records" ADD CONSTRAINT "utang_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
