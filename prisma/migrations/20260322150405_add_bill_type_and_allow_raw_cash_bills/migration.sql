-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('NO1', 'NO2');

-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN     "allowRawCashBills" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "billType" "BillType" NOT NULL DEFAULT 'NO1';
