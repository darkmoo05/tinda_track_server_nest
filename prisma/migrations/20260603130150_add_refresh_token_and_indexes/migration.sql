-- DropIndex
DROP INDEX "customers_userId_idx";

-- DropIndex
DROP INDEX "ledger_entries_userId_idx";

-- DropIndex
DROP INDEX "product_categories_userId_idx";

-- DropIndex
DROP INDEX "products_userId_idx";

-- DropIndex
DROP INDEX "sales_userId_idx";

-- DropIndex
DROP INDEX "shelf_locations_userId_idx";

-- DropIndex
DROP INDEX "transactions_userId_idx";

-- DropIndex
DROP INDEX "utang_records_userId_idx";

-- AlterTable
ALTER TABLE "device_syncs" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "charges_updatedAt_idx" ON "charges"("updatedAt");

-- CreateIndex
CREATE INDEX "charges_deviceId_idx" ON "charges"("deviceId");

-- CreateIndex
CREATE INDEX "customers_userId_updatedAt_idx" ON "customers"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "customers_deviceId_idx" ON "customers"("deviceId");

-- CreateIndex
CREATE INDEX "fee_transactions_updatedAt_idx" ON "fee_transactions"("updatedAt");

-- CreateIndex
CREATE INDEX "fee_transactions_deviceId_idx" ON "fee_transactions"("deviceId");

-- CreateIndex
CREATE INDEX "ledger_entries_userId_updatedAt_idx" ON "ledger_entries"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ledger_entries_deviceId_idx" ON "ledger_entries"("deviceId");

-- CreateIndex
CREATE INDEX "movement_categories_updatedAt_idx" ON "movement_categories"("updatedAt");

-- CreateIndex
CREATE INDEX "movement_categories_deviceId_idx" ON "movement_categories"("deviceId");

-- CreateIndex
CREATE INDEX "parties_updatedAt_idx" ON "parties"("updatedAt");

-- CreateIndex
CREATE INDEX "parties_deviceId_idx" ON "parties"("deviceId");

-- CreateIndex
CREATE INDEX "product_categories_userId_updatedAt_idx" ON "product_categories"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "product_unit_conversions_updatedAt_idx" ON "product_unit_conversions"("updatedAt");

-- CreateIndex
CREATE INDEX "products_userId_updatedAt_idx" ON "products"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "products_deviceId_idx" ON "products"("deviceId");

-- CreateIndex
CREATE INDEX "sales_userId_updatedAt_idx" ON "sales"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "sales_deviceId_idx" ON "sales"("deviceId");

-- CreateIndex
CREATE INDEX "shelf_locations_userId_updatedAt_idx" ON "shelf_locations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "transaction_types_updatedAt_idx" ON "transaction_types"("updatedAt");

-- CreateIndex
CREATE INDEX "transaction_types_deviceId_idx" ON "transaction_types"("deviceId");

-- CreateIndex
CREATE INDEX "transactions_userId_updatedAt_idx" ON "transactions"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "transactions_deviceId_idx" ON "transactions"("deviceId");

-- CreateIndex
CREATE INDEX "utang_records_userId_updatedAt_idx" ON "utang_records"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "utang_records_deviceId_idx" ON "utang_records"("deviceId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
