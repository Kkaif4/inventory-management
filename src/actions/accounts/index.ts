"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/exceptions";
import { revalidatePath } from "next/cache";
import { AccountType } from "@/generated/prisma";
import { AccountingService } from "@/domains/accounting/ledger-service";

/**
 * Create a new cash or bank account
 */
export async function createAccount(data: {
  name: string;
  type: AccountType;
  openingBalance?: number;
  outletId: string;
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);

    // Check if account name is unique within outlet
    const existing = await prisma.account.findUnique({
      where: {
        name_outletId: {
          name: data.name,
          outletId: data.outletId,
        },
      },
    });

    if (existing) {
      throw new ValidationError(
        `Account with name "${data.name}" already exists in this outlet`
      );
    }

    const openingBalance = data.openingBalance || 0;

    const account = await prisma.$transaction(async (tx) => {
      const acc = await tx.account.create({
        data: {
          name: data.name,
          type: data.type,
          group: "ASSET", // CASH and BANK accounts are always ASSET (overdraft logic handles reclassification)
          isSystem: false, // User-created account
          openingBalance,
          currentBalance: openingBalance,
          outletId: data.outletId,
        },
      });

      if (openingBalance > 0) {
        const offsetAcc = await tx.account.findUnique({
          where: { code_outletId: { code: "5001", outletId: data.outletId } },
        });

        if (offsetAcc) {
          await AccountingService.postJournalEntry(tx, {
            transactionId: `OPB-${acc.id}`,
            entries: [
              { accountId: acc.id, debit: openingBalance },
              { accountId: offsetAcc.id, credit: openingBalance },
            ],
          });
        }
      }

      return acc;
    });

    revalidatePath("/dashboard/financials/accounts");
    return account;
  });
}

/**
 * Get all accounts for an outlet
 */
export async function getOutletAccounts(outletId: string) {
  return withErrorHandler(async () => {
    if (!outletId) {
      throw new ValidationError("Outlet ID is required");
    }

    await validateSessionOutletAccess(outletId);

    return await prisma.account.findMany({
      where: { outletId },
      include: {
        paymentModes: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5, // Last 5 transactions
        },
      },
      orderBy: { name: "asc" },
    });
  });
}

/**
 * Get account details with full transaction history
 */
export async function getAccountDetail(accountId: string, outletId: string) {
  return withErrorHandler(async () => {
    if (!accountId || !outletId) {
      throw new ValidationError("Account ID and Outlet ID are required");
    }

    await validateSessionOutletAccess(outletId);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        paymentModes: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        transfersFrom: {
          orderBy: { createdAt: "desc" },
        },
        transfersTo: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.outletId !== outletId) {
      throw new ForbiddenError("Access denied to this account");
    }

    // Calculate current balance from transactions (verification)
    const calculatedBalance = calculateAccountBalance(account);

    return {
      ...account,
      calculatedBalance,
    };
  });
}

/**
 * Update account details
 */
export async function updateAccount(
  accountId: string,
  data: {
    name?: string;
    openingBalance?: number;
    outletId: string;
  }
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.outletId !== data.outletId) {
      throw new ForbiddenError("Access denied to this account");
    }

    // If changing name, check uniqueness
    if (data.name && data.name !== account.name) {
      const existing = await prisma.account.findUnique({
        where: {
          name_outletId: {
            name: data.name,
            outletId: data.outletId,
          },
        },
      });

      if (existing) {
        throw new ValidationError(
          `Account with name "${data.name}" already exists in this outlet`
        );
      }
    }

    // If updating opening balance, recalculate current balance
    let updateData: any = {};
    if (data.name) updateData.name = data.name;

    if (data.openingBalance !== undefined) {
      updateData.openingBalance = data.openingBalance;
      // Recalculate current balance
      const transactions = await prisma.accountTransaction.findMany({
        where: { accountId },
        select: { type: true, amount: true },
      });

      let balance = data.openingBalance;
      for (const txn of transactions) {
        if (txn.type === "IN" || txn.type === "TRANSFER_IN") {
          balance += txn.amount;
        } else if (txn.type === "OUT" || txn.type === "TRANSFER_OUT") {
          balance -= txn.amount;
        }
      }
      updateData.currentBalance = balance;
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });

    revalidatePath("/dashboard/financials/accounts");
    revalidatePath(`/dashboard/financials/accounts/${accountId}`);

    return updated;
  });
}

/**
 * Delete account (only if no transactions)
 */
export async function deleteAccount(
  accountId: string,
  outletId: string
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { transactions: true, payments: true },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.outletId !== outletId) {
      throw new ForbiddenError("Access denied to this account");
    }

    // Check if account has any transactions or payments
    if (account.transactions.length > 0 || account.payments.length > 0) {
      throw new ValidationError(
        "Cannot delete account with existing transactions or payments"
      );
    }

    await prisma.account.delete({
      where: { id: accountId },
    });

    revalidatePath("/dashboard/financials/accounts");
  });
}

/**
 * Calculate current balance from transaction history
 */
function calculateAccountBalance(account: {
  openingBalance: number;
  transactions: Array<{ type: string; amount: number }>;
}): number {
  let balance = account.openingBalance;

  for (const txn of account.transactions) {
    if (txn.type === "IN" || txn.type === "TRANSFER_IN") {
      balance += txn.amount;
    } else if (txn.type === "OUT" || txn.type === "TRANSFER_OUT") {
      balance -= txn.amount;
    }
  }

  return balance;
}
