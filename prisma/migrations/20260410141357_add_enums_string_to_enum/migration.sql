/*
  Warnings:

  - The `status` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `negativeStockPolicy` column on the `Outlet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `inventoryValuationMethod` column on the `Outlet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pricingMethod` column on the `Variant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `paymentMode` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `paymentMode` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `StockLedger` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PARTIAL', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StockLedgerType" AS ENUM ('PURCHASE', 'SALE', 'TRANSFER_OUT', 'TRANSFER_IN', 'ADJUSTMENT_INC', 'ADJUSTMENT_DEC');

-- CreateEnum
CREATE TYPE "NegativeStockPolicy" AS ENUM ('WARN', 'ALLOW', 'BLOCK');

-- CreateEnum
CREATE TYPE "ValuationMethod" AS ENUM ('NONE', 'FIFO');

-- CreateEnum
CREATE TYPE "PricingMethod" AS ENUM ('MANUAL', 'MARKUP');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "paymentMode",
ADD COLUMN     "paymentMode" "PaymentMode" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'POSTED';

-- AlterTable
ALTER TABLE "Outlet" DROP COLUMN "negativeStockPolicy",
ADD COLUMN     "negativeStockPolicy" "NegativeStockPolicy" NOT NULL DEFAULT 'WARN',
DROP COLUMN "inventoryValuationMethod",
ADD COLUMN     "inventoryValuationMethod" "ValuationMethod" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentMode",
ADD COLUMN     "paymentMode" "PaymentMode" NOT NULL;

-- AlterTable
ALTER TABLE "StockLedger" DROP COLUMN "type",
ADD COLUMN     "type" "StockLedgerType" NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status",
ADD COLUMN     "status" "TxStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "pricingMethod",
ADD COLUMN     "pricingMethod" "PricingMethod" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE INDEX "Transaction_outletId_type_status_idx" ON "Transaction"("outletId", "type", "status");
