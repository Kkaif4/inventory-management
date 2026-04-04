"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/validations/expense.validation";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseDetail,
  ExpenseListItem,
  PaginatedExpenses,
} from "@/types/expense.types";

/**
 * Create a new expense
 * - Validates outlet access
 * - Generates txnNumber
 * - Creates GL entries
 * - Decrements account balance
 * - Returns created expense
 */
export async function createExpense(data: CreateExpenseInput) {
  return withErrorHandler(async () => {
    // Validate input
    const validated = createExpenseSchema.parse(data);
    const userId = await validateSessionOutletAccess(validated.outletId);

    // Verify outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: validated.outletId },
    });

    if (!outlet) {
      throw new NotFoundError("Outlet not found");
    }

    // Verify category exists and belongs to outlet
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: validated.categoryId,
        outletId: validated.outletId,
      },
      include: {
        account: true,
      },
    });

    if (!category) {
      console.error("[Expense] Category not found:", validated.categoryId);
      throw new NotFoundError(
        "Expense category not found. Please ensure the category exists and belongs to your outlet.",
      );
    }

    // Verify account exists and belongs to outlet
    const account = await prisma.account.findFirst({
      where: {
        id: validated.accountId,
        outletId: validated.outletId,
      },
    });

    if (!account) {
      console.error("[Expense] Account not found:", validated.accountId);
      throw new NotFoundError(
        "Payment account not found. Please ensure the account exists and belongs to your outlet.",
      );
    }

    // Verify vendor if provided
    let vendor = null;
    if (validated.vendorId) {
      vendor = await prisma.party.findFirst({
        where: {
          id: validated.vendorId,
          outletId: validated.outletId,
        },
      });

      if (!vendor) {
        console.error("[Expense] Vendor not found:", validated.vendorId);
        throw new NotFoundError(
          "Vendor not found. Please ensure the vendor exists and belongs to your outlet.",
        );
      }
    }

    // Calculate total amount
    const inputGst = validated.inputGst || 0;
    const totalAmount = roundToTwo(validated.taxableAmount + inputGst);

    // In transaction
    return await prisma.$transaction(async (tx) => {
      try {
        // Generate transaction number
        const txnNumber = await NumberingService.getNextNumber(
          tx,
          validated.outletId,
          "EXPENSE",
        );

        // Create expense
        const expense = await tx.expense.create({
          data: {
            txnNumber,
            outletId: validated.outletId,
            date: validated.date,
            categoryId: validated.categoryId,
            vendorId: validated.vendorId,
            description: validated.description,
            taxableAmount: validated.taxableAmount,
            gstRate: validated.gstRate,
            inputGst,
            totalAmount,
            paymentMode: validated.paymentMode,
            accountId: validated.accountId,
            status: validated.status || "POSTED",
            createdBy: userId, // Use actual user ID from session
          },
          include: {
            category: {
              include: { account: true },
            },
            vendor: true,
            account: true,
            user: true,
          },
        });

        // Only process financial updates if expense is POSTED (not DRAFT)
        if (expense.status === "POSTED") {
          // Create GL entries (double-entry bookkeeping)
          try {
            const expenseGlAccount = category.account;
            if (expenseGlAccount) {
              // Determine GL account for cash/bank being spent
              // Map Account type to GL account code
              let cashGlAccount = null;
              if (account.type === "CASH") {
                cashGlAccount = await tx.account.findFirst({
                  where: {
                    code: "1001",
                    outletId: validated.outletId,
                  },
                });
              } else if (account.type === "BANK") {
                cashGlAccount = await tx.account.findFirst({
                  where: {
                    code: "1002",
                    outletId: validated.outletId,
                  },
                });
              }

              // Prepare double-entry journal entries
              const entries: Array<{
                accountId: string;
                debit?: number;
                credit?: number;
              }> = [
                {
                  accountId: expenseGlAccount.id,
                  debit: Number(totalAmount), // Full expense amount (incl GST)
                },
              ];

              // Add credit to cash/bank GL account
              if (cashGlAccount) {
                entries.push({
                  accountId: cashGlAccount.id,
                  credit: Number(totalAmount),
                });
              }

              // Post journal entry if accounting service available
              try {
                await AccountingService.postJournalEntry(tx, {
                  entries,
                });
              } catch (glError) {
                console.warn(
                  "GL journal entry failed (non-critical):",
                  glError instanceof Error ? glError.message : "Unknown error",
                );
                // Continue without GL entry - expense is still created
              }
            }
          } catch (error) {
            console.warn(
              "Accounting integration skipped:",
              error instanceof Error ? error.message : "Unknown error",
            );
            // Non-critical - expense is still created even if GL fails
          }

          // Decrement account balance
          const updatedAccount = await tx.account.update({
            where: { id: validated.accountId },
            data: {
              currentBalance: {
                decrement: Number(totalAmount),
              },
            },
          });
        }
        revalidatePath("/dashboard/expenses");

        return expense;
      } catch (txError) {
        throw txError;
      }
    });
  });
}

