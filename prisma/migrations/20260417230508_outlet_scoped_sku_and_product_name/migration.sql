-- Add outletId to Variant (nullable initially) if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Variant' AND column_name = 'outletId') THEN
    ALTER TABLE "Variant" ADD COLUMN "outletId" TEXT;
  END IF;
END $$;

-- Backfill outletId from Product where it's NULL
UPDATE "Variant" v
SET "outletId" = p."outletId"
FROM "Product" p
WHERE v."outletId" IS NULL AND v."productId" = p.id;

-- Make outletId NOT NULL
ALTER TABLE "Variant" ALTER COLUMN "outletId" SET NOT NULL;

-- Drop the global unique constraint on sku if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'Variant' AND constraint_name = 'Variant_sku_key') THEN
    ALTER TABLE "Variant" DROP CONSTRAINT "Variant_sku_key";
  END IF;
END $$;

-- Add the outlet-scoped composite unique constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'Variant' AND constraint_name = 'Variant_sku_outletId_key') THEN
    ALTER TABLE "Variant" ADD CONSTRAINT "Variant_sku_outletId_key" UNIQUE ("sku", "outletId");
  END IF;
END $$;
