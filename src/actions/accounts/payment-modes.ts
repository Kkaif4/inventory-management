"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/exceptions";
import { PaymentMode } from "@/generated/prisma";
import {
  validatePaymentModeForAccount,
  ALLOWED_PAYMENT_MODES,
} from "@/lib/account-validation";
import { revalidatePath } from "next/cache";

/**
 * Get allowed payment modes for an account based on its type
 */
export async function getPaymentModesForAccount(accountId: string) {
  return withErrorHandler(async () => {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    return ALLOWED_PAYMENT_MODES[account.type];
  });
}

/**
 * Get configured payment modes for an account
 */
export async function getAccountPaymentModes(accountId: string) {
  return withErrorHandler(async () => {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { paymentModes: true },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    return account.paymentModes;
  });
}

/**
 * Add a payment mode to an account
 */
export async function addPaymentModeToAccount(
  accountId: string,
  paymentMode: PaymentMode,
  outletId: string
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

    // Validate payment mode is allowed for account type
    const validation = validatePaymentModeForAccount(account.type, paymentMode);
    if (!validation.valid) {
      throw new ValidationError(validation.error!);
    }

    // Check if mode already exists
    const existing = await prisma.accountPaymentMode.findUnique({
      where: {
        accountId_mode: {
          accountId,
          mode: paymentMode,
        },
      },
    });

    if (existing) {
      throw new ValidationError(
        `Payment mode ${paymentMode} already configured for this account`
      );
    }

    const mode = await prisma.accountPaymentMode.create({
      data: {
        accountId,
        mode: paymentMode,
      },
    });

    revalidatePath(`/dashboard/financials/accounts/${accountId}`);
    return mode;
  });
}

/**
 * Remove a payment mode from an account
 */
export async function removePaymentModeFromAccount(
  accountId: string,
  paymentMode: PaymentMode,
  outletId: string
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

    // Check if mode exists
    const existing = await prisma.accountPaymentMode.findUnique({
      where: {
        accountId_mode: {
          accountId,
          mode: paymentMode,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError(
        `Payment mode ${paymentMode} not configured for this account`
      );
    }

    await prisma.accountPaymentMode.delete({
      where: {
        accountId_mode: {
          accountId,
          mode: paymentMode,
        },
      },
    });

    revalidatePath(`/dashboard/financials/accounts/${accountId}`);
  });
}

/**
 * Validate that a payment mode is valid for an account
 */
export async function validatePaymentModeForAccountAction(
  accountId: string,
  paymentMode: PaymentMode
) {
  return withErrorHandler(async () => {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    return validatePaymentModeForAccount(account.type, paymentMode);
  });
}
