-- Step 1: Add new columns to Account table with safe defaults (IF NOT EXISTS checks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Account' AND column_name='code') THEN
    ALTER TABLE "Account" ADD COLUMN "code" TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Account' AND column_name='group') THEN
    ALTER TABLE "Account" ADD COLUMN "group" "AccountGroup" NOT NULL DEFAULT 'ASSET';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Account' AND column_name='isSystem') THEN
    ALTER TABLE "Account" ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Step 2: Add journalId to LedgerEntry if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='LedgerEntry' AND column_name='journalId') THEN
    ALTER TABLE "LedgerEntry" ADD COLUMN "journalId" TEXT;
  END IF;
END $$;

-- Step 3: Make Account.type nullable (only if it's currently NOT NULL)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Account' AND column_name='type' AND is_nullable='NO'
  ) THEN
    ALTER TABLE "Account" ALTER COLUMN "type" DROP NOT NULL;
  END IF;
END $$;

-- Step 4: Migrate GLAccount records into Account table (only if GLAccount still exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='GLAccount') THEN
    INSERT INTO "Account" (id, code, name, "group", "isSystem", "openingBalance", "currentBalance", "outletId", "type", "createdAt", "updatedAt")
    SELECT id, code, name, "group", true, 0, 0, "outletId", NULL::text::"AccountType", NOW(), NOW() FROM "GLAccount"
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Step 5: Update LedgerEntry FK to point to Account (drop and recreate)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='LedgerEntry' AND constraint_name='LedgerEntry_accountId_fkey'
  ) THEN
    ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_accountId_fkey";
  END IF;
END $$;

ALTER TABLE "LedgerEntry"
  ADD CONSTRAINT "LedgerEntry_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"(id) ON DELETE CASCADE;

-- Step 6: Add indexes to LedgerEntry (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS "LedgerEntry_accountId_idx" ON "LedgerEntry"("accountId");
CREATE INDEX IF NOT EXISTS "LedgerEntry_date_idx" ON "LedgerEntry"("date");
CREATE INDEX IF NOT EXISTS "LedgerEntry_journalId_idx" ON "LedgerEntry"("journalId");
CREATE INDEX IF NOT EXISTS "LedgerEntry_accountId_date_idx" ON "LedgerEntry"("accountId", "date");

-- Step 7: Migrate Payment table
DO $$ BEGIN
  -- Check if Payment still has old columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Payment' AND column_name='glAccountId') THEN
    -- Add temp column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Payment' AND column_name='accountId_temp') THEN
      ALTER TABLE "Payment" ADD COLUMN "accountId_temp" TEXT;
    END IF;

    -- Migrate data
    UPDATE "Payment" SET "accountId_temp" = "glAccountId" WHERE "glAccountId" IS NOT NULL;
    UPDATE "Payment" SET "accountId_temp" = "operationalAccountId" WHERE "accountId_temp" IS NULL AND "operationalAccountId" IS NOT NULL;

    -- Drop old FK constraints
    ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_glAccountId_fkey";
    ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_operationalAccountId_fkey";

    -- Drop old columns
    ALTER TABLE "Payment" DROP COLUMN IF EXISTS "glAccountId";
    ALTER TABLE "Payment" DROP COLUMN IF EXISTS "operationalAccountId";

    -- Rename and make NOT NULL
    ALTER TABLE "Payment" RENAME COLUMN "accountId_temp" TO "accountId";
  END IF;
END $$;

-- Ensure Payment.accountId exists and add FK
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Payment' AND column_name='accountId') THEN
    ALTER TABLE "Payment" ADD COLUMN "accountId" TEXT NOT NULL;
  END IF;
END $$;

-- Add FK constraint for Payment.accountId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='Payment' AND constraint_name='Payment_accountId_fkey'
  ) THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_accountId_fkey"
      FOREIGN KEY ("accountId") REFERENCES "Account"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 8: Migrate ExpenseCategory table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ExpenseCategory' AND column_name='glAccountId') THEN
    -- Drop old FK
    ALTER TABLE "ExpenseCategory" DROP CONSTRAINT IF EXISTS "ExpenseCategory_glAccountId_fkey";

    -- Add temp column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ExpenseCategory' AND column_name='accountId_temp') THEN
      ALTER TABLE "ExpenseCategory" ADD COLUMN "accountId_temp" TEXT;
    END IF;

    -- Copy data
    UPDATE "ExpenseCategory" SET "accountId_temp" = "glAccountId" WHERE "glAccountId" IS NOT NULL;

    -- Drop old column
    ALTER TABLE "ExpenseCategory" DROP COLUMN IF EXISTS "glAccountId";

    -- Rename
    ALTER TABLE "ExpenseCategory" RENAME COLUMN "accountId_temp" TO "accountId";
  END IF;
END $$;

-- Ensure ExpenseCategory.accountId exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ExpenseCategory' AND column_name='accountId') THEN
    ALTER TABLE "ExpenseCategory" ADD COLUMN "accountId" TEXT NOT NULL;
  END IF;
END $$;

-- Add FK constraint for ExpenseCategory.accountId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='ExpenseCategory' AND constraint_name='ExpenseCategory_accountId_fkey'
  ) THEN
    ALTER TABLE "ExpenseCategory"
      ADD CONSTRAINT "ExpenseCategory_accountId_fkey"
      FOREIGN KEY ("accountId") REFERENCES "Account"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for ExpenseCategory
CREATE INDEX IF NOT EXISTS "ExpenseCategory_accountId_idx" ON "ExpenseCategory"("accountId");

-- Step 9: Add unique constraint on Account.code if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='Account' AND constraint_name='Account_code_outletId_key'
  ) THEN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_code_outletId_key" UNIQUE ("code", "outletId");
  END IF;
END $$;

-- Step 10: Add performance indexes to Account
CREATE INDEX IF NOT EXISTS "Account_outletId_group_idx" ON "Account"("outletId", "group");

-- Step 11: Drop GLAccount table (only if it still exists and all data migrated)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='GLAccount') THEN
    DROP TABLE "GLAccount" CASCADE;
  END IF;
END $$;
