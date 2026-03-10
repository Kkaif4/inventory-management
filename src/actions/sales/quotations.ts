"use server";

import { AuditService } from "@/domains/audit/audit-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { roundToTwo } from "@/lib/utils";

export async function getQuotations() {
  return await prisma.transaction.findMany({
    where: { type: "QUOTATION" as any },
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
}

export async function createQuotation(data: {
  partyId: string;
  items: { variantId: string; quantity: number; rate: number }[];
}) {
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

  return quote;
}

export async function getCustomers() {
  return await prisma.party.findMany({
    where: { type: "CUSTOMER" as any },
  });
}
