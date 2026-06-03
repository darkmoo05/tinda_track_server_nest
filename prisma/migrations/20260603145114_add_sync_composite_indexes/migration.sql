-- CreateIndex
CREATE INDEX "charges_userId_updatedAt_idx" ON "charges"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "fee_transactions_userId_updatedAt_idx" ON "fee_transactions"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "movement_categories_userId_updatedAt_idx" ON "movement_categories"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "parties_userId_updatedAt_idx" ON "parties"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "product_unit_conversions_userId_updatedAt_idx" ON "product_unit_conversions"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "transaction_types_userId_updatedAt_idx" ON "transaction_types"("userId", "updatedAt");
