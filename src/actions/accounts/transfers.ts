"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/exceptions";
import { revalidatePath } from "next/cache";
import { validateTransfer } from "@/lib/account-validation";
import { roundToTwo } from "@/lib/utils";

/**
 * Transfer funds between two accounts
 */
export async function transferBetweenAccounts(data: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: Date;
  remarks?: string;
  outletId: string;
  userId: string;
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);

    // Validate transfer
    const validation = validateTransfer({
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
    });
    if (!validation.valid) {
      throw new ValidationError(validation.error!);
    }

    // Fetch both accounts
    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findUnique({
        where: { id: data.fromAccountId },
      }),
      prisma.account.findUnique({
        where: { id: data.toAccountId },
      }),
    ]);

    if (!fromAccount) {
      throw new NotFoundError("Source account not found");
    }

    if (!toAccount) {
      throw new NotFoundError("Destination account not found");
    }

    // Validate amount - must be a valid positive number
    const roundedAmount = roundToTwo(data.amount);

    if (isNaN(roundedAmount) || !isFinite(roundedAmount)) {
      throw new ValidationError("Transfer amount must be a valid number");
    }

    if (roundedAmount <= 0) {
      throw new ValidationError("Transfer amount must be greater than zero");
    }

    if (roundedAmount === 0) {
      throw new ValidationError("Transfer amount cannot be zero");
    }

    // Check if source account has sufficient funds
    if (fromAccount.currentBalance < roundedAmount) {
      throw new ValidationError(
        `Insufficient funds in source account. Available balance: ${fromAccount.currentBalance.toFixed(2)}, Transfer amount: ${roundedAmount.toFixed(2)}`,
      );
    }

    // Verify both accounts belong to the outlet
    if (fromAccount.outletId !== data.outletId) {
      throw new ForbiddenError("Access denied to source account");
    }

    if (toAccount.outletId !== data.outletId) {
      throw new ForbiddenError("Access denied to destination account");
    }

    // Perform transfer in transaction
    const transfer = await prisma.$transaction(async (tx) => {
      // Create transfer record
      const txf = await tx.transfer.create({
        data: {
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          amount: roundedAmount,
          date: data.date,
          remarks: data.remarks,
          userId: data.userId,
        },
      });

      // Record OUT transaction on source account
      const fromNewBalance = roundToTwo(
        fromAccount.currentBalance - roundedAmount,
      );
      await tx.accountTransaction.create({
        data: {
          accountId: data.fromAccountId,
          type: "TRANSFER_OUT",
          amount: roundedAmount,
          paymentMode: "CASH", // Transfers don't need payment mode, but it's required in schema
          balanceAfter: fromNewBalance,
          linkedTxnId: txf.id,
          linkedTxnType: "TRANSFER",
          userId: data.userId,
        },
      });

      // Update source account balance
      await tx.account.update({
        where: { id: data.fromAccountId },
        data: { currentBalance: fromNewBalance },
      });

      // Record IN transaction on destination account
      const toNewBalance = roundToTwo(toAccount.currentBalance + roundedAmount);
      await tx.accountTransaction.create({
        data: {
          accountId: data.toAccountId,
          type: "TRANSFER_IN",
          amount: roundedAmount,
          paymentMode: "CASH", // Transfers don't need payment mode, but it's required in schema
          balanceAfter: toNewBalance,
          linkedTxnId: txf.id,
          linkedTxnType: "TRANSFER",
          userId: data.userId,
        },
      });

      // Update destination account balance
      await tx.account.update({
        where: { id: data.toAccountId },
        data: { currentBalance: toNewBalance },
      });

      return txf;
    });

    revalidatePath("/dashboard/financials/accounts");
    revalidatePath(`/dashboard/financials/accounts/${data.fromAccountId}`);
    revalidatePath(`/dashboard/financials/accounts/${data.toAccountId}`);

    return transfer;
  });
}

/**
 * Get transfer history for an account
 */
export async function getTransferHistory(
  accountId: string,
  outletId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
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

    const transfers = await Promise.all([
      // Transfers OUT
      prisma.transfer.findMany({
        where: { fromAccountId: accountId },
        include: { toAccount: true },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      // Transfers IN
      prisma.transfer.findMany({
        where: { toAccountId: accountId },
        include: { fromAccount: true },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
    ]);

    // Combine and sort by date
    const allTransfers = [
      ...transfers[0].map((t) => ({ ...t, direction: "OUT" as const })),
      ...transfers[1].map((t) => ({ ...t, direction: "IN" as const })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allTransfers.slice(0, options?.limit || 50);
  });
}

/**
 * Get all transfers for an outlet (no specific account)
 */
export async function getOutletTransfers(
  outletId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    return await prisma.transfer.findMany({
      where: {
        fromAccount: { outletId },
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    });
  });
}

/**
 * Get transfer details
 */
export async function getTransferDetails(transferId: string, outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        fromAccount: true,
        toAccount: true,
      },
    });

    if (!transfer) {
      throw new NotFoundError("Transfer not found");
    }

    if (transfer.fromAccount.outletId !== outletId) {
      throw new ForbiddenError("Access denied to this transfer");
    }

    return transfer;
  });
}
