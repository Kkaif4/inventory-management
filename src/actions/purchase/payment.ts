"use server";

import { prisma } from "@/lib/prisma";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { RecordPaymentFormValues } from "@/validations/payment.validation";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

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

      // ── 7. Create Journal Entry (Dr Creditor, Cr Bank/Cash) ────────────────────
      // For vendor payments: we're paying OUT, so:
      // - Debit: Creditor (reduce what we owe)
      // - Credit: Bank/Cash (reduce bank balance)

      let creditAccountCode = "1001"; // Default: Cash in Hand
      if (["BankTransfer", "Cheque", "DD", "UPI"].includes(data.paymentMode)) {
        if (data.bankAccountId) {
          const bankAcc = await tx.account.findUnique({
            where: { id: data.bankAccountId },
            select: { id: true },
          });
          if (!bankAcc) throw new NotFoundError("Bank account not found");
        }
      }

      // Creditor account code = 2001
      const [creditorAcc, creditAcc] = await Promise.all([
        tx.account.findFirst({
          where: { code: "2001", outletId: data.outletId },
        }),
        data.bankAccountId
          ? tx.account.findUnique({ where: { id: data.bankAccountId } })
          : tx.account.findFirst({
              where: { code: creditAccountCode, outletId: data.outletId },
            }),
      ]);

      if (creditorAcc && creditAcc) {
        await tx.ledgerEntry.createMany({
          data: [
            {
              // Dr Creditor — reduces amount we owe
              accountId: creditorAcc.id,
              partyId: bill.partyId ?? undefined,
              transactionId: bill.id,
              date: new Date(data.paymentDate),
              debit: data.amount,
              credit: 0,
              reference: `${txnNumber} — ${data.paymentMode}`,
            },
            {
              // Cr Bank / Cash — money goes out
              accountId: creditAcc.id,
              partyId: bill.partyId ?? undefined,
              transactionId: bill.id,
              date: new Date(data.paymentDate),
              debit: 0,
              credit: data.amount,
              reference: `${txnNumber} — ${data.paymentMode}`,
            },
          ],
        });
      }

      revalidatePath(`/dashboard/purchase/vendors/${data.partyId}`);
      revalidatePath("/dashboard/purchase/vendors");

      return {
        payment,
        billStatus: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
        remaining: roundToTwo(bill.grandTotal - newTotalPaid),
        txnNumber,
      };
    });
  });
}
