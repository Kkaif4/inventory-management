import * as z from "zod";

// ============================================================================
// Payment Mode Enums & Constants
// ============================================================================

export const PAYMENT_MODES = [
  "CASH",
  "UPI",
  "CHEQUE",
  "ONLINE_TRANSFER",
  "CARD",
] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

// Account type requirements per payment mode
export const ACCOUNT_TYPE_FOR_MODE: Record<PaymentMode, "CASH" | "BANK"> = {
  CASH: "CASH",
  UPI: "BANK",
  CHEQUE: "BANK",
  ONLINE_TRANSFER: "BANK",
  CARD: "BANK",
};

// ============================================================================
// Helper Validation Functions
// ============================================================================

/**
 * Validates that payment date is not in future and not older than 90 days
 */
function isValidPaymentDate(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const paymentDate = new Date(dateString);
  paymentDate.setHours(0, 0, 0, 0);

  // Cannot be in future
  if (paymentDate > today) {
    return false;
  }

  // Cannot be older than 90 days
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  if (paymentDate < ninetyDaysAgo) {
    return false;
  }

  return true;
}

/**
 * Validates cheque date: not in future, not older than 6 months
 */
function isValidChequeDate(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chequeDate = new Date(dateString);
  chequeDate.setHours(0, 0, 0, 0);

  // Cannot be in future
  if (chequeDate > today) {
    return false;
  }

  // Cannot be older than 6 months (180 days)
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

  if (chequeDate < sixMonthsAgo) {
    return false;
  }

  return true;
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Base payment schema with common fields and conditional mode-specific fields
 */
export const recordPaymentSchema = z
  .object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
    outletId: z.string().min(1, "Outlet ID is required"),
    partyId: z.string().min(1, "Party ID is required"),

    // Payment mode selection
    paymentMode: z.enum(PAYMENT_MODES),

    // Account (user-created) — required for all payment modes
    bankAccountId: z
      .string()
      .min(1, "Account is required for payment recording")
      .optional()
      .nullable(),

    // Operational account — optional, for tracking received funds
    accountId: z.string().optional().nullable(),

    // Common payment details
    amount: z
      .number()
      .positive("Amount must be greater than ₹0")
      .finite("Amount must be a valid number"),

    paymentDate: z
      .string()
      .min(1, "Payment date is required")
      .refine(isValidPaymentDate, {
        message: "Payment date cannot be in future or older than 90 days",
      }),

    // Mode-specific fields (all optional at schema level, but conditional at runtime)
    chequeNumber: z
      .string()
      .min(6, "Cheque number must be at least 6 characters")
      .max(20, "Cheque number cannot exceed 20 characters")
      .optional()
      .nullable(),

    chequeDate: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true; // Optional field
          return isValidChequeDate(val);
        },
        {
          message: "Cheque date cannot be in future or older than 6 months",
        },
      ),

    utrReferenceId: z
      .string()
      .max(50, "UTR reference cannot exceed 50 characters")
      .optional()
      .nullable(),

    transactionId: z
      .string()
      .max(50, "Transaction ID cannot exceed 50 characters")
      .optional()
      .nullable(),

    cardReference: z
      .string()
      .max(50, "Card reference cannot exceed 50 characters")
      .optional()
      .nullable(),

    // Optional fields for all modes
    referenceNo: z
      .string()
      .max(60, "Reference number cannot exceed 60 characters")
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(200, "Notes cannot exceed 200 characters")
      .optional()
      .nullable(),
  })
  // Conditional validation: mode-specific required fields
  .refine(
    (data) => {
      // CHEQUE mode: both cheque number and date are required
      if (data.paymentMode === "CHEQUE") {
        return !!data.chequeNumber && !!data.chequeDate;
      }
      return true;
    },
    {
      message: "Cheque number and date are required for cheque payments",
      path: ["chequeNumber"],
    },
  )
/**
 * Schema for general payment recording (simplified version without invoice)
 */
export const generalPaymentSchema = z
  .object({
    outletId: z.string().min(1, "Outlet ID is required"),
    partyId: z.string().min(1, "Party/Vendor is required"),

    // Payment mode selection
    paymentMode: z.enum(PAYMENT_MODES),

    // Account (user-created) — required for all payment modes
    bankAccountId: z
      .string()
      .min(1, "Account is required for payment recording")
      .optional()
      .nullable(),

    // Operational account — optional, for tracking funds
    accountId: z.string().optional().nullable(),

    // Common payment details
    amount: z
      .number()
      .positive("Amount must be greater than ₹0")
      .finite("Amount must be a valid number"),

    paymentDate: z
      .string()
      .min(1, "Payment date is required")
      .refine(isValidPaymentDate, {
        message: "Payment date cannot be in future or older than 90 days",
      }),

    // Mode-specific fields
    chequeNumber: z
      .string()
      .min(6, "Cheque number must be at least 6 characters")
      .max(20, "Cheque number cannot exceed 20 characters")
      .optional()
      .nullable(),

    chequeDate: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true;
          return isValidChequeDate(val);
        },
        {
          message: "Cheque date cannot be in future or older than 6 months",
        },
      ),

    utrReferenceId: z
      .string()
      .max(50, "UTR reference cannot exceed 50 characters")
      .optional()
      .nullable(),

    transactionId: z
      .string()
      .max(50, "Transaction ID cannot exceed 50 characters")
      .optional()
      .nullable(),

    cardReference: z
      .string()
      .max(50, "Card reference cannot exceed 50 characters")
      .optional()
      .nullable(),

    // Optional fields
    referenceNo: z
      .string()
      .max(60, "Reference number cannot exceed 60 characters")
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(200, "Notes cannot exceed 200 characters")
      .optional()
      .nullable(),
  })
  // Conditional validation for CHEQUE mode
  .refine(
    (data) => {
      if (data.paymentMode === "CHEQUE") {
        return !!data.chequeNumber && !!data.chequeDate;
      }
      return true;
    },
    {
      message: "Cheque number and date are required for cheque payments",
      path: ["chequeNumber"],
    },
  )
// ============================================================================
// Type Exports
// ============================================================================

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
export type GeneralPaymentFormValues = z.infer<typeof generalPaymentSchema>;

// Legacy aliases for backward compatibility
export const paymentSchema = recordPaymentSchema;
export type PaymentFormValues = RecordPaymentFormValues;
