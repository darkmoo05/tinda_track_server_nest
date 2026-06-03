-- AlterTable
ALTER TABLE "charges" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "parties" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "transaction_types" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "movement_categories" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "fee_transactions" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "ledger_entries" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "transactions" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "product_categories" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "shelf_locations" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "products" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "product_unit_conversions" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "sales" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "customers" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "utang_records" RENAME COLUMN "user_id" TO "userId";

-- Rename Indexes
ALTER INDEX "charges_user_id_idx" RENAME TO "charges_userId_idx";
ALTER INDEX "parties_user_id_idx" RENAME TO "parties_userId_idx";
ALTER INDEX "transaction_types_user_id_idx" RENAME TO "transaction_types_userId_idx";
ALTER INDEX "movement_categories_user_id_idx" RENAME TO "movement_categories_userId_idx";
ALTER INDEX "fee_transactions_user_id_idx" RENAME TO "fee_transactions_userId_idx";
ALTER INDEX "ledger_entries_user_id_idx" RENAME TO "ledger_entries_userId_idx";
ALTER INDEX "transactions_user_id_idx" RENAME TO "transactions_userId_idx";
ALTER INDEX "product_categories_user_id_idx" RENAME TO "product_categories_userId_idx";
ALTER INDEX "shelf_locations_user_id_idx" RENAME TO "shelf_locations_userId_idx";
ALTER INDEX "products_user_id_idx" RENAME TO "products_userId_idx";
ALTER INDEX "product_unit_conversions_user_id_idx" RENAME TO "product_unit_conversions_userId_idx";
ALTER INDEX "sales_user_id_idx" RENAME TO "sales_userId_idx";
ALTER INDEX "customers_user_id_idx" RENAME TO "customers_userId_idx";
ALTER INDEX "utang_records_user_id_idx" RENAME TO "utang_records_userId_idx";

-- Rename Constraints
ALTER TABLE "charges" RENAME CONSTRAINT "charges_user_id_fkey" TO "charges_userId_fkey";
ALTER TABLE "parties" RENAME CONSTRAINT "parties_user_id_fkey" TO "parties_userId_fkey";
ALTER TABLE "transaction_types" RENAME CONSTRAINT "transaction_types_user_id_fkey" TO "transaction_types_userId_fkey";
ALTER TABLE "movement_categories" RENAME CONSTRAINT "movement_categories_user_id_fkey" TO "movement_categories_userId_fkey";
ALTER TABLE "fee_transactions" RENAME CONSTRAINT "fee_transactions_user_id_fkey" TO "fee_transactions_userId_fkey";
ALTER TABLE "ledger_entries" RENAME CONSTRAINT "ledger_entries_user_id_fkey" TO "ledger_entries_userId_fkey";
ALTER TABLE "transactions" RENAME CONSTRAINT "transactions_user_id_fkey" TO "transactions_userId_fkey";
ALTER TABLE "product_categories" RENAME CONSTRAINT "product_categories_user_id_fkey" TO "product_categories_userId_fkey";
ALTER TABLE "shelf_locations" RENAME CONSTRAINT "shelf_locations_user_id_fkey" TO "shelf_locations_userId_fkey";
ALTER TABLE "products" RENAME CONSTRAINT "products_user_id_fkey" TO "products_userId_fkey";
ALTER TABLE "product_unit_conversions" RENAME CONSTRAINT "product_unit_conversions_user_id_fkey" TO "product_unit_conversions_userId_fkey";
ALTER TABLE "sales" RENAME CONSTRAINT "sales_user_id_fkey" TO "sales_userId_fkey";
ALTER TABLE "customers" RENAME CONSTRAINT "customers_user_id_fkey" TO "customers_userId_fkey";
ALTER TABLE "utang_records" RENAME CONSTRAINT "utang_records_user_id_fkey" TO "utang_records_userId_fkey";
