import { z } from "zod";
import { PAYMENT_MODES } from "./payment.validation";

const invoiceItemSchema = z.object({
  variantId: z.string().min(1, "Product is required"),
  productName: z.string().optional().nullable(),
  description: z.string().optional().default(""),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.enum(["BASE", "SALES"]).default("BASE").optional(),
  rate: z.coerce.number().min(0, "Rate must be >= 0"),
  discountPercent: z.coerce.number().min(0).max(100).default(0).optional(),
  gstRate: z.coerce.number().default(0).optional(),
  hsnCode: z.string().optional().nullable(),
  taxableValue: z.coerce.number().default(0).optional(),
  cgst: z.coerce.number().optional().nullable(),
  sgst: z.coerce.number().optional().nullable(),
  igst: z.coerce.number().optional().nullable(),
  lineTotal: z.coerce.number().default(0).optional(),
  serialNumbers: z.array(z.string()).optional(),
  hasSerialNumbers: z.boolean().optional(),
  batchNumber: z.string().optional().nullable(),
});

// No.1 Legal Invoice Schema
export const createNo1InvoiceSchema = z.object({
  billType: z.literal("NO1"),
  txnNumber: z.string().optional(),
  partyId: z.string().min(1, "Customer is required for legal invoice"),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required"),
  headerDiscount: z.coerce.number().min(0).max(100).default(0).optional(),
  freightCost: z.coerce.number().min(0, "Freight >= 0").default(0).optional(),
  roundOff: z.coerce.number().optional().default(0),
  isRoundOff: z.boolean().optional().default(false),
  remarks: z.string().optional().nullable(),
  buyerName: z.string().optional().nullable(),
  buyerPhone: z.string().optional().nullable(),
  payments: z
    .array(
      z.object({
        paymentMode: z.enum(PAYMENT_MODES),
        bankAccountId: z.string().optional().nullable(),
        amount: z.coerce.number().min(0.01, "Amount must be > 0"),
        referenceNo: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        chequeNumber: z.string().optional().nullable(),
        chequeDate: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
});

// No.2 Raw Cash Memo Schema
export const createNo2InvoiceSchema = z.object({
  billType: z.literal("NO2"),
  txnNumber: z.string().optional(),
  fromOutletId: z.string().min(1, "Outlet is required"),
  date: z.coerce.date(),
  partyId: z.string().optional().nullable(),
  buyerName: z.string().optional().nullable().default(""),
  buyerPhone: z.string().optional().nullable().default(""),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required"),
  headerDiscount: z.coerce.number().min(0).max(100).default(0).optional(),
  freightCost: z.coerce.number().min(0, "Freight >= 0").default(0).optional(),
  roundOff: z.coerce.number().optional().default(0),
  isRoundOff: z.boolean().optional().default(false),
  remarks: z.string().optional().nullable(),
  payments: z
    .array(
      z.object({
        paymentMode: z.enum(PAYMENT_MODES),
        bankAccountId: z.string().optional().nullable(),
        amount: z.coerce.number().min(0.01, "Amount must be > 0"),
        referenceNo: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        chequeNumber: z.string().optional().nullable(),
        chequeDate: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
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
  roundOff: z.number().optional().default(0),
  isRoundOff: z.boolean().optional().default(false),
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

export type OldBillFormValues = Omit<
  z.infer<typeof createOldBillSchema>,
  "roundOff" | "isRoundOff"
> & {
  roundOff?: number;
  isRoundOff?: boolean;
};

// Combined schema
export const invoiceSchema = z.discriminatedUnion("billType", [
  createNo1InvoiceSchema,
  createNo2InvoiceSchema,
  createOldBillSchema,
]);

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
