"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function debugTransactionsForOutlet(outletId: string) {
  try {
    // Validate access
    await validateSessionOutletAccess(outletId);

    console.log(`\n🔍 [DEBUG] Transactions for outlet: ${outletId}\n`);

    // Get outlet info
    const outlet = await prisma.outlet.findUnique({
      where: { id: outletId },
      select: { id: true, name: true },
    });

    console.log(`Outlet:`, outlet);

    // Get ALL transactions for this outlet (no type filter)
    const allTransactions = await prisma.transaction.findMany({
      where: { outletId },
      select: {
        id: true,
        type: true,
        txnNumber: true,
        date: true,
        status: true,
        grandTotal: true,
      },
      orderBy: { date: "desc" },
      take: 20,
    });

    console.log(`\nAll transactions for outlet (last 20):`);
    console.log(`Total in DB for this outlet: ${allTransactions.length}`);
    if (allTransactions.length > 0) {
      console.table(allTransactions);
    } else {
      console.log("  ❌ No transactions found!");
    }

    // Count by type
    const invoiceCount = await prisma.transaction.count({
      where: { type: "SALES_INVOICE", outletId },
    });
    const returnCount = await prisma.transaction.count({
      where: { type: { in: ["CREDIT_NOTE", "STOCK_RETURN"] }, outletId },
    });

    console.log(`\nCounts by type:`);
    console.log(`  SALES_INVOICE: ${invoiceCount}`);
    console.log(`  CREDIT_NOTE/STOCK_RETURN: ${returnCount}`);

    // Check if there are invoices in OTHER outlets
    const invoicesInOtherOutlets = await prisma.transaction.count({
      where: { type: "SALES_INVOICE" },
    });
    const allOutlets = await prisma.outlet.count();

    console.log(`\nSystem-wide stats:`);
    console.log(`  Total outlets: ${allOutlets}`);
    console.log(
      `  Total SALES_INVOICE transactions: ${invoicesInOtherOutlets}`,
    );

    // Return summary
    return {
      outlet,
      allTransactions,
      counts: { invoices: invoiceCount, returns: returnCount },
      systemStats: {
        totalOutlets: allOutlets,
        totalInvoices: invoicesInOtherOutlets,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[DEBUG] Error:`, message);
    throw error;
  }
}
