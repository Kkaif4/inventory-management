import * as z from "zod";

export const PAYMENT_MODES = [
  "Cash",
  "BankTransfer",
  "UPI",
  "Cheque",
  "DD",
] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const PAYMENT_MODES_REQUIRING_BANK = [
  "BankTransfer",
  "Cheque",
  "DD",
] as const;

export const recordPaymentSchema = z
  .object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
    outletId: z.string().min(1, "Outlet ID is required"),
    partyId: z.string().min(1, "Party ID is required"),
    paymentDate: z.string().min(1, "Payment date is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    paymentMode: z.string().min(1, "Payment mode is required"),
    bankAccountId: z.string().optional(),
    referenceNo: z.string().max(60, "Max 60 characters").optional(),
    notes: z.string().max(200, "Max 200 characters").optional(),
  })
  .refine(
    (data) => {
      const requiresBank = (
        PAYMENT_MODES_REQUIRING_BANK as readonly string[]
      ).includes(data.paymentMode);
      if (requiresBank && !data.bankAccountId) return false;
      return true;
    },
    {
      message:
        "A bank account must be selected for Bank Transfer, Cheque, and DD payments",
      path: ["bankAccountId"],
    },
  );

export const generalPaymentSchema = z.object({
  outletId: z.string().min(1, "Outlet ID is required"),
  partyId: z.string().min(1, "Party ID is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMode: z.string().min(1, "Payment mode is required"),
  bankAccountId: z.string().min(1, "Bank/Cash account is required"),
  referenceNo: z.string().max(60, "Max 60 characters").optional(),
  notes: z.string().max(200, "Max 200 characters").optional(),
});

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
export type GeneralPaymentFormValues = z.infer<typeof generalPaymentSchema>;

// Legacy aliases kept for any existing imports
export const paymentSchema = recordPaymentSchema;
export type PaymentFormValues = RecordPaymentFormValues;
