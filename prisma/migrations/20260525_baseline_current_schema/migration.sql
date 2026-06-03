-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WalletProvider" AS ENUM ('GCASH', 'MAYA');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('CASH_IN', 'CASH_OUT');

-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RESTOCK', 'ADJUSTMENT', 'SALE');

-- CreateTable
CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "lowerBound" DOUBLE PRECISION NOT NULL,
    "upperBound" DOUBLE PRECISION NOT NULL,
    "chargeAmount" DOUBLE PRECISION NOT NULL,
    "transactionTypeKey" TEXT NOT NULL DEFAULT 'gcash_cashin',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "entityId" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "joinDate" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_types" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isOutflow" BOOLEAN NOT NULL DEFAULT false,
    "walletAccount" TEXT NOT NULL DEFAULT 'GCash',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_categories" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_transactions" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "relatedTransactionSyncId" TEXT,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "feeType" TEXT NOT NULL,
    "chargeDestination" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "transactionId" TEXT,
    "deviceId" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "reference" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL,
    "walletDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mayaWalletDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onHandDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recordedFlow" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tag" TEXT NOT NULL DEFAULT '',
    "iconKey" TEXT NOT NULL DEFAULT '',
    "walletAccount" TEXT NOT NULL DEFAULT '',
    "ownerScope" TEXT NOT NULL DEFAULT 'Business',
    "ownerMovementType" TEXT,
    "ownerCategory" TEXT,
    "ownerPartyName" TEXT,
    "ownerPartyAccount" TEXT,
    "entryDate" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "syncId" TEXT,
    "deviceId" TEXT,
    "walletProvider" "WalletProvider" NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "chargeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "chargeLowerBound" DOUBLE PRECISION,
    "chargeUpperBound" DOUBLE PRECISION,
    "chargeHandling" TEXT NOT NULL DEFAULT 'addOnTop',
    "receiptImagePath" TEXT,
    "receiptOriginalName" TEXT,
    "receiptMimeType" TEXT,
    "receiptUploadedAt" TIMESTAMP(3),
    "ocrStatus" "OcrStatus" NOT NULL DEFAULT 'PENDING',
    "ocrExtractedAmount" DOUBLE PRECISION,
    "ocrRawText" TEXT,
    "ocrProcessedAt" TIMESTAMP(3),
    "externalProvider" TEXT,
    "externalTransactionId" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "reference" TEXT NOT NULL DEFAULT '',
    "entryDate" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "examples" TEXT DEFAULT '',
    "isQuickAccess" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelf_locations" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "examples" TEXT DEFAULT '',
    "imageUrl" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelf_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "syncId" TEXT,
    "deviceId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'General',
    "baseUnit" TEXT NOT NULL DEFAULT 'pcs',
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "stockInBaseUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "shelfLocation" TEXT DEFAULT 'Counter',
    "expirationDate" TIMESTAMP(3),
    "categoryId" TEXT,
    "shelfLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "movementType" "StockMovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "previousQuantity" DOUBLE PRECISION NOT NULL,
    "newQuantity" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "reference" TEXT NOT NULL DEFAULT '',
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_unit_conversions" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "conversionFactor" DOUBLE PRECISION NOT NULL,
    "costPrice" DECIMAL(12,2) NOT NULL,
    "sellingPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "deviceId" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL,
    "changeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "selectedUnit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "computedBaseQuantity" DOUBLE PRECISION NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utang_records" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utang_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charges_syncId_key" ON "charges"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "parties_syncId_key" ON "parties"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_types_syncId_key" ON "transaction_types"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "movement_categories_syncId_key" ON "movement_categories"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "fee_transactions_syncId_key" ON "fee_transactions"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_syncId_key" ON "ledger_entries"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_syncId_key" ON "transactions"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_syncId_key" ON "product_categories"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_locations_syncId_key" ON "shelf_locations"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_locations_name_key" ON "shelf_locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_syncId_key" ON "products"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "stock_movements_productId_createdAt_idx" ON "stock_movements"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_unit_conversions_syncId_key" ON "product_unit_conversions"("syncId");

-- CreateIndex
CREATE INDEX "product_unit_conversions_productId_idx" ON "product_unit_conversions"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_reference_key" ON "sales"("reference");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- CreateIndex
CREATE INDEX "utang_records_customerId_createdAt_idx" ON "utang_records"("customerId", "createdAt");

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shelfLocationId_fkey" FOREIGN KEY ("shelfLocationId") REFERENCES "shelf_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_unit_conversions" ADD CONSTRAINT "product_unit_conversions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utang_records" ADD CONSTRAINT "utang_records_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

