-- DropIndex
DROP INDEX "Product_name_outletId_key";

-- DropIndex
DROP INDEX "Variant_sku_key";

-- AlterTable
ALTER TABLE "CustomBatch" ADD COLUMN     "costPerBaseUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "grnId" TEXT,
ADD COLUMN     "markupPercent" DOUBLE PRECISION,
ADD COLUMN     "pricingMethod" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "purchaseBillId" TEXT,
ADD COLUMN     "purchaseUnitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sellingPricePerBaseUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "costPerUnit" SET DEFAULT 0;
