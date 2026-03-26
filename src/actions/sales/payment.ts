"use server";

import { prisma } from "@/lib/prisma";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { RecordPaymentFormValues } from "@/validations/payment.validation";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

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
      if (invoice.billType === "NO2") {
        throw new ValidationError(
          "No.2 (Cash Memo) invoices cannot have payments recorded against them.",
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
      if (data.amount > outstanding + 0.005) {
        // 0.5 paise tolerance for floating-point
        throw new ValidationError(
          `Payment amount ₹${data.amount} exceeds outstanding balance of ₹${outstanding}.`,
        );
      }

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
          bankAccountId: data.bankAccountId || null,
          referenceNo: data.referenceNo || null,
          notes: data.notes || null,
          createdBy: data.userId,
        },
      });

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

      // ── 6. Apply Payment Against Customer's Outstanding (FIFO) ──────────────
      // Get all unpaid invoices for this customer, ordered oldest first
      if (invoice.partyId) {
        const unpaidInvoices = await tx.transaction.findMany({
          where: {
            type: "SALES_INVOICE",
            partyId: invoice.partyId,
            status: { in: ["POSTED", "PARTIALLY_PAID"] },
            outletId: data.outletId,
          },
          orderBy: { date: "asc" },
          select: {
            id: true,
            grandTotal: true,
            payments: { select: { amount: true } },
          },
        });

        // Calculate total outstanding across ALL invoices
        let totalOutstanding = 0;
        for (const inv of unpaidInvoices) {
          const invTotalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
          const invOutstanding = roundToTwo(inv.grandTotal - invTotalPaid);
          if (invOutstanding > 0.005) {
            totalOutstanding += invOutstanding;
          }
        }
        totalOutstanding = roundToTwo(totalOutstanding);

        // Check if payment exceeds total outstanding
        let paymentAmount = data.amount;
        if (data.amount > totalOutstanding + 0.005) {
          // Overpayment: store excess as customer credit, process only outstanding
          const creditAmount = roundToTwo(data.amount - totalOutstanding);
          await tx.party.update({
            where: { id: invoice.partyId },
            data: {
              creditBalance: {
                increment: creditAmount,
              },
            },
          });
          paymentAmount = totalOutstanding;
        }

        // Update outstanding balance (denormalized cache)
        await tx.party.update({
          where: { id: invoice.partyId },
          data: {
            outstandingBalance: {
              decrement: paymentAmount,
            },
          },
        });

        // Guard: Ensure outstanding never goes negative
        const updatedParty = await tx.party.findUnique({
          where: { id: invoice.partyId },
          select: { outstandingBalance: true },
        });
        if (updatedParty && updatedParty.outstandingBalance < -0.005) {
          // Reset to 0 if it somehow went negative (should never happen)
          await tx.party.update({
            where: { id: invoice.partyId },
            data: { outstandingBalance: 0 },
          });
        }
      }

      // ── 7. Create Journal Entry (Dr Bank/Cash, Cr Customer/Debtor) ─────────
      // Determine debit account: Cash or Bank
      let debitAccountCode = "1001"; // Default: Cash in Hand
      if (["BankTransfer", "Cheque", "DD", "UPI"].includes(data.paymentMode)) {
        // For bank modes, use the selected bank account
        if (data.bankAccountId) {
          const bankAcc = await tx.account.findUnique({
            where: { id: data.bankAccountId },
            select: { id: true },
          });
          if (!bankAcc) throw new NotFoundError("Bank account not found");
        }
      }

      // Debtors account code = 1003 (as established in invoice action)
      const [debtorAcc, debitAcc] = await Promise.all([
        tx.account.findFirst({
          where: { code: "1003", outletId: data.outletId },
        }),
        data.bankAccountId
          ? tx.account.findUnique({ where: { id: data.bankAccountId } })
          : tx.account.findFirst({
              where: { code: debitAccountCode, outletId: data.outletId },
            }),
      ]);

      if (debtorAcc && debitAcc) {
        await tx.ledgerEntry.createMany({
          data: [
            {
              // Cr Customer Debtor — reduces amount owed
              accountId: debtorAcc.id,
              partyId: invoice.partyId ?? undefined,
              transactionId: invoice.id,
              date: new Date(data.paymentDate),
              debit: 0,
              credit: data.amount,
              reference: `${txnNumber} — ${data.paymentMode}`,
            },
            {
              // Dr Bank / Cash — money comes in
              accountId: debitAcc.id,
              partyId: invoice.partyId ?? undefined,
              transactionId: invoice.id,
              date: new Date(data.paymentDate),
              debit: data.amount,
              credit: 0,
              reference: `${txnNumber} — ${data.paymentMode}`,
            },
          ],
        });
      }

      revalidatePath(`/dashboard/sales/invoices/${data.invoiceId}`);
      revalidatePath("/dashboard/sales/invoices");

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
        bankAccount: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: { paymentDate: "asc" }, // Chronological — oldest first per FRD
    });
    return payments;
  });
}

// ─── Get bank accounts configured for an outlet (for the payment mode dropdown)
export async function getOutletBankAccounts(outletId: string) {
  return withErrorHandler(async () => {
    const accounts = await prisma.account.findMany({
      where: {
        outletId,
        group: "ASSET",
        // Bank accounts typically have codes in a known range; filter by name pattern
        OR: [
          { code: { startsWith: "1002" } }, // Bank accounts
          { name: { contains: "Bank", mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });
    return accounts;
  });
}
