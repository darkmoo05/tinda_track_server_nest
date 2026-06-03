/*
  Warnings:

  - A unique constraint covering the columns `[syncId]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[syncId]` on the table `sales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[syncId]` on the table `utang_records` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "syncId" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "syncId" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "utang_records" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "syncId" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "customers_syncId_key" ON "customers"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_syncId_key" ON "sales"("syncId");

-- CreateIndex
CREATE UNIQUE INDEX "utang_records_syncId_key" ON "utang_records"("syncId");
