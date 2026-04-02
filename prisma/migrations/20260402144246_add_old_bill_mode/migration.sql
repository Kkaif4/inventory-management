-- AlterEnum
ALTER TYPE "BillType" ADD VALUE 'OLD';

-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_variantId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "customBillNo" TEXT;

-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "itemDescription" TEXT,
ALTER COLUMN "variantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OldBillPayment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OldBillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OldBillPayment_transactionId_idx" ON "OldBillPayment"("transactionId");

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OldBillPayment" ADD CONSTRAINT "OldBillPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
