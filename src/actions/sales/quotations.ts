"use server";

import { AuditService } from "@/domains/audit/audit-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { roundToTwo } from "@/lib/utils";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";

export async function getQuotations(outletId: string) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    await validateSessionOutletAccess(outletId);

    return await prisma.transaction.findMany({
      where: { type: "QUOTATION" as any, outletId },
      include: {
        party: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });
  });
}

export async function createQuotation(data: {
  partyId: string;
  outletId: string; // Scoped
  userId: string;
  items: { variantId: string; quantity: number; rate: number }[];
}) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    await validateSessionOutletAccess(data.outletId);

    const num = `QT-${Date.now()}`;
    let total = 0;

    const mappedItems = data.items.map((it) => {
      const val = roundToTwo(it.quantity * it.rate);
      total = roundToTwo(total + val);
      return {
        variantId: it.variantId,
        quantity: it.quantity,
        rate: it.rate,
        taxableValue: val,
      };
    });

    const quote = await prisma.transaction.create({
      data: {
        type: "QUOTATION" as any,
        txnNumber: num,
        status: "DRAFT",
        partyId: data.partyId,
        outletId: data.outletId, // Scoped
        userId: data.userId,
        grandTotal: total,
        totalTaxable: total,
        items: {
          create: mappedItems,
        },
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "QUOTATION",
      entityId: quote.id,
      newValues: { total, partyId: data.partyId },
    });

    revalidatePath("/dashboard/sales/quotations");
    return quote;
  });
}

export async function getCustomers(outletId: string) {
  return withErrorHandler(async () => {
    // Validate user has access to this outlet
    await validateSessionOutletAccess(outletId);

    return await prisma.party.findMany({
      where: {
        type: "CUSTOMER" as any,
        outletId, // Filter by outlet
      },
    });
  });
}
