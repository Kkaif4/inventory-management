/*
  Warnings:

  - You are about to drop the column `parentCategoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `outletId` on the `Variant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,parentId,outletId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_parentCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_outletId_fkey";

-- DropIndex
DROP INDEX "Category_name_outletId_key";

-- DropIndex
DROP INDEX "Variant_sku_outletId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "parentCategoryId";

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "categoryId",
DROP COLUMN "outletId";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_parentId_outletId_key" ON "Category"("name", "parentId", "outletId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_sku_key" ON "Variant"("sku");
