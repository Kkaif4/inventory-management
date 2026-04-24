-- Drop redundant/misplaced columns from CustomBatch
ALTER TABLE "CustomBatch" DROP COLUMN "costPerUnit";
ALTER TABLE "CustomBatch" DROP COLUMN "sellingPricePerBaseUnit";
ALTER TABLE "CustomBatch" DROP COLUMN "pricingMethod";
ALTER TABLE "CustomBatch" DROP COLUMN "markupPercent";

-- Add batch pricing mode to Outlet
ALTER TABLE "Outlet" ADD COLUMN "batchPricingMode" TEXT NOT NULL DEFAULT 'STRICT';
