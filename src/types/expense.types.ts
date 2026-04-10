// ============================================================================
// Input Types (from validations)
// ============================================================================

import { Decimal } from "@/generated/prisma/runtime/client";

export type CreateExpenseInput = {
  outletId: string;
  date: Date;
  categoryId: string;
  description: string;
  vendorId?: string;
  paymentMode: "CASH" | "UPI" | "CHEQUE" | "ONLINE_TRANSFER" | "CARD";
  accountId: string;
  taxableAmount: number;
  gstRate?: number;
  inputGst?: number;
  status?: "DRAFT" | "POSTED"; // Default: "POSTED"
};

export type UpdateExpenseInput = {
  description?: string;
  vendorId?: string | null;
};

// ============================================================================
// Expense Types
// ============================================================================

export interface ExpenseDetail {
  id: string;
  txnNumber: string;
  date: Date;
  category: {
    id: string;
    name: string;
    code?: string | null;
  };
  vendor?: {
    id: string;
    name: string;
  } | null;
  description: string;
  taxableAmount: number | Decimal;
  gstRate?: number | null;
  inputGst: number | Decimal;
  totalAmount: number | Decimal;
  paymentMode: string;
  account: {
    id: string;
    name: string;
  };
  status: string; // "POSTED" | "CANCELLED" | other values
  createdBy: string;
  user?: any; // Full user object from Prisma
  createdAt: Date;
  updatedAt?: Date;
  attachments?: AttachmentMetadata[];
}

export interface ExpenseListItem {
  id: string;
  txnNumber: string;
  date: Date;
  category: {
    id: string;
    name: string;
    code?: string | null;
  };
  description: string;
  taxableAmount: number | Decimal;
  inputGst: number | Decimal;
  totalAmount: number | Decimal;
  account: {
    id: string;
    name: string;
  };
  status: string; // "POSTED" | "CANCELLED"
  vendor?: {
    id: string;
    name: string;
  } | null;
  paymentMode: string;
}

export interface ExpenseRegisterRow {
  id: string;
  txnNumber: string;
  date: string;
  category: string;
  vendor?: string;
  description: string;
  taxable: number;
  gst: number;
  total: number;
  account: string;
  status: string;
}

export interface ExpenseByCategoryRow {
  category: string;
  count: number;
  totalTaxable: number;
  totalGst: number;
  total: number;
  percentOfTotal: number;
}

export interface ExpenseGSTRow {
  gstRate: number;
  count: number;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface ExpenseDashboardMetrics {
  totalExpenses: number;
  transactionCount: number;
  averageExpense: number;
  topCategories: {
    name: string;
    total: number;
  }[];
  cashVsBank: {
    cash: number;
    bank: number;
  };
  gstRecoverable: number;
}

export interface PaginatedExpenses {
  items: ExpenseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Expense Category Types
// ============================================================================

export interface ExpenseCategoryDetail {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategoryListItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

// ============================================================================
// Attachment Types
// ============================================================================

export interface AttachmentMetadata {
  id: string;
  fileName: string;
  mimeType: string; // Always "image/webp"
  size: number; // bytes
  createdAt: Date;
}

export interface AttachmentWithData extends AttachmentMetadata {
  data: Buffer; // Binary image data
  moduleType: string;
  referenceId: string;
}

export interface CompressedImageResult {
  buffer: Buffer;
  format: string;
  size: number;
}

export interface AttachmentValidationResult {
  valid: boolean;
  error?: string;
  fileName?: string;
  fileSize?: number;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateExpenseFormData {
  outletId: string;
  date: Date;
  categoryId: string;
  description: string;
  vendorId?: string;
  paymentMode: "CASH" | "UPI" | "CHEQUE" | "ONLINE_TRANSFER" | "CARD";
  accountId: string;
  taxableAmount: number;
  gstRate?: number;
  inputGst: number;
  totalAmount: number;
}

export interface UpdateExpenseFormData {
  description?: string;
  vendorId?: string | null;
}

export interface CreateExpenseCategoryFormData {
  name: string;
  code?: string;
  description?: string;
}

// Re-export validation schema types
export type CreateExpenseCategoryInput = {
  name: string;
  code?: string;
  description?: string;
};

export type UpdateExpenseCategoryInput = {
  name?: string;
  isActive?: boolean;
};

// ============================================================================
// Response Types
// ============================================================================

export interface ExpenseActionResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export type CreateExpenseResponse = ExpenseActionResponse<ExpenseDetail>;
export type GetExpenseResponse = ExpenseActionResponse<ExpenseDetail>;
export type UpdateExpenseResponse = ExpenseActionResponse<ExpenseDetail>;
export type CancelExpenseResponse = ExpenseActionResponse<ExpenseDetail>;
export type ListExpensesResponse = ExpenseActionResponse<PaginatedExpenses>;
export type CreateCategoryResponse =
  ExpenseActionResponse<ExpenseCategoryDetail>;
export type ListCategoriesResponse = ExpenseActionResponse<
  ExpenseCategoryListItem[]
>;
export type DashboardResponse = ExpenseActionResponse<ExpenseDashboardMetrics>;

// ============================================================================
// Validation Helper Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}
