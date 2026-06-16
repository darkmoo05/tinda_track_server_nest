-- CreateTable
CREATE TABLE "monitoring_sessions" (
    "id" TEXT NOT NULL,
    "syncId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDateMs" BIGINT NOT NULL,
    "endDateMs" BIGINT,
    "startGcash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startMaya" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startOnHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endGcash" DOUBLE PRECISION,
    "endMaya" DOUBLE PRECISION,
    "endOnHand" DOUBLE PRECISION,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_sessions_syncId_key" ON "monitoring_sessions"("syncId");

-- CreateIndex
CREATE INDEX "monitoring_sessions_updatedAt_idx" ON "monitoring_sessions"("updatedAt");

-- CreateIndex
CREATE INDEX "monitoring_sessions_deviceId_idx" ON "monitoring_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "monitoring_sessions_userId_idx" ON "monitoring_sessions"("userId");

-- CreateIndex
CREATE INDEX "monitoring_sessions_userId_updatedAt_idx" ON "monitoring_sessions"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "monitoring_sessions" ADD CONSTRAINT "monitoring_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
