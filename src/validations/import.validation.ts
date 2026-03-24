import { z } from "zod";

export const IMPORT_GST_SLABS = [0, 0.25, 3, 5, 12, 18, 28] as const;

export const PRODUCT_LEVEL_FIELDS = [
  "brand",
  "hsnCode",
  "gstRate",
  "baseUnit",
  "purchaseUnit",
  "conversionRatio",
  "categoryL1",
  "categoryL2",
  "categoryL3",
] as const;

export const importRowSchema = z
  .object({
    productGroupName: z.coerce
      .string()
      .min(1, "Product group name is required")
      .max(120),
    brand: z.coerce.string().optional().nullable(),
    hsnCode: z.coerce.string().optional().nullable(),
    gstRate: z.coerce
      .number()
      .refine((val) => IMPORT_GST_SLABS.includes(val as any), {
        message: `GST Rate must be one of: ${IMPORT_GST_SLABS.join(", ")}`,
      }),
    baseUnit: z.coerce.string().min(1, "Base unit is required"),
    purchaseUnit: z.coerce.string().optional().nullable(),
    conversionRatio: z.coerce.number().default(1),
    categoryL1: z.coerce.string().min(1, "Category L1 is required"),
    categoryL2: z.coerce.string().optional().nullable(),
    categoryL3: z.coerce.string().optional().nullable(),
    variantSku: z.coerce.string().min(1, "Variant SKU is required"),
    variantSpec: z.coerce.string().optional().nullable(),
    purchasePrice: z.coerce
      .number()
      .nonnegative("Purchase price must be positive"),
    sellingPrice: z.coerce.number().optional().nullable(),
    pricingMethod: z.enum(["MANUAL", "MARKUP"]),
    markupPercent: z.coerce.number().min(0).max(100).optional().nullable(),
    minStockLevel: z.coerce.number().default(0),
    warehouseName: z.coerce.string().optional().nullable(),
    currentStock: z.coerce.number().default(0),
    batchDate: z.coerce.string().optional().nullable(),
    batchCostPerUnit: z.coerce.number().optional().nullable(),
  })
  .refine(
    (data) => {
      if (
        data.pricingMethod === "MARKUP" &&
        (data.markupPercent === null || data.markupPercent === undefined)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Markup percentage is required when pricing method is MARKUP",
      path: ["markupPercent"],
    },
  )
  .refine(
    (data) => {
      if (
        data.pricingMethod === "MANUAL" &&
        (data.sellingPrice === null || data.sellingPrice === undefined)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Selling price is required when pricing method is MANUAL",
      path: ["sellingPrice"],
    },
  )
  .refine(
    (data) => {
      if (data.currentStock > 0 && !data.warehouseName) {
        return false;
      }
      return true;
    },
    {
      message:
        "Warehouse name is required when current stock is greater than 0",
      path: ["warehouseName"],
    },
  )
  .refine(
    (data) => {
      const needsRatio =
        data.purchaseUnit && data.purchaseUnit !== data.baseUnit;
      if (needsRatio && data.conversionRatio <= 1) {
        return false;
      }
      return true;
    },
    {
      message:
        "Conversion ratio must be greater than 1 if purchase unit differs from base unit",
      path: ["conversionRatio"],
    },
  );

// NOTE: Rule 5 (batch) - batchDate required if batchTrackingEnabled AND currentStock > 0
// This rule is context-dependent (needs outlet config), so it is validated in
// import-logic.ts after fetching outlet, not here in the schema. Do not add it here.

export type ImportRow = z.infer<typeof importRowSchema>;

// ISSUE #2: Extend type with sheet row metadata for error reporting
export type ImportRowWithMeta = ImportRow & {
  _sheetRow: number; // 1-based sheet row number
};
