import { AccountType, PaymentMode } from "@/generated/prisma";

/**
 * Payment modes allowed for each account type
 */
export const ALLOWED_PAYMENT_MODES: Record<AccountType, PaymentMode[]> = {
  CASH: ["CASH"],
  BANK: ["UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"],
};

/**
 * Required fields for each payment mode
 */
export const REQUIRED_MODE_FIELDS: Record<PaymentMode, string[]> = {
  CASH: [],
  UPI: ["upiReferenceId"],
  CHEQUE: ["chequeNumber", "chequeDate"],
  ONLINE_TRANSFER: ["transactionId"],
  CARD: [],
};

/**
 * Validate that a payment mode is allowed for an account type
 */
export function validatePaymentModeForAccount(
  accountType: AccountType,
  paymentMode: PaymentMode
): { valid: boolean; error?: string } {
  const allowedModes = ALLOWED_PAYMENT_MODES[accountType];

  if (!allowedModes.includes(paymentMode)) {
    return {
      valid: false,
      error: `Payment mode ${paymentMode} is not allowed for ${accountType} account. Allowed modes: ${allowedModes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that required fields for a payment mode are provided
 */
export function validatePaymentModeFields(
  paymentMode: PaymentMode,
  data: Record<string, any>
): { valid: boolean; error?: string } {
  const requiredFields = REQUIRED_MODE_FIELDS[paymentMode];

  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        valid: false,
        error: `Field ${field} is required for ${paymentMode} payment mode`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate account transfer between accounts
 */
export function validateTransfer(data: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}): { valid: boolean; error?: string } {
  // Check that source and destination are different
  if (data.fromAccountId === data.toAccountId) {
    return {
      valid: false,
      error: "Cannot transfer to the same account",
    };
  }

  // Check amount is positive
  if (data.amount <= 0) {
    return {
      valid: false,
      error: "Transfer amount must be greater than zero",
    };
  }

  return { valid: true };
}
