"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";

export async function getProformaInvoices() {
  return await prisma.transaction.findMany({
    where: { type: "PROFORMA_INVOICE" as any },
    include: {
      party: true,
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function createProformaInvoice(data: {
  partyId: string;
  items: { variantId: string; quantity: number; rate: number }[];
}) {
  const num = `PI-${Date.now()}`;
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

  const pi = await prisma.transaction.create({
    data: {
      type: "PROFORMA_INVOICE" as any,
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
    entity: "PROFORMA_INVOICE",
    entityId: pi.id,
    newValues: { total, partyId: data.partyId },
  });

  revalidatePath("/dashboard/sales/proforma-invoices");
  return pi;
}
