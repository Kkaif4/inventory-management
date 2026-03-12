"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProformaInvoice(data: {
  partyId: string;
  outletId: string; // Scoping
  items: {
    variantId: string;
    quantity: number;
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
  }[];
  userId: string;
}) {
  const totalTaxable = data.items.reduce(
    (sum, item) => sum + item.taxableValue,
    0,
  );
  const totalTax = data.items.reduce(
    (sum, item) => sum + item.cgst + item.sgst + item.igst,
    0,
  );
  const grandTotal = totalTaxable + totalTax;

  const quote = await prisma.transaction.create({
    data: {
      type: "PROFORMA_INVOICE",
      txnNumber: `QTN-${Date.now()}`,
      partyId: data.partyId,
      outletId: data.outletId, // Scoped
      totalTaxable,
      totalTax,
      grandTotal,
      status: "DRAFT",
      userId: data.userId,
      items: {
        create: data.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          rate: item.rate,
          taxableValue: item.taxableValue,
          cgst: item.cgst,
          sgst: item.sgst,
          igst: item.igst,
        })),
      },
    },
  });

  revalidatePath("/dashboard/sales/quotations");
  return quote;
}

export async function getProformaInvoices(outletId: string) {
  return await prisma.transaction.findMany({
    where: {
      type: "PROFORMA_INVOICE",
      outletId: outletId,
    },
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
