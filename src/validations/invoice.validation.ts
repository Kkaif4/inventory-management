import { z } from "zod";

export const invoiceSchema = z.object({
  partyId: z.string().min(1, "Customer is required"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  freightCost: z.number().min(0, "Freight >= 0").optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Product is required"),
        quantity: z.number().min(0.01, "Qty > 0"),
        unit: z.enum(["BASE", "SALES"]),
        rate: z.number().min(0, "Rate >= 0"),
        gstRate: z.number(),
        taxableValue: z.number(),
        cgst: z.number(),
        sgst: z.number(),
        igst: z.number(),
      }),
    )
    .min(1, "At least one item required"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
