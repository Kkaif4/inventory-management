import { z } from "zod";

const invoiceItemSchema = z.object({
  variantId: z.string().min(1, "Product is required"),
  productName: z.string().optional(),
  description: z.string().min(1, "Description is required"),
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
  txnNumber: z.string().optional(),
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
  txnNumber: z.string().optional(),
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

const oldBillPaymentSchema = z.object({
  amount: z.number().min(0.01, "Payment amount must be > 0"),
  paymentDate: z.coerce.date(),
  note: z.string().optional(),
});

export const createOldBillSchema = z.object({
  billType: z.literal("OLD"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  customBillNo: z.string().optional(),       // Optional — auto-generated if blank
  date: z.coerce.date(),                     // Historical bill date
  buyerName: z.string().min(1, "Customer name is required"),
  buyerPhone: z.string().optional(),         // Reference only, NOT a unique key
  partyId: z.string().optional(),            // Set after user picks/creates customer
  grandTotal: z.number().min(0.01, "Total must be > 0"),
  items: z.array(z.object({
    itemDescription: z.string().min(1, "Item description required"),
    quantity: z.number().min(0.01, "Quantity > 0"),
    rate: z.number().min(0, "Rate >= 0"),
  })).optional(),
  headerDiscount: z.number().min(0).max(100).default(0).optional(), // Bill discount %
  freightCost: z.number().min(0, "Freight >= 0").default(0).optional(),
  payments: z.array(oldBillPaymentSchema).default([]),
  remarks: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate total is calculated correctly: (sum(quantity * rate) - headerDiscount%) + freight
  const itemsSubtotal = (data.items || []).reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = (itemsSubtotal * (data.headerDiscount || 0)) / 100;
  const expectedTotal = itemsSubtotal - discountAmount + (data.freightCost || 0);

  if (Math.abs(data.grandTotal - expectedTotal) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Total mismatch: Expected ₹${expectedTotal.toFixed(2)} (items - discount + freight), got ₹${data.grandTotal.toFixed(2)}`,
      path: ["grandTotal"]
    });
  }

  const totalPaid = data.payments.reduce((s, p) => s + p.amount, 0);
  if (totalPaid > data.grandTotal + 0.005) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Payments exceed total", path: ["payments"] });
  }
});

export type OldBillFormValues = z.infer<typeof createOldBillSchema>;

// Combined schema
export const invoiceSchema = z.discriminatedUnion("billType", [
  createNo1InvoiceSchema,
  createNo2InvoiceSchema,
  createOldBillSchema,
]);

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
