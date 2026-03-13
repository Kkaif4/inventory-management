import * as z from "zod";

export const adjustmentSchema = z.object({
  location: z.string().min(1, "Location is required"),
  reason: z.string().min(3, "Reason is required"),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Product variant is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        type: z.enum(["ADDITION", "DEDUCTION"]),
      }),
    )
    .min(1, "At least one item is required"),
});

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;
