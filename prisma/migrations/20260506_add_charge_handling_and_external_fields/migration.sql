-- Add chargeHandling field to Transaction table
ALTER TABLE "transactions" ADD COLUMN "chargeHandling" TEXT NOT NULL DEFAULT 'addOnTop';

-- Add external provider metadata fields to Transaction table  
ALTER TABLE "transactions" ADD COLUMN "externalProvider" TEXT;
ALTER TABLE "transactions" ADD COLUMN "externalTransactionId" TEXT;
