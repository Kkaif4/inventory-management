import { z } from "zod";

export const paymentSchema = z.object({
  partyId: z.string().min(1, "Vendor is required"),
  accountId: z.string().min(1, "Source account is required"),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  date: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
