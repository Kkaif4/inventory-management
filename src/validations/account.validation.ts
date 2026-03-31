import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["CASH", "BANK"]),
  openingBalance: z.coerce.number().nonnegative("Opening balance cannot be negative").default(0),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100).optional(),
  openingBalance: z.coerce.number().nonnegative("Opening balance cannot be negative").optional(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export const recordTransactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMode: z.enum(["CASH", "UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"]),
  chequeNumber: z.string().optional(),
  chequeDate: z.coerce.date().optional(),
  upiReferenceId: z.string().optional(),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
});

export type RecordTransactionInput = z.infer<typeof recordTransactionSchema>;

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "From account is required"),
  toAccountId: z.string().min(1, "To account is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  remarks: z.string().optional(),
});

export type TransferInput = z.infer<typeof transferSchema>;