/**
 * Get expense detail
 */
export async function getExpenseDetail(expenseId: string, outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        outletId,
      },
      include: {
        category: {
          include: { account: true },
        },
        vendor: true,
        account: true,
        user: true,
      },
    });

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    return expense;
  });
}

/**
 * Get expenses list (paginated)
 */
export async function getExpenses(
  outletId: string,
  filters?: {
    categoryId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
  },
  pagination?: { page: number; limit: number },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      outletId,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Get total count
    const total = await prisma.expense.count({ where });

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        vendor: true,
        account: true,
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: expenses,
      total,
      page,
      limit,
      totalPages,
    };
  });
}

/**
 * Update expense (limited fields only)
 * Note: Amount and category cannot be changed post-creation
 */
export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseInput,
  outletId: string,
) {
  return withErrorHandler(async () => {
    const validated = updateExpenseSchema.parse(data);
    await validateSessionOutletAccess(outletId);

    // Get existing expense
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, outletId },
    });

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    if (expense.status !== "POSTED") {
      throw new ValidationError("Cannot update non-POSTED expenses");
    }

    // Verify vendor if provided
    if (validated.vendorId) {
      const vendor = await prisma.party.findFirst({
        where: { id: validated.vendorId, outletId },
      });

      if (!vendor) {
        throw new NotFoundError("Vendor not found");
      }
    }

    // Update
    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: validated.description || undefined,
        vendorId: validated.vendorId || undefined,
      },
      include: {
        category: true,
        vendor: true,
        account: true,
      },
    });

    revalidatePath(`/dashboard/expenses/${expenseId}`);

    return updated;
  });
}

/**
 * Cancel expense
 * - Reverse GL entries
 * - Restore account balance
 * - Mark as CANCELLED
 */
export async function cancelExpense(expenseId: string, outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, outletId },
      include: { account: true },
    });

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    if (expense.status === "CANCELLED") {
      throw new ValidationError("Expense is already cancelled");
    }

    return await prisma.$transaction(async (tx) => {
      // Update status
      const cancelled = await tx.expense.update({
        where: { id: expenseId },
        data: { status: "CANCELLED" },
        include: {
          category: true,
          vendor: true,
          account: true,
        },
      });

      // Restore account balance
      await tx.account.update({
        where: { id: expense.accountId },
        data: {
          currentBalance: {
            increment: Number(expense.totalAmount),
          },
        },
      });

      // Note: GL reversal would be handled by accounting service
      // For now, this is a simplified implementation

      revalidatePath("/dashboard/expenses");

      return cancelled;
    });
  });
}

/**
 * Delete expense (hard delete for draft-like expenses)
 * Only allowed for CANCELLED expenses
 */
export async function deleteExpense(expenseId: string, outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, outletId },
    });

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    if (expense.status !== "CANCELLED") {
      throw new ValidationError("Only CANCELLED expenses can be deleted");
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    revalidatePath("/dashboard/expenses");

    return { success: true };
  });
}

/**
 * Post a draft expense (transition from DRAFT to POSTED)
 * - Updates status to POSTED
 * - Decrements account balance
 * - Creates GL entries
 */
export async function postExpense(expenseId: string, outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, outletId },
      include: {
        category: {
          include: { account: true },
        },
        account: true,
      },
    });

    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    if (expense.status !== "DRAFT") {
      throw new ValidationError("Only DRAFT expenses can be posted");
    }

    return await prisma.$transaction(async (tx) => {
      // Update status to POSTED
      const posted = await tx.expense.update({
        where: { id: expenseId },
        data: { status: "POSTED" },
        include: {
          category: {
            include: { account: true },
          },
          vendor: true,
          account: true,
          user: true,
        },
      });

      // Try to create GL entries
      try {
        const expenseGlAccount = expense.category.account;
        if (expenseGlAccount) {
          const entries: Array<{
            accountId: string;
            debit?: number;
            credit?: number;
          }> = [
            {
              accountId: expenseGlAccount.id,
              debit: Number(expense.taxableAmount),
            },
          ];

          try {
            await AccountingService.postJournalEntry(tx, {
              entries,
            });
          } catch (glError) {
            console.warn(
              "GL journal entry failed (non-critical):",
              glError instanceof Error ? glError.message : "Unknown error",
            );
          }
        }
      } catch (error) {
        console.warn(
          "Accounting integration skipped:",
          error instanceof Error ? error.message : "Unknown error",
        );
      }

      // Decrement account balance
      await tx.account.update({
        where: { id: expense.accountId },
        data: {
          currentBalance: {
            decrement: Number(expense.totalAmount),
          },
        },
      });

      revalidatePath("/dashboard/expenses");

      return posted;
    });
  });
}
