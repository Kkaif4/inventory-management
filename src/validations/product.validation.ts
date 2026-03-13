import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  brand: z.string().optional().nullable(),
  hsnCode: z.string().min(4, "Invalid HSN Code"),
  gstRate: z.number(),
  baseUnit: z.string().min(1, "Base unit is required"),
  purchaseUnit: z.string().optional().nullable(),
  conversionRatio: z.number().min(1),
  categoryId: z.string().min(1, "Category is required"),
  variants: z.array(
    z.object({
      id: z.string(),
      sku: z.string().min(2, "SKU required"),
      minStockLevel: z.number().min(0),
      purchasePrice: z.number().min(0),
      sellingPrice: z.number().min(0),
      pricingMethod: z.enum(["MANUAL", "MARKUP"]),
      markupPercent: z.number().optional().nullable(),
    }),
  ),
});

export type ProductFormValues = z.infer<typeof productSchema>;
