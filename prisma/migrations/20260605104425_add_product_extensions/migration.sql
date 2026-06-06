-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockMovementType" ADD VALUE 'WASTE';
ALTER TYPE "StockMovementType" ADD VALUE 'PRODUCTION_DEDUCTION';
ALTER TYPE "StockMovementType" ADD VALUE 'PRODUCTION_ENTRY';
ALTER TYPE "StockMovementType" ADD VALUE 'RETURN_TO_VENDOR';
ALTER TYPE "StockMovementType" ADD VALUE 'CUSTOMER_RETURN';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "customAttributes" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "itemType" TEXT NOT NULL DEFAULT 'standard';

-- CreateTable
CREATE TABLE "product_serial_numbers" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "serialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_recipe_ingredients" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "recipeProductId" TEXT NOT NULL,
    "ingredientProductId" TEXT NOT NULL,
    "userId" TEXT,
    "quantityNeeded" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_serial_numbers_syncId_key" ON "product_serial_numbers"("syncId");

-- CreateIndex
CREATE INDEX "product_serial_numbers_productId_idx" ON "product_serial_numbers"("productId");

-- CreateIndex
CREATE INDEX "product_serial_numbers_updatedAt_idx" ON "product_serial_numbers"("updatedAt");

-- CreateIndex
CREATE INDEX "product_serial_numbers_userId_idx" ON "product_serial_numbers"("userId");

-- CreateIndex
CREATE INDEX "product_serial_numbers_userId_updatedAt_idx" ON "product_serial_numbers"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_serial_numbers_productId_serialNumber_key" ON "product_serial_numbers"("productId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "product_recipe_ingredients_syncId_key" ON "product_recipe_ingredients"("syncId");

-- CreateIndex
CREATE INDEX "product_recipe_ingredients_recipeProductId_idx" ON "product_recipe_ingredients"("recipeProductId");

-- CreateIndex
CREATE INDEX "product_recipe_ingredients_ingredientProductId_idx" ON "product_recipe_ingredients"("ingredientProductId");

-- CreateIndex
CREATE INDEX "product_recipe_ingredients_updatedAt_idx" ON "product_recipe_ingredients"("updatedAt");

-- CreateIndex
CREATE INDEX "product_recipe_ingredients_userId_idx" ON "product_recipe_ingredients"("userId");

-- CreateIndex
CREATE INDEX "product_recipe_ingredients_userId_updatedAt_idx" ON "product_recipe_ingredients"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_recipe_ingredients_recipeProductId_ingredientProduc_key" ON "product_recipe_ingredients"("recipeProductId", "ingredientProductId");

-- AddForeignKey
ALTER TABLE "product_serial_numbers" ADD CONSTRAINT "product_serial_numbers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serial_numbers" ADD CONSTRAINT "product_serial_numbers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recipe_ingredients" ADD CONSTRAINT "product_recipe_ingredients_recipeProductId_fkey" FOREIGN KEY ("recipeProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recipe_ingredients" ADD CONSTRAINT "product_recipe_ingredients_ingredientProductId_fkey" FOREIGN KEY ("ingredientProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recipe_ingredients" ADD CONSTRAINT "product_recipe_ingredients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
