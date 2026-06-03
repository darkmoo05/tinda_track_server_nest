-- DropIndex
DROP INDEX IF EXISTS "products_sku_key";

-- CreateIndex
CREATE UNIQUE INDEX "products_userId_sku_key" ON "products"("userId", "sku");
