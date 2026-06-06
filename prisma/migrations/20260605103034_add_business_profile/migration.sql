-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT,
    "businessType" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'PHP',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_syncId_key" ON "business_profiles"("syncId");

-- CreateIndex
CREATE INDEX "business_profiles_updatedAt_idx" ON "business_profiles"("updatedAt");

-- CreateIndex
CREATE INDEX "business_profiles_deviceId_idx" ON "business_profiles"("deviceId");

-- CreateIndex
CREATE INDEX "business_profiles_userId_idx" ON "business_profiles"("userId");

-- CreateIndex
CREATE INDEX "business_profiles_userId_updatedAt_idx" ON "business_profiles"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
