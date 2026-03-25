import { z } from "zod";

const invoiceItemSchema = z.object({
  variantId: z.string(),
  productName: z.string().optional(),
  description: z.string(),
  quantity: z.number().min(0.01, "Qty > 0"),
  unit: z.enum(["BASE", "SALES"]).default("BASE"),
  rate: z.number().min(0, "Rate >= 0"),
  discountPercent: z.number().min(0).max(100).default(0),
  gstRate: z.number().default(0),
  hsnCode: z.string().optional(),
  taxableValue: z.number().default(0),
  cgst: z.number().optional(),
  sgst: z.number().optional(),
  igst: z.number().optional(),
  lineTotal: z.number().default(0),
});

// No.1 Legal Invoice Schema
export const createNo1InvoiceSchema = z.object({
  billType: z.literal("NO1"),
  partyId: z.string().min(1, "Customer is required"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item required"),
  headerDiscount: z.number().min(0).max(100).default(0),
  freightCost: z.number().min(0, "Freight >= 0").default(0),
  remarks: z.string().optional(),
  buyerName: z.string().optional(),
  buyerPhone: z.string().optional(),
});

// No.2 Raw Cash Memo Schema
export const createNo2InvoiceSchema = z.object({
  billType: z.literal("NO2"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  buyerName: z.string().default(""),
  buyerPhone: z.string().default(""),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item required"),
  freightCost: z.number().min(0, "Freight >= 0").default(0),
  remarks: z.string().optional(),
});

// Combined schema
export const invoiceSchema = z.discriminatedUnion("billType", [
  createNo1InvoiceSchema,
  createNo2InvoiceSchema,
]);

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
