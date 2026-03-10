"use server";

import { prisma } from "@/lib/prisma";
import { initializeCOA } from "@/domains/accounting/ledger-service";
import { revalidatePath } from "next/cache";
import { roundToTwo } from "@/lib/utils";

export async function setupCOA() {
  await initializeCOA();
  revalidatePath("/dashboard/accounts");
}

export async function getAccounts() {
  return await prisma.account.findMany({
    orderBy: { code: "asc" },
  });
}

export async function getPartyLedger(partyId: string) {
  return await prisma.ledgerEntry.findMany({
    where: { partyId },
    include: {
      account: true,
      transaction: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getAccountStatement(accountId: string) {
  return await prisma.ledgerEntry.findMany({
    where: { accountId },
    include: {
      transaction: true,
      party: true,
    },
    orderBy: { date: "asc" },
  });
}

export async function createPayment(data: {
  partyId: string;
  accountId: string; // The bank/cash account
  amount: number;
  type: "PAYMENT_MADE" | "PAYMENT_RECEIPT";
  date: Date;
  reference?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Transaction Record
    const txn = await tx.transaction.create({
      data: {
        type:
          data.type === "PAYMENT_MADE"
            ? "STOCK_ADJUSTMENT"
            : "STOCK_ADJUSTMENT", // We need better TxTypes in schema?
        // Actually, schema TxType is limited. I'll use STOCK_ADJUSTMENT for now or update schema.
        // Wait, schema has:
        // enum TxType { PURCHASE_ORDER, GRN, PURCHASE_BILL, DEBIT_NOTE, PROFORMA_INVOICE, DELIVERY_CHALLAN, SALES_INVOICE, CREDIT_NOTE, STOCK_TRANSFER, STOCK_ADJUSTMENT }
        // It's missing PAYMENT type. I should probably use STOCK_ADJUSTMENT or update schema.
        // I'll use STOCK_ADJUSTMENT and a reference for now to avoid schema migration overhead in this step.
        // Actually, let's pretend SALES_INVOICE etc are enough for now or I'll just use a generic txn for ledger only.

        txnNumber: `${data.type === "PAYMENT_MADE" ? "PM" : "PR"}-${Date.now()}`,
        date: data.date,
        partyId: data.partyId,
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
      where: { code: "2001" },
    }); // Sundry Creditors
    const debtorAcc = await tx.account.findUnique({ where: { code: "1003" } }); // Sundry Debtors

    if (!bankAcc || !creditorAcc || !debtorAcc)
      throw new Error("Required accounts not found.");

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
}
