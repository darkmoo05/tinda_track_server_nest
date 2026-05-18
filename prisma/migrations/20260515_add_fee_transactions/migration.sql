-- CreateTable: fee_transactions
-- Mirrors the Flutter local SQLite fee_transactions table (DB version 14).
-- Records the service fee collected on each GCash/Maya transaction.

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

-- CreateIndex
CREATE UNIQUE INDEX "fee_transactions_syncId_key" ON "fee_transactions"("syncId");
