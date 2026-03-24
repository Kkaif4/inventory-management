/*
  Warnings:

  - You are about to drop the column `salesUnit` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN     "inventoryValuationMethod" TEXT NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "salesUnit";

-- AlterTable
ALTER TABLE "StockLedger" ADD COLUMN     "costPerUnit" DOUBLE PRECISION;
