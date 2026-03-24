import { z } from "zod";

const invoiceItemSchema = z.object({
  variantId: z.string().min(1, "Product is required"),
  quantity: z.number().min(0.01, "Qty > 0"),
  unit: z.enum(["BASE", "SALES"]),
  rate: z.number().min(0, "Rate >= 0"),
  discountPercent: z.number().min(0).max(100).default(0),
  gstRate: z.number(),
  taxableValue: z.number(),
  cgst: z.number(),
  sgst: z.number(),
  igst: z.number(),
  hsnCode: z.string().optional(),
});

// No.1 Legal Invoice Schema - Strict
export const createNo1InvoiceSchema = z.object({
  billType: z.literal("NO1"),
  partyId: z.string().min(1, "Customer is required"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  freightCost: z.number().min(0, "Freight >= 0").default(0),
  items: z
    .array(
      invoiceItemSchema.extend({
        hsnCode: z.string().min(1, "HSN is required"),
        gstRate: z.number().min(0, "GST % is required"),
      }),
    )
    .min(1, "At least one item required"),
  remarks: z.string().optional(),
});

// No.2 Raw Cash Memo Schema - Loose/Quick
export const createNo2InvoiceSchema = z.object({
  billType: z.literal("NO2"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  buyerName: z.string().optional(),
  buyerPhone: z.string().optional(),
  items: z
    .array(
      invoiceItemSchema.omit({
        hsnCode: true,
        gstRate: true,
        cgst: true,
        sgst: true,
        igst: true,
      }),
    )
    .min(1, "At least one item required"),
  remarks: z.string().optional(),
});

// Combined type for the form
export const invoiceSchema = z.discriminatedUnion("billType", [
  createNo1InvoiceSchema,
  createNo2InvoiceSchema,
]);

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
