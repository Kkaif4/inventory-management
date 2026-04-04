"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { revalidatePath } from "next/cache";
import type { UpdateExpenseCategoryInput } from "@/types/expense.types";

/**
 * Get all global expense categories (for filtering and reporting)
 */
export async function getExpenseCategories(outletId?: string) {
  return withErrorHandler(async () => {
    if (outletId) {
      await validateSessionOutletAccess(outletId);
    }

    const categories = await prisma.expenseCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: { code: "asc" },
    });

    return categories;
  });
}

/**
 * Expense categories are now predefined global categories
 * This function is kept for compatibility but does not create new categories
 */
export async function createExpenseCategory(data: any) {
  return withErrorHandler(async () => {
    throw new ValidationError(
      "Expense categories are predefined. Use an existing category or contact admin to add a new global category."
    );
  });
}

/**
 * Update expense category (only isActive can be modified)
 */
export async function updateExpenseCategory(
  categoryId: string,
  data: UpdateExpenseCategoryInput,
  outletId?: string
) {
  return withErrorHandler(async () => {
    if (outletId) {
      await validateSessionOutletAccess(outletId);
    }

    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Only allow updating isActive
    const updated = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: {
        isActive: data.isActive !== undefined ? data.isActive : category.isActive,
      },
    });

    revalidatePath("/dashboard/expenses");

    return updated;
  });
}

/**
 * Get category by ID
 */
export async function getExpenseCategoryDetail(categoryId: string) {
  return withErrorHandler(async () => {
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  });
}

/**
 * Deactivate category (soft delete)
 */
export async function deactivateExpenseCategory(categoryId: string) {
  return withErrorHandler(async () => {
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check if category is in use
    const expenseCount = await prisma.expense.count({
      where: { categoryId },
    });

    if (expenseCount > 0) {
      throw new ValidationError(
        `Cannot deactivate category in use (${expenseCount} expenses)`
      );
    }

    const updated = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/expenses");

    return updated;
  });
}
