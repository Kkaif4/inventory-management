import { z } from "zod";

/**
 * Expense Creation Schema
 */
export const createExpenseSchema = z.object({
  outletId: z.string().min(1, "Outlet ID is required"),
  date: z.date("Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
  vendorId: z.string().optional().transform((val) => (val ? val : undefined)),
  paymentMode: z.enum(["CASH", "UPI", "CHEQUE", "ONLINE_TRANSFER", "CARD"]).default("CASH"),
  accountId: z.string().min(1, "Account is required"),
  taxableAmount: z.number({ message: "Taxable amount is required" }).positive("Taxable amount must be greater than 0"),
  gstRate: z.number().min(0).max(100).optional(),
  inputGst: z.number().min(0).optional(),
  status: z.enum(["DRAFT", "POSTED"]).default("POSTED").optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

/**
 * Expense Update Schema (Limited)
 */
export const updateExpenseSchema = z.object({
  description: z.string().min(5).max(500).optional(),
  vendorId: z.string().cuid().optional().nullable(),
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

/**
 * Expense Category Creation Schema
 */
export const createExpenseCategorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters").max(50, "Category name must not exceed 50 characters"),
  code: z.string().regex(/^5\d{3}$/, "Code must be a valid GL account (5xxx format)"),
  accountId: z.string().cuid("Invalid GL account ID"),
  outletId: z.string().cuid("Invalid outlet ID"),
});

export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;

/**
 * Expense Category Update Schema
 */
export const updateExpenseCategorySchema = z.object({
  name: z.string().min(3).max(50).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;

/**
 * Attachment Upload Validation Rules
 *
 * Per IMAGE_PROCESSING.md:
 * - JPEG format with 80% quality for 60-80% file reduction
 * - Max width 400px (preserves aspect ratio, no enlargement)
 * - Base64 data URI encoding for self-contained storage
 * - Typical compression: 500KB → 45KB (92% reduction)
 * - Encoded size (Base64): ~60KB per logo
 */
export const attachmentValidationRules = {
  ALLOWED_MIMES: ["image/jpeg", "image/png"],
  OUTPUT_FORMAT: "image/jpeg", // JPEG for lossy compression
  MAX_SIZE_BEFORE_COMPRESSION: 5 * 1024 * 1024, // 5MB input limit
  MAX_ATTACHMENTS_PER_RECORD: 3,
  COMPRESSION_QUALITY: 80, // JPEG quality 80% for balance
  MAX_DIMENSION: 400, // 400px max width per IMAGE_PROCESSING.md
} as const;

/**
 * Attachment Upload Schema
 */
export const attachmentUploadSchema = z.object({
  moduleType: z.enum(["EXPENSE", "INVOICE"]),
  referenceId: z.string().cuid("Invalid reference ID"),
  // File validation happens in handler
});

export type AttachmentUploadInput = z.infer<typeof attachmentUploadSchema>;

/**
 * Expense List Query Schema
 */
export const expenseListQuerySchema = z.object({
  outletId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  status: z.enum(["DRAFT", "POSTED", "CANCELLED"]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(50),
});

export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;

/**
 * Expense Cancel Schema
 */
export const cancelExpenseSchema = z.object({
  expenseId: z.string().cuid("Invalid expense ID"),
  outletId: z.string().cuid("Invalid outlet ID"),
});

export type CancelExpenseInput = z.infer<typeof cancelExpenseSchema>;
