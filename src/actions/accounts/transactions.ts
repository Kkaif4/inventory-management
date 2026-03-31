"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/exceptions";
import { PaymentMode, TransactionType } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import {
  validatePaymentModeForAccount,
  validatePaymentModeFields,
} from "@/lib/account-validation";
import { roundToTwo } from "@/lib/utils";

/**
 * Record a transaction in an account
 */
export async function recordAccountTransaction(data: {
  accountId: string;
  type: TransactionType;
  amount: number;
  paymentMode: PaymentMode;
  chequeNumber?: string;
  chequeDate?: Date;
  upiReferenceId?: string;
  transactionId?: string;
  linkedTxnId?: string;
  linkedTxnType?: string;
  remarks?: string;
  outletId: string;
  userId: string;
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);

    // Fetch account
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.outletId !== data.outletId) {
      throw new ForbiddenError("Access denied to this account");
    }

    // Validate payment mode
    const modeValidation = validatePaymentModeForAccount(
      account.type,
      data.paymentMode
    );
    if (!modeValidation.valid) {
      throw new ValidationError(modeValidation.error!);
    }

    // Validate payment mode fields
    const fieldsValidation = validatePaymentModeFields(data.paymentMode, {
      chequeNumber: data.chequeNumber,
      chequeDate: data.chequeDate,
      upiReferenceId: data.upiReferenceId,
      transactionId: data.transactionId,
    });
    if (!fieldsValidation.valid) {
      throw new ValidationError(fieldsValidation.error!);
    }

    // Calculate new balance
    let newBalance = account.currentBalance;
    if (data.type === "IN" || data.type === "TRANSFER_IN") {
      newBalance = roundToTwo(newBalance + data.amount);
    } else if (data.type === "OUT" || data.type === "TRANSFER_OUT") {
      newBalance = roundToTwo(newBalance - data.amount);
    }

    // Record transaction in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const txn = await tx.accountTransaction.create({
        data: {
          accountId: data.accountId,
          type: data.type,
          amount: roundToTwo(data.amount),
          paymentMode: data.paymentMode,
          chequeNumber: data.chequeNumber,
          chequeDate: data.chequeDate,
          upiReferenceId: data.upiReferenceId,
          transactionId: data.transactionId,
          linkedTxnId: data.linkedTxnId,
          linkedTxnType: data.linkedTxnType,
          balanceAfter: newBalance,
          remarks: data.remarks,
          userId: data.userId,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: newBalance },
      });

      return txn;
    });

    revalidatePath(`/dashboard/financials/accounts/${data.accountId}`);
    revalidatePath("/dashboard/financials/accounts");

    return transaction;
  });
}

/**
 * Get transaction history for an account
 */
export async function getAccountTransactionHistory(
  accountId: string,
  outletId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    type?: TransactionType;
  }
) {
  return withErrorHandler(async () => {
    // Validate inputs
    if (!accountId || !outletId) {
      throw new ValidationError("Account ID and Outlet ID are required");
    }

    await validateSessionOutletAccess(outletId);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.outletId !== outletId) {
      throw new ForbiddenError("Access denied to this account");
    }

    const whereClause: any = {
      accountId,
    };

    if (options?.startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: options.startDate,
      };
    }

    if (options?.endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: options.endDate,
      };
    }

    if (options?.type) {
      whereClause.type = options.type;
    }

    const transactions = await prisma.accountTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });

    return transactions;
  });
}

/**
 * Get account balance at a specific date
 */
export async function getAccountBalance(
  accountId: string,
  outletId: string,
  asOfDate?: Date
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.outletId !== outletId) {
      throw new ForbiddenError("Access denied to this account");
    }

    // If no specific date, return current balance
    if (!asOfDate) {
      return account.currentBalance;
    }

    // Calculate balance as of specific date
    const transactions = await prisma.accountTransaction.findMany({
      where: {
        accountId,
        createdAt: { lte: asOfDate },
      },
      select: { type: true, amount: true },
    });

    let balance = account.openingBalance;
    for (const txn of transactions) {
      if (txn.type === "IN" || txn.type === "TRANSFER_IN") {
        balance += txn.amount;
      } else if (txn.type === "OUT" || txn.type === "TRANSFER_OUT") {
        balance -= txn.amount;
      }
    }

    return balance;
  });
}

/**
 * Get transactions linked to a specific invoice or payment
 */
export async function getLinkedTransactions(
  linkedTxnId: string,
  outletId: string
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.accountTransaction.findMany({
      where: {
        linkedTxnId,
        account: { outletId },
      },
      include: { account: true },
      orderBy: { createdAt: "desc" },
    });
  });
}
