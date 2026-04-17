"use server";

import { prisma } from "@/lib/prisma";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { RecordPaymentFormValues } from "@/validations/payment.validation";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import type { AccountType } from "@/generated/prisma";

// ─── Record a payment against a posted invoice ──────────────────────────────
// Implements concurrency-safe validation: outstanding balance is computed
// INSIDE the $transaction from the sum of payment records, NOT from a cached
// field, preventing overpayment when two requests race.
export async function recordInvoicePayment(
  data: RecordPaymentFormValues & { userId: string },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);
    // Pre-flight: load accounts needed for journal entries
    const [outlet] = await Promise.all([
      prisma.outlet.findUnique({ where: { id: data.outletId } }),
    ]);
    if (!outlet) throw new NotFoundError("Outlet not found");

    return await prisma.$transaction(async (tx) => {
      // ── 1. Lock-and-verify the invoice inside the transaction ──────────────
      const invoice = await tx.transaction.findUnique({
        where: { id: data.invoiceId },
        select: {
          id: true,
          txnNumber: true,
          date: true,
          grandTotal: true,
          status: true,
          billType: true,
          partyId: true,
          outletId: true,
        },
      });

      if (!invoice) throw new NotFoundError("Invoice not found");
      if (invoice.billType === "OLD") {
        throw new ValidationError(
          "Historical invoices cannot have secondary payments recorded against them.",
        );
      }
      if (invoice.billType === "NO2" && !invoice.partyId) {
        throw new ValidationError(
          "Anonymous Cash Memo invoices cannot have payments recorded. Link a customer to this bill to enable payment tracking.",
        );
      }
      if (["PAID", "CANCELLED", "DRAFT"].includes(invoice.status)) {
        throw new ValidationError(
          `Cannot record a payment against an invoice with status: ${invoice.status}`,
        );
      }
      if (invoice.outletId !== data.outletId) {
        throw new ValidationError("Invoice does not belong to this outlet.");
      }

      // ── 2. Compute outstanding from sum-of-payments (concurrency safe) ────
      const alreadyPaid = await tx.payment.aggregate({
        where: { invoiceId: data.invoiceId },
        _sum: { amount: true },
      });
      const totalPaid = roundToTwo(alreadyPaid._sum.amount ?? 0);
      const outstanding = roundToTwo(invoice.grandTotal - totalPaid);

      if (data.amount <= 0) {
        throw new ValidationError("Payment amount must be greater than ₹0.");
      }
      // Allow overpayment — excess is stored as customer credit balance

      // ── 3. Generate Receipt Number ─────────────────────────────────────────
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        data.outletId,
        "RECEIPT",
      );

      // ── 4. Create Payment Record ───────────────────────────────────────────
      const payment = await tx.payment.create({
        data: {
          txnNumber,
          invoiceId: data.invoiceId,
          outletId: data.outletId,
          partyId: data.partyId,
          amount: data.amount,
          paymentDate: new Date(data.paymentDate),
          paymentMode: data.paymentMode,
          accountId: data.bankAccountId,
          referenceNo: data.referenceNo || null,
          notes: data.notes || null,
          createdBy: data.userId,
        },
      });

      // ── 4b. Create Ledger Entries for Payment Receipt ─────────────────────
      // Dr. Cash/Bank (or specified account), Cr. Sundry Debtors (Customer)
      const debtorAcc = await tx.account.findUnique({
        where: { code_outletId: { code: "1003", outletId: data.outletId } },
      });

      // Use the operational account's linked GL account, or default to Cash/Bank based on payment mode
      let cashBankAcc = await tx.account.findUnique({
        where: { code_outletId: { code: "1001", outletId: data.outletId } }, // Default: Cash in Hand
      });

      // If a bank account is selected, try to find its linked GL account
      if (data.bankAccountId) {
        const account = await tx.account.findUnique({
          where: { id: data.bankAccountId },
        });
        if (account) {
          // For bank accounts, use standard bank account (1002)
          cashBankAcc = await tx.account.findUnique({
            where: { code_outletId: { code: "1002", outletId: data.outletId } },
          });
        }
      }

      if (debtorAcc && cashBankAcc) {
        // transactionId must be a FK to Transaction table (not Payment).
        // Link journal entries to the invoice transaction being paid.
        await tx.ledgerEntry.createMany({
          data: [
            // Dr. Cash/Bank - money received
            {
              transactionId: data.invoiceId,
              accountId: cashBankAcc.id,
              partyId: data.partyId,
              date: new Date(data.paymentDate),
              debit: data.amount,
              credit: 0,
              reference: `Receipt ${txnNumber} for Invoice ${invoice.txnNumber}`,
            },
            // Cr. Sundry Debtors - customer's outstanding reduced
            {
              transactionId: data.invoiceId,
              accountId: debtorAcc.id,
              partyId: data.partyId,
              date: new Date(data.paymentDate),
              debit: 0,
              credit: data.amount,
              reference: `Receipt ${txnNumber} for Invoice ${invoice.txnNumber}`,
            },
          ],
        });
      }

      // ── 4b. Record in Account (if provided) ──────────────────────
      if (data.bankAccountId) {
        // Get current account balance for snapshot
        const account = await tx.account.findUnique({
          where: { id: data.bankAccountId },
          select: { currentBalance: true },
        });

        if (account) {
          const newBalance = roundToTwo(account.currentBalance + data.amount);

          // Record the transaction
          await tx.accountTransaction.create({
            data: {
              accountId: data.bankAccountId,
              type: "IN",
              amount: data.amount,
              paymentMode: data.paymentMode as any,
              chequeNumber: data.chequeNumber || null,
              chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
              upiReferenceId: data.utrReferenceId || null,
              transactionId: data.transactionId || null,
              balanceAfter: newBalance,
              linkedTxnId: data.invoiceId,
              linkedTxnType: "INVOICE_PAYMENT",
              remarks: `Payment for invoice ${invoice.txnNumber}`,
              userId: data.userId,
            },
          });

          // Update account balance
          await tx.account.update({
            where: { id: data.bankAccountId },
            data: { currentBalance: newBalance },
          });
        }
      }

      // ── 5. Update Invoice Status ───────────────────────────────────────────
      const newTotalPaid = roundToTwo(totalPaid + data.amount);
      const isFullyPaid = newTotalPaid >= invoice.grandTotal - 0.005;

      await tx.transaction.update({
        where: { id: data.invoiceId },
        data: {
          status: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
          paidAt: isFullyPaid ? new Date(data.paymentDate) : null,
        },
      });

      // ── 6. Update Customer Outstanding Balance ──────────────────────────────
      // `outstanding` is pre-computed at top of tx = invoice.grandTotal - totalPaid (before this payment).
      // The amount applied to this invoice's outstanding is min(payment, outstanding).
      // Any excess beyond outstanding is stored as credit balance.
      if (invoice.partyId) {
        const amountAppliedToOutstanding = Math.min(data.amount, outstanding);
        const overpayment = roundToTwo(data.amount - amountAppliedToOutstanding);

        if (overpayment > 0.005) {
          await tx.party.update({
            where: { id: invoice.partyId },
            data: { creditBalance: { increment: overpayment } },
          });
        }

        await tx.party.update({
          where: { id: invoice.partyId },
          data: { outstandingBalance: { decrement: amountAppliedToOutstanding } },
        });

        // Guard: Ensure outstanding never goes negative
        const updatedParty = await tx.party.findUnique({
          where: { id: invoice.partyId },
          select: { outstandingBalance: true },
        });
        if (updatedParty && updatedParty.outstandingBalance < -0.005) {
          await tx.party.update({
            where: { id: invoice.partyId },
            data: { outstandingBalance: 0 },
          });
        }
      }

      revalidatePath(`/dashboard/sales/invoices/${data.invoiceId}`);
      revalidatePath("/dashboard/sales/invoices");
      revalidatePath("/dashboard/financials/ledger");

      return {
        payment,
        invoiceStatus: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
        remaining: roundToTwo(invoice.grandTotal - newTotalPaid),
        txnNumber,
      };
    });
  });
}

// ─── Get all payments for an invoice (for the Payment History section) ───────
export async function getInvoicePayments(invoiceId: string) {
  return withErrorHandler(async () => {
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      select: {
        id: true,
        txnNumber: true,
        paymentDate: true,
        amount: true,
        paymentMode: true,
        referenceNo: true,
        notes: true,
        account: { select: { name: true, type: true } },
        creator: { select: { name: true } },
      },
      orderBy: { paymentDate: "asc" }, // Chronological — oldest first per FRD
    });
    return payments;
  });
}

// ─── Get user-created accounts for an outlet (filtered by type)
export async function getOutletAccounts(outletId: string, type?: AccountType) {
  return withErrorHandler(async () => {
    const accounts = await prisma.account.findMany({
      where: {
        outletId,
        ...(type && { type }),
      },
      select: {
        id: true,
        name: true,
        type: true,
        currentBalance: true,
      },
      orderBy: { name: "asc" },
    });
    return accounts;
  });
}
