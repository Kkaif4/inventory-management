/*
  Warnings:

  - A unique constraint covering the columns `[sku,outletId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `outletId` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Variant_sku_key";

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "outletId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Variant_sku_outletId_key" ON "Variant"("sku", "outletId");

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
