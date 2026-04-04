"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAdminSession } from "@/lib/outlet-auth";
import { roundToTwo } from "@/lib/utils";

export interface GSTSummary {
  period: {
    startDate: Date;
    endDate: Date;
  };
  outletInfo?: {
    id: string;
    name: string;
  };
  outwardSupplies: {
    invoices: Array<{
      txnNumber: string;
      date: Date;
      partyName: string;
      taxableAmount: number;
      cgst: number;
      sgst: number;
      igst: number;
      totalTax: number;
    }>;
    summary: {
      totalInvoices: number;
      totalTaxableAmount: number;
      totalCGST: number;
      totalSGST: number;
      totalIGST: number;
      totalTax: number;
    };
  };
  inwardSupplies: {
    bills: Array<{
      txnNumber: string;
      date: Date;
      partyName: string;
      taxableAmount: number;
      cgst: number;
      sgst: number;
      igst: number;
      totalTax: number;
      itrClaim?: boolean;
    }>;
    summary: {
      totalBills: number;
      totalTaxableAmount: number;
      totalCGST: number;
      totalSGST: number;
      totalIGST: number;
      totalTax: number;
      totalITRClaim: number;
    };
  };
  taxSummary: {
    totalOutputCGST: number;
    totalOutputSGST: number;
    totalOutputIGST: number;
    totalInputCGST: number;
    totalInputSGST: number;
    totalInputIGST: number;
    netCGSTPayable: number;
    netSGSTPayable: number;
    netIGSTPayable: number;
  };
}

/**
 * Get GST Summary Report for GSTR-1 (Outward Supplies) and GSTR-2B (Inward Supplies)
 * Builds from actual transaction records with tax details
 */
export async function getGSTSummary(
  startDate: Date,
  endDate: Date,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    // Get outlet info if specific outlet requested
    let outletInfo = null;
    if (outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: outletId },
        select: { id: true, name: true },
      });
      outletInfo = outlet;
    }

    // ─── OUTWARD SUPPLIES (GSTR-1) ──────────────────────────────────────────
    const invoices = await prisma.transaction.findMany({
      where: {
        type: "SALES_INVOICE",
        billType: "NO1", // Only taxable invoices
        date: { gte: startDate, lte: endDate },
        status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
        ...(outletId && { outletId }),
      },
      select: {
        id: true,
        txnNumber: true,
        date: true,
        totalTaxable: true,
        totalTax: true,
        party: { select: { name: true, gstin: true } },
        items: {
          select: {
            cgst: true,
            sgst: true,
            igst: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const outwardSupplies = invoices.map((inv) => {
      const totalCGST = inv.items.reduce((sum, item) => sum + item.cgst, 0);
      const totalSGST = inv.items.reduce((sum, item) => sum + item.sgst, 0);
      const totalIGST = inv.items.reduce((sum, item) => sum + item.igst, 0);

      return {
        txnNumber: inv.txnNumber,
        date: inv.date,
        partyName: inv.party?.name || "Unknown",
        taxableAmount: roundToTwo(inv.totalTaxable),
        cgst: roundToTwo(totalCGST),
        sgst: roundToTwo(totalSGST),
        igst: roundToTwo(totalIGST),
        totalTax: roundToTwo(totalCGST + totalSGST + totalIGST),
      };
    });

    const outwardSummary = {
      totalInvoices: outwardSupplies.length,
      totalTaxableAmount: roundToTwo(
        outwardSupplies.reduce((sum, inv) => sum + inv.taxableAmount, 0),
      ),
      totalCGST: roundToTwo(
        outwardSupplies.reduce((sum, inv) => sum + inv.cgst, 0),
      ),
      totalSGST: roundToTwo(
        outwardSupplies.reduce((sum, inv) => sum + inv.sgst, 0),
      ),
      totalIGST: roundToTwo(
        outwardSupplies.reduce((sum, inv) => sum + inv.igst, 0),
      ),
      totalTax: roundToTwo(
        outwardSupplies.reduce((sum, inv) => sum + inv.totalTax, 0),
      ),
    };

    // ─── INWARD SUPPLIES (GSTR-2B) ──────────────────────────────────────────
    const bills = await prisma.transaction.findMany({
      where: {
        type: "PURCHASE_BILL",
        date: { gte: startDate, lte: endDate },
        status: { in: ["POSTED", "PARTIALLY_PAID", "PAID"] },
        ...(outletId && { outletId }),
      },
      select: {
        id: true,
        txnNumber: true,
        date: true,
        totalTaxable: true,
        totalTax: true,
        party: { select: { name: true, gstin: true } },
        items: {
          select: {
            cgst: true,
            sgst: true,
            igst: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const inwardSupplies = bills.map((bill) => {
      const totalCGST = bill.items.reduce((sum, item) => sum + item.cgst, 0);
      const totalSGST = bill.items.reduce((sum, item) => sum + item.sgst, 0);
      const totalIGST = bill.items.reduce((sum, item) => sum + item.igst, 0);

      return {
        txnNumber: bill.txnNumber,
        date: bill.date,
        partyName: bill.party?.name || "Unknown",
        taxableAmount: roundToTwo(bill.totalTaxable),
        cgst: roundToTwo(totalCGST),
        sgst: roundToTwo(totalSGST),
        igst: roundToTwo(totalIGST),
        totalTax: roundToTwo(totalCGST + totalSGST + totalIGST),
        itrClaim: true, // All input taxes are claimable
      };
    });

    const inwardSummary = {
      totalBills: inwardSupplies.length,
      totalTaxableAmount: roundToTwo(
        inwardSupplies.reduce((sum, bill) => sum + bill.taxableAmount, 0),
      ),
      totalCGST: roundToTwo(
        inwardSupplies.reduce((sum, bill) => sum + bill.cgst, 0),
      ),
      totalSGST: roundToTwo(
        inwardSupplies.reduce((sum, bill) => sum + bill.sgst, 0),
      ),
      totalIGST: roundToTwo(
        inwardSupplies.reduce((sum, bill) => sum + bill.igst, 0),
      ),
      totalTax: roundToTwo(
        inwardSupplies.reduce((sum, bill) => sum + bill.totalTax, 0),
      ),
      totalITRClaim: roundToTwo(
        inwardSupplies.reduce((sum, bill) => sum + bill.totalTax, 0),
      ),
    };

    // ─── TAX SUMMARY ────────────────────────────────────────────────────────
    const taxSummary = {
      totalOutputCGST: outwardSummary.totalCGST,
      totalOutputSGST: outwardSummary.totalSGST,
      totalOutputIGST: outwardSummary.totalIGST,
      totalInputCGST: inwardSummary.totalCGST,
      totalInputSGST: inwardSummary.totalSGST,
      totalInputIGST: inwardSummary.totalIGST,
      netCGSTPayable: roundToTwo(
        outwardSummary.totalCGST - inwardSummary.totalCGST,
      ),
      netSGSTPayable: roundToTwo(
        outwardSummary.totalSGST - inwardSummary.totalSGST,
      ),
      netIGSTPayable: roundToTwo(
        outwardSummary.totalIGST - inwardSummary.totalIGST,
      ),
    };

    return {
      period: { startDate, endDate },
      outletInfo,
      outwardSupplies: {
        invoices: outwardSupplies,
        summary: outwardSummary,
      },
      inwardSupplies: {
        bills: inwardSupplies,
        summary: inwardSummary,
      },
      taxSummary,
    };
  });
}
