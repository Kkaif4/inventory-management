-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "globalDiscount" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "discountAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "discountPercent" DOUBLE PRECISION DEFAULT 0;
