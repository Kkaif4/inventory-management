-- Migration: Schema cleanup from initial state
-- This migration bridges the gap between the init migration and the actual DB state,
-- consolidating changes from intermediate migrations that are no longer tracked locally.
--
-- Changes from init:
-- 1. LedgerEntry: drop journalId column (removed from schema — not needed)
-- 2. LedgerEntry: drop journalId index
-- 3. Payment.accountId: make nullable (payment account is optional)
-- 4. Payment_accountId_fkey: change ON DELETE RESTRICT → SET NULL (consistent with nullable field)

-- Drop journalId from LedgerEntry
DROP INDEX IF EXISTS "LedgerEntry_journalId_idx";
ALTER TABLE "LedgerEntry" DROP COLUMN IF EXISTS "journalId";

-- Make Payment.accountId nullable
ALTER TABLE "Payment" ALTER COLUMN "accountId" DROP NOT NULL;

-- Update Payment_accountId_fkey to match nullable field (SET NULL instead of RESTRICT)
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_accountId_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
