-- Rename existing Account table to GLAccount (for Chart of Accounts)
ALTER TABLE "Account" RENAME TO "GLAccount";

-- Rename constraints
ALTER TABLE "GLAccount" RENAME CONSTRAINT "Account_pkey" TO "GLAccount_pkey";
ALTER INDEX "Account_code_outletId_key" RENAME TO "GLAccount_code_outletId_key";

-- Update foreign keys in LedgerEntry
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_accountId_fkey";
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "GLAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update foreign keys in Payment (rename bankAccountId reference to glAccountId, add operationalAccountId)
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bankAccountId_fkey";
ALTER TABLE "Payment" RENAME COLUMN "bankAccountId" TO "glAccountId";
ALTER TABLE "Payment" ADD COLUMN "operationalAccountId" TEXT;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_glAccountId_fkey"
  FOREIGN KEY ("glAccountId") REFERENCES "GLAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new enums
CREATE TYPE "AccountType" AS ENUM ('CASH', 'BANK');
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'CHEQUE', 'ONLINE_TRANSFER', 'CARD');
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- Create new Account table (operational accounts for cash/bank)
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outletId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Create AccountPaymentMode table
CREATE TABLE "AccountPaymentMode" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "mode" "PaymentMode" NOT NULL,

    CONSTRAINT "AccountPaymentMode_pkey" PRIMARY KEY ("id")
);

-- Create AccountTransaction table
CREATE TABLE "AccountTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "chequeNumber" TEXT,
    "chequeDate" TIMESTAMP(3),
    "upiReferenceId" TEXT,
    "transactionId" TEXT,
    "linkedTxnId" TEXT,
    "linkedTxnType" TEXT,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountTransaction_pkey" PRIMARY KEY ("id")
);

-- Create Transfer table
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Account
CREATE UNIQUE INDEX "Account_name_outletId_key" ON "Account"("name", "outletId");
CREATE INDEX "Account_outletId_idx" ON "Account"("outletId");
CREATE INDEX "Account_type_idx" ON "Account"("type");

-- Create indexes for AccountPaymentMode
CREATE UNIQUE INDEX "AccountPaymentMode_accountId_mode_key" ON "AccountPaymentMode"("accountId", "mode");
CREATE INDEX "AccountPaymentMode_accountId_idx" ON "AccountPaymentMode"("accountId");

-- Create indexes for AccountTransaction
CREATE INDEX "AccountTransaction_accountId_idx" ON "AccountTransaction"("accountId");
CREATE INDEX "AccountTransaction_type_idx" ON "AccountTransaction"("type");
CREATE INDEX "AccountTransaction_createdAt_idx" ON "AccountTransaction"("createdAt");
CREATE INDEX "AccountTransaction_linkedTxnId_idx" ON "AccountTransaction"("linkedTxnId");

-- Create indexes for Transfer
CREATE INDEX "Transfer_fromAccountId_idx" ON "Transfer"("fromAccountId");
CREATE INDEX "Transfer_toAccountId_idx" ON "Transfer"("toAccountId");
CREATE INDEX "Transfer_createdAt_idx" ON "Transfer"("createdAt");

-- Add foreign keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_outletId_fkey"
  FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AccountPaymentMode" ADD CONSTRAINT "AccountPaymentMode_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AccountTransaction" ADD CONSTRAINT "AccountTransaction_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromAccountId_fkey"
  FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toAccountId_fkey"
  FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_operationalAccountId_fkey"
  FOREIGN KEY ("operationalAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
