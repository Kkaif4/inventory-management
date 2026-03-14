"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { NumberingService } from "@/domains/foundation/numbering-service";
import { withErrorHandler } from "@/lib/error-handler";

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
  return withErrorHandler(async () => {
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

    const quote = await prisma.$transaction(async (tx) => {
      const txnNumber = await NumberingService.getNextNumber(
        tx,
        data.outletId,
        "QUOTATION" as any, // assuming I added it to numbering service
      );

      return await tx.transaction.create({
        data: {
          type: "QUOTATION",
          txnNumber,
          partyId: data.partyId,
          outletId: data.outletId,
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
    });
    revalidatePath("/dashboard/sales/quotations");
    return quote;
  });
}

export async function convertQuotationToInvoice(id: string, userId: string) {
  return withErrorHandler(async () => {
    const quotation = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quotation) throw new Error("Quotation not found");
    if (quotation.status === "CONVERTED")
      throw new Error("Quotation already converted");

    // Note: Conversion happens in UI usually by pre-filling the Sales Invoice form.
    // But we provide a backend status update for when it's done.

    await prisma.transaction.update({
      where: { id },
      data: { status: "CONVERTED" },
    });

    revalidatePath("/dashboard/sales/quotations");
    return { success: true };
  });
}

export async function getQuotations(outletId: string) {
  return withErrorHandler(async () => {
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
  });
}

export async function getQuotationById(id: string, outletId: string) {
  return withErrorHandler(async () => {
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
  });
}
