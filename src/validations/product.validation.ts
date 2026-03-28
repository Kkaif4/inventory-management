import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional().nullable(),
  sku: z.string().min(0).max(50),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  pricingMethod: z.enum(["MANUAL", "MARKUP"]),
  markupPercent: z.coerce.number().optional().nullable(),
  minStockLevel: z.coerce.number().min(0).default(0),
  specifications: z.any().optional().default({}),
});

// Schema for creating a new product (with parentCategoryId optional)
export const productCreateSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    brand: z.string().optional().nullable(),
    hsnCode: z.string().optional().nullable(),
    gstRate: z.coerce.number(),
    baseUnit: z.string().min(1, "Base unit is required"),
    purchaseUnit: z.string().optional().nullable(),
    salesUnit: z.string().optional().nullable(),
    conversionRatio: z.coerce.number().min(0.01).default(1),
    categoryId: z.string().min(1, "Category is required"),
    parentCategoryId: z.string().optional().nullable(),
    variants: z.array(variantSchema).min(1, "At least one variant is required"),
  })
  .refine(
    (data) => {
      if (!data.hsnCode || data.hsnCode.trim() === "") {
        return data.gstRate === 0;
      }
      return true;
    },
    {
      message: "GST Rate must be 0 if HSN Code is not provided",
      path: ["gstRate"],
    },
  );

// Schema for updating an existing product (parentCategoryId not editable)
export const productEditSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    brand: z.string().optional().nullable(),
    hsnCode: z.string().optional().nullable(),
    gstRate: z.coerce.number(),
    baseUnit: z.string().min(1, "Base unit is required"),
    purchaseUnit: z.string().optional().nullable(),
    conversionRatio: z.coerce.number().min(1).default(1),
    categoryId: z.string().min(1, "Category is required"),
    variants: z.array(variantSchema).min(1, "At least one variant is required"),
  })
  .refine(
    (data) => {
      if (!data.hsnCode || data.hsnCode.trim() === "") {
        return data.gstRate === 0;
      }
      return true;
    },
    {
      message: "GST Rate must be 0 if HSN Code is not provided",
      path: ["gstRate"],
    },
  );

// Keep productSchema as alias for backward compatibility
export const productSchema = productEditSchema;

export type ProductFormValues = z.infer<typeof productCreateSchema>;
export type ProductEditFormValues = z.infer<typeof productEditSchema>;
