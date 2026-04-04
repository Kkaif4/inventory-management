"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { revalidatePath } from "next/cache";
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "@/validations/expense.validation";
import type {
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
  ExpenseCategoryDetail,
  ExpenseCategoryListItem,
} from "@/types/expense.types";

/**
 * Get all expense categories for an outlet
 */
export async function getExpenseCategories(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const categories = await prisma.expenseCategory.findMany({
      where: {
        outletId,
        isActive: true,
      },
      include: {
        account: true,
      },
      orderBy: { code: "asc" },
    });

    return categories;
  });
}

/**
 * Create a new expense category
 */
export async function createExpenseCategory(data: CreateExpenseCategoryInput) {
  return withErrorHandler(async () => {
    const validated = createExpenseCategorySchema.parse(data);
    await validateSessionOutletAccess(validated.outletId);

    // Verify GL account exists and is 5xxx
    const account = await prisma.account.findFirst({
      where: {
        id: validated.accountId,
        outletId: validated.outletId,
      },
    });

    if (!account) {
      throw new NotFoundError("GL account not found");
    }

    if (!account.code || !account.code.startsWith("5")) {
      throw new ValidationError(
        "GL account must be an expense account (5xxx series)"
      );
    }

    // Check for duplicate code
    const existing = await prisma.expenseCategory.findFirst({
      where: {
        code: validated.code,
        outletId: validated.outletId,
      },
    });

    if (existing) {
      throw new ValidationError(
        `Category with code ${validated.code} already exists`
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        ...validated,
      },
      include: {
        account: true,
      },
    });

    revalidatePath("/dashboard/expenses");

    return category;
  });
}

/**
 * Update expense category
 */
export async function updateExpenseCategory(
  categoryId: string,
  data: UpdateExpenseCategoryInput,
  outletId: string
) {
  return withErrorHandler(async () => {
    const validated = updateExpenseCategorySchema.parse(data);
    await validateSessionOutletAccess(outletId);

    const category = await prisma.expenseCategory.findFirst({
      where: { id: categoryId, outletId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const updated = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: {
        name: validated.name || undefined,
        isActive: validated.isActive !== undefined ? validated.isActive : undefined,
      },
      include: {
        account: true,
      },
    });

    revalidatePath("/dashboard/expenses");

    return updated;
  });
}

/**
 * Initialize default expense categories for a new outlet
 * Creates standard categories: Rent, Salary, Utilities, Fuel, Misc
 * Idempotent operation
 */
export async function initializeDefaultExpenseCategories(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    // Default categories with GL codes
    const defaultCategories = [
      { name: "Rent", code: "5001", description: "Rent and lease payments" },
      { name: "Salary", code: "5002", description: "Employee salaries" },
      { name: "Utilities", code: "5003", description: "Electricity, water, etc." },
      { name: "Fuel", code: "5004", description: "Fuel and transportation" },
      { name: "Miscellaneous", code: "5005", description: "Other expenses" },
    ];

    const createdCategories = [];

    for (const cat of defaultCategories) {
      // Check if category already exists
      const existing = await prisma.expenseCategory.findFirst({
        where: {
          code: cat.code,
          outletId,
        },
      });

      if (!existing) {
        // Get or create GL account
        let expenseAccount = await prisma.account.findFirst({
          where: {
            code: cat.code,
            outletId,
          },
        });

        if (!expenseAccount) {
          expenseAccount = await prisma.account.create({
            data: {
              code: cat.code,
              name: cat.name,
              group: "EXPENSE",
              isSystem: true,
              type: null,
              openingBalance: 0,
              currentBalance: 0,
              outletId,
            },
          });
        }

        // Create category
        const created = await prisma.expenseCategory.create({
          data: {
            name: cat.name,
            code: cat.code,
            accountId: expenseAccount.id,
            outletId,
            isActive: true,
          },
          include: {
            account: true,
          },
        });

        createdCategories.push(created);
      }
    }

    revalidatePath("/dashboard/expenses");

    return createdCategories;
  });
}

/**
 * Get category by ID
 */
export async function getExpenseCategoryDetail(
  categoryId: string,
  outletId: string
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const category = await prisma.expenseCategory.findFirst({
      where: { id: categoryId, outletId },
      include: {
        account: true,
      },
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
export async function deactivateExpenseCategory(
  categoryId: string,
  outletId: string
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const category = await prisma.expenseCategory.findFirst({
      where: { id: categoryId, outletId },
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
