"use server";

import { prisma } from "@/lib/prisma";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { RecordPaymentFormValues } from "@/validations/payment.validation";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { AccountingService } from "@/domains/accounting/ledger-service";

// ─── Record a payment against a posted bill ────────────────────────────────────
// For vendors (we pay TO vendors). Updates accounts: Dr Creditor, Cr Bank/Cash
export async function recordVendorBillPayment(
  data: RecordPaymentFormValues & { userId: string },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);
    const [outlet] = await Promise.all([
      prisma.outlet.findUnique({ where: { id: data.outletId } }),
    ]);
    if (!outlet) throw new NotFoundError("Outlet not found");

    return await prisma.$transaction(async (tx) => {
      // ── 1. Load and verify the bill ────────────────────────────────────────────
      const bill = await tx.transaction.findUnique({
        where: { id: data.invoiceId },
        select: {
          id: true,
          txnNumber: true,
          date: true,
          grandTotal: true,
          status: true,
          type: true,
          partyId: true,
          outletId: true,
        },
      });

      if (!bill) throw new NotFoundError("Bill not found");
      if (bill.outletId !== data.outletId) {
        throw new ValidationError("Bill does not belong to this outlet.");
      }
      if (["PAID", "CANCELLED", "DRAFT"].includes(bill.status)) {
        throw new ValidationError(
          `Cannot record a payment against a bill with status: ${bill.status}`,
        );
      }

      // ── 2. Compute outstanding from sum-of-payments (concurrency safe) ────────
      const alreadyPaid = await tx.payment.aggregate({
        where: { invoiceId: data.invoiceId },
        _sum: { amount: true },
      });
      const totalPaid = roundToTwo(alreadyPaid._sum.amount ?? 0);
      const outstanding = roundToTwo(bill.grandTotal - totalPaid);

      if (data.amount <= 0) {
        throw new ValidationError("Payment amount must be greater than ₹0.");
      }
      if (data.amount > outstanding + 0.005) {
        throw new ValidationError(
          `Payment amount ₹${data.amount} exceeds outstanding balance of ₹${outstanding}.`,
        );
      }

      // ── 3. Generate Payment Number ─────────────────────────────────────────────
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        data.outletId,
        "RECEIPT",
      );

      // ── 4. Create Payment Record ───────────────────────────────────────────────
      // Validate that accountId is provided (now required in Payment model)
      if (!data.bankAccountId) {
        throw new ValidationError("Payment account is required");
      }

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

      // ── 4b. Create GL Entries for Payment (Double-Entry) ─────────────────────
      // Dr Creditors (2001), Cr Cash/Bank (payment account)
      const creditorAcc = await tx.account.findUnique({
        where: { code_outletId: { code: "2001", outletId: data.outletId } },
      });

      if (creditorAcc && data.bankAccountId) {
        await AccountingService.postJournalEntry(tx, {
          transactionId: payment.id,
          partyId: data.partyId,
          date: new Date(data.paymentDate),
          entries: [
            // Dr Creditors - liability reduced
            {
              accountId: creditorAcc.id,
              debit: data.amount,
              reference: `Payment ${txnNumber} for Bill ${bill.txnNumber}`,
            },
            // Cr Cash/Bank - money paid out
            {
              accountId: data.bankAccountId,
              credit: data.amount,
              reference: `Payment ${txnNumber} for Bill ${bill.txnNumber}`,
            },
          ],
        });
      }

      // ── 4c. Record in Account (if provided) ──────────────────────
      if (data.bankAccountId) {
        // Get current account balance for snapshot
        const account = await tx.account.findUnique({
          where: { id: data.bankAccountId },
          select: { currentBalance: true },
        });

        if (account) {
          const newBalance = roundToTwo(account.currentBalance - data.amount);

          // Record the transaction
          await tx.accountTransaction.create({
            data: {
              accountId: data.bankAccountId,
              type: "OUT",
              amount: data.amount,
              paymentMode: data.paymentMode as any,
              chequeNumber: data.chequeNumber || null,
              chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
              upiReferenceId: data.utrReferenceId || null,
              transactionId: data.transactionId || null,
              balanceAfter: newBalance,
              linkedTxnId: data.invoiceId,
              linkedTxnType: "VENDOR_PAYMENT",
              remarks: `Payment for bill ${bill.txnNumber}`,
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

      // ── 5. Update Bill Status ──────────────────────────────────────────────────
      const newTotalPaid = roundToTwo(totalPaid + data.amount);
      const isFullyPaid = newTotalPaid >= bill.grandTotal - 0.005;

      await tx.transaction.update({
        where: { id: data.invoiceId },
        data: {
          status: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
          paidAt: isFullyPaid ? new Date(data.paymentDate) : null,
        },
      });

      // ── 6. Update Outstanding Balance (denormalized cache) ────────────────────
      if (bill.partyId) {
        // Calculate total outstanding across ALL bills
        const unpaidBills = await tx.transaction.findMany({
          where: {
            type: "PURCHASE_ORDER",
            partyId: bill.partyId,
            status: { in: ["POSTED", "PARTIALLY_PAID"] },
            outletId: data.outletId,
          },
          select: {
            id: true,
            grandTotal: true,
            payments: { select: { amount: true } },
          },
        });

        let totalOutstanding = 0;
        for (const inv of unpaidBills) {
          const invTotalPaid = inv.payments.reduce((a, b) => a + b.amount, 0);
          const invOutstanding = roundToTwo(inv.grandTotal - invTotalPaid);
          if (invOutstanding > 0.005) {
            totalOutstanding += invOutstanding;
          }
        }
        totalOutstanding = roundToTwo(totalOutstanding);

        // Determine payment amount to apply
        let paymentAmount = data.amount;
        if (data.amount > totalOutstanding + 0.005) {
          // Overpayment: store as vendor credit, process only outstanding
          const creditAmount = roundToTwo(data.amount - totalOutstanding);
          await tx.party.update({
            where: { id: bill.partyId },
            data: {
              creditBalance: {
                increment: creditAmount,
              },
            },
          });
          paymentAmount = totalOutstanding;
        }

        // Update outstanding balance
        await tx.party.update({
          where: { id: bill.partyId },
          data: {
            outstandingBalance: {
              decrement: paymentAmount,
            },
          },
        });

        // Guard: ensure outstanding never goes negative
        const updatedParty = await tx.party.findUnique({
          where: { id: bill.partyId },
          select: { outstandingBalance: true },
        });
        if (updatedParty && updatedParty.outstandingBalance < -0.005) {
          await tx.party.update({
            where: { id: bill.partyId },
            data: { outstandingBalance: 0 },
          });
        }
      }


      revalidatePath(`/dashboard/purchase/vendors/${data.partyId}`);
      revalidatePath("/dashboard/purchase/vendors");
      revalidatePath("/dashboard/financials/ledger");

      return {
        payment,
        billStatus: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
        remaining: roundToTwo(bill.grandTotal - newTotalPaid),
        txnNumber,
      };
    });
  });
}
