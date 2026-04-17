"use server";

import { prisma } from "@/lib/prisma";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { AccountingService } from "@/domains/accounting/ledger-service";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/exceptions";
import { roundToTwo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { migrateAttachments } from "@/actions/attachments";
import { OldBillFormValues } from "@/validations/invoice.validation";

/**
 * Create a historical bill (OLD mode)
 * Rules:
 * - YES LedgerEntry records — full double-entry accounting for party ledger & outstanding
 * - YES outstandingBalance update — reflects historical debts
 * - NO Stock balance updates — no physical inventory to deduct
 * - NO Tax entries — OLD bills are lump-sum totals
 */
export async function createOldBill(
  data: OldBillFormValues & { userId: string },
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.fromOutletId);

    return await prisma.$transaction(async (tx) => {
      // 0. Calculate grandTotal from items, discount, freight
      // Formula: (quantity * rate) - (discount%) + freight
      const itemsSubtotal = roundToTwo(
        (data.items || []).reduce((sum, item) => {
          return sum + roundToTwo(item.quantity * item.rate);
        }, 0),
      );

      const discountAmount = roundToTwo(
        (itemsSubtotal * (data.headerDiscount || 0)) / 100,
      );
      const calculatedGrandTotal = roundToTwo(
        itemsSubtotal - discountAmount + (data.freightCost || 0),
      );

      // Validate that provided grandTotal matches calculation (within tolerance)
      if (Math.abs(data.grandTotal - calculatedGrandTotal) > 0.01) {
        throw new ValidationError(
          `Total mismatch: Calculated ₹${calculatedGrandTotal} but got ₹${data.grandTotal}. ` +
            `Total = (Quantity × Rate) - (Discount%) + Freight`,
        );
      }

      // 1. Party Handling - Phone is NOT a unique key for OLD bills
      let partyId = data.partyId;
      if (!partyId) {
        // Create a new party if not picked from dropdown
        const newParty = await tx.party.create({
          data: {
            type: "CUSTOMER",
            name: data.buyerName,
            phone: data.buyerPhone,
            address: "—",
            state: "—",
            outstandingBalance: 0,
            creditPeriod: 0,
            outletId: data.fromOutletId,
          },
        });
        partyId = newParty.id;
      }

      // 2. Transaction Number Strategy
      let txnNumber: string;
      if (data.customBillNo?.trim()) {
        txnNumber = `OLD/${data.customBillNo.trim()}`;

        // Check for uniqueness within the system
        const existing = await tx.transaction.findUnique({
          where: { txnNumber },
        });
        if (existing) {
          throw new ValidationError(
            `Bill number "${data.customBillNo}" already exists.`,
          );
        }
      } else {
        // Auto-generate if blank
        txnNumber = await NumberingService.getNextNumber(
          tx,
          data.fromOutletId,
          "OLD_BILL",
        );
      }

      // 3. Determine Status & Payment Date (Historical)
      const totalPaid = roundToTwo(
        data.payments.reduce((s, p) => s + p.amount, 0),
      );
      const balance = roundToTwo(calculatedGrandTotal - totalPaid);
      let status: "POSTED" | "PAID" | "PARTIALLY_PAID" = "POSTED";
      let paidAt: Date | null = null;

      if (totalPaid >= calculatedGrandTotal - 0.005) {
        status = "PAID";
        if (data.payments.length > 0) {
          const paymentTimes = data.payments
            .map((p) => (p.paymentDate ? new Date(p.paymentDate).getTime() : 0))
            .filter((t) => t > 0);
          if (paymentTimes.length > 0) {
            paidAt = new Date(Math.max(...paymentTimes));
          } else {
            paidAt = data.date;
          }
        } else {
          paidAt = data.date;
        }
      } else if (totalPaid > 0) {
        status = "PARTIALLY_PAID";
      }

      // 4. Fetch or auto-create GL Accounts for ledger entries
      let salesAcc = await tx.account.findUnique({
        where: {
          code_outletId: { code: "3001", outletId: data.fromOutletId },
        },
      });

      let debtorAcc = await tx.account.findUnique({
        where: {
          code_outletId: { code: "1003", outletId: data.fromOutletId },
        },
      });

      let cashAcc = await tx.account.findUnique({
        where: {
          code_outletId: { code: "1001", outletId: data.fromOutletId },
        },
      });

      // Auto-create missing accounts
      if (!salesAcc) {
        salesAcc = await tx.account.create({
          data: {
            code: "3001",
            name: "Sales Account",
            group: "INCOME",
            outletId: data.fromOutletId,
            isSystem: true,
          },
        });
      }

      if (!debtorAcc) {
        debtorAcc = await tx.account.create({
          data: {
            code: "1003",
            name: "Sundry Debtors",
            group: "ASSET",
            outletId: data.fromOutletId,
            isSystem: true,
          },
        });
      }

      if (!cashAcc) {
        cashAcc = await tx.account.create({
          data: {
            code: "1001",
            name: "Cash in Hand",
            group: "ASSET",
            outletId: data.fromOutletId,
            isSystem: true,
          },
        });
      }

      // 5. Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          type: "SALES_INVOICE",
          billType: "OLD",
          isInformal: true,
          txnNumber,
          customBillNo: data.customBillNo,
          date: data.date,
          partyId,
          outletId: data.fromOutletId,
          userId: data.userId,
          grandTotal: calculatedGrandTotal,
          totalTaxable: itemsSubtotal,
          totalTax: 0,
          globalDiscount: data.headerDiscount || 0,
          freightCost: data.freightCost || 0,
          status,
          paidAt,
          remarks: data.remarks,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          items: {
            create:
              data.items?.map((item) => ({
                itemDescription: item.itemDescription,
                quantity: item.quantity,
                rate: item.rate,
                taxableValue: roundToTwo(item.quantity * item.rate),
                cgst: 0,
                sgst: 0,
                igst: 0,
              })) || [],
          },
          oldBillPayments: {
            create: data.payments.map((p) => ({
              amount: p.amount,
              paymentDate: p.paymentDate || new Date(),
              note: p.note,
            })),
          },
        },
      });

      // 6. Ledger Entry — Invoice (double-entry for the sale)
      //    Debit  Sundry Debtors (1003) → grandTotal (receivable created)
      //    Credit Sales Account  (3001) → grandTotal (revenue recognized)
      //    Date = historical bill date from the physical book
      await AccountingService.postJournalEntry(tx, {
        transactionId: transaction.id,
        partyId,
        date: new Date(data.date), // Historical bill date, NOT today
        entries: [
          {
            accountId: debtorAcc.id,
            debit: calculatedGrandTotal,
            reference: `Historical bill ${txnNumber}`,
          },
          {
            accountId: salesAcc.id,
            credit: calculatedGrandTotal,
            reference: `Historical bill ${txnNumber}`,
          },
        ],
      });

      // 7. Ledger Entries — Each Payment (reduce receivable)
      //    For each historical payment:
      //    Debit  Cash in Hand (1001)     → payment.amount
      //    Credit Sundry Debtors (1003)   → payment.amount
      //    Date = historical payment date from the physical book
      for (const payment of data.payments) {
        // Ensure paymentDate exists (should be guaranteed by form submission filter)
        const paymentDate = payment.paymentDate || new Date();

        await AccountingService.postJournalEntry(tx, {
          transactionId: transaction.id,
          partyId,
          date: new Date(paymentDate), // Historical payment date, NOT today
          entries: [
            {
              accountId: cashAcc.id,
              debit: roundToTwo(payment.amount),
              reference: `Payment for historical bill ${txnNumber}`,
            },
            {
              accountId: debtorAcc.id,
              credit: roundToTwo(payment.amount),
              reference: `Payment for historical bill ${txnNumber}`,
            },
          ],
        });
      }

      // 8. Update Party outstanding balance
      //    Only increment by the unpaid portion (calculatedGrandTotal - totalPaid)
      if (balance > 0.005) {
        await tx.party.update({
          where: { id: partyId },
          data: {
            outstandingBalance: {
              increment: balance,
            },
          },
        });
      }

      // 9. Migrate Attachments
      const tempRefBasic = `TEMP:${txnNumber}`;
      await migrateAttachments("INVOICE", tempRefBasic, transaction.id);

      if (data.customBillNo) {
        await migrateAttachments(
          "INVOICE",
          `TEMP:${data.customBillNo}`,
          transaction.id,
        );
      }

      // Revalidate all affected pages
      revalidatePath("/dashboard/sales/invoices");
      revalidatePath("/dashboard/reports/sales");
      revalidatePath(`/dashboard/sales/customers/${partyId}`);
      revalidatePath("/dashboard/sales/customers");
      revalidatePath("/dashboard/financials/ledger");

      return { transaction, partyId };
    });
  });
}
