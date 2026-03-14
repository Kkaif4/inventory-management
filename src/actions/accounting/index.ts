"use server";

import { prisma } from "@/lib/prisma";
import { initializeCOA } from "@/domains/accounting/ledger-service";
import { revalidatePath } from "next/cache";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { ForbiddenError, NotFoundError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";

export async function setupCOA(outletId: string) {
  return withErrorHandler(async () => {
    await initializeCOA(outletId);
    revalidatePath("/dashboard/accounts");
  });
}

export async function getAccounts(outletId: string) {
  return withErrorHandler(async () => {
    return await prisma.account.findMany({
      orderBy: { code: "asc" },
      where: {
        outletId,
      },
    });
  });
}

export async function getPartyLedger(partyId: string, outletId: string) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    await validateSessionOutletAccess(outletId);

    // Verify party belongs to this outlet
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party || party.outletId !== outletId) {
      throw new ForbiddenError("Party not found in this outlet");
    }

    return await prisma.ledgerEntry.findMany({
      where: { partyId, transaction: { outletId } }, // Filter by outlet
      include: {
        account: true,
        transaction: true,
      },
      orderBy: { date: "desc" },
    });
  });
}

export async function getAccountStatement(accountId: string, outletId: string) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    await validateSessionOutletAccess(outletId);

    return await prisma.ledgerEntry.findMany({
      where: { accountId, transaction: { outletId } }, // Filter by outlet
      include: {
        transaction: true,
        party: true,
      },
      orderBy: { date: "asc" },
    });
  });
}

export async function createPayment(data: {
  partyId: string;
  outletId: string; // Add outlet scoping
  accountId: string; // The bank/cash account
  amount: number;
  type: "PAYMENT_MADE" | "PAYMENT_RECEIPT";
  date: Date;
  reference?: string;
}) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    const userId = await validateSessionOutletAccess(data.outletId);

    return await prisma.$transaction(async (tx) => {
      // 1. Transaction Record
      const txn = await tx.transaction.create({
        data: {
          type:
            data.type === "PAYMENT_MADE"
              ? "STOCK_ADJUSTMENT"
              : "STOCK_ADJUSTMENT",
          txnNumber: `${data.type === "PAYMENT_MADE" ? "PM" : "PR"}-${Date.now()}`,
          date: data.date,
          partyId: data.partyId,
          outletId: data.outletId, // Add outlet context
          userId,
          grandTotal: roundToTwo(data.amount),
          status: "POSTED",
        },
      });

      const roundedAmount = roundToTwo(data.amount);

      // 2. Accounting Entries
      const bankAcc = await tx.account.findUnique({
        where: { id: data.accountId },
      });
      const creditorAcc = await tx.account.findUnique({
        where: { code_outletId: { code: "2001", outletId: data.outletId } },
      }); // Sundry Creditors
      const debtorAcc = await tx.account.findUnique({
        where: { code_outletId: { code: "1003", outletId: data.outletId } },
      }); // Sundry Debtors

      if (!bankAcc || !creditorAcc || !debtorAcc)
        throw new NotFoundError("Required accounts not found.");

      if (data.type === "PAYMENT_MADE") {
        // Vendor Payment: Dr Creditor (reduction), Cr Bank (reduction)
        await tx.ledgerEntry.createMany({
          data: [
            {
              transactionId: txn.id,
              accountId: creditorAcc.id,
              partyId: data.partyId,
              debit: roundedAmount,
              reference: data.reference,
            },
            {
              transactionId: txn.id,
              accountId: bankAcc.id,
              credit: roundedAmount,
              reference: data.reference,
            },
          ],
        });
      } else {
        // Customer Receipt: Dr Bank (increase), Cr Debtor (reduction)
        await tx.ledgerEntry.createMany({
          data: [
            {
              transactionId: txn.id,
              accountId: bankAcc.id,
              debit: roundedAmount,
              reference: data.reference,
            },
            {
              transactionId: txn.id,
              accountId: debtorAcc.id,
              partyId: data.partyId,
              credit: roundedAmount,
              reference: data.reference,
            },
          ],
        });
      }

      return txn;
    });
  });
}
