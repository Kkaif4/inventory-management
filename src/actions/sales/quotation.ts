"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function createQuotation(data: {
  partyId: string;
  outletId: string; // Scoping
  userId: string;
  items: {
    variantId: string;
    quantity: number;
    rate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
  }[];
}) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(data.outletId);

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
      type: "QUOTATION",
      txnNumber: `QTN-${Date.now()}`,
      partyId: data.partyId,
      outletId: data.outletId, // Scoped
      userId: data.userId,
      totalTaxable,
      totalTax,
      grandTotal,
      status: "DRAFT",
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

export async function getQuotations(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.transaction.findMany({
    where: {
      type: "QUOTATION",
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

export async function getQuotationById(id: string, outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  const quotation = await prisma.transaction.findUnique({
    where: { id },
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
  });

  // Verify quotation belongs to requested outlet
  if (quotation && quotation.outletId !== outletId) {
    throw new Error("403: Quotation not found in this outlet");
  }

  return quotation;
}
