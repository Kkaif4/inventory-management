"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function lookupSerialNumberWarranty(outletId: string, serialNumber: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const sn = await prisma.serialNumber.findFirst({
      where: {
        serialNumber: { equals: serialNumber.trim(), mode: "insensitive" },
        outletId,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        purchaseItem: {
          include: {
            transaction: {
              include: {
                party: true,
              },
            },
          },
        },
        saleItem: {
          include: {
            transaction: {
              include: {
                party: true,
              },
            },
          },
        },
      },
    });

    if (!sn) return null;

    const warrantyMonths = sn.warrantyMonths ?? sn.variant.product.warrantyMonths ?? 0;
    const isSold = sn.status === "SOLD";
    
    let isWarrantyActive = false;
    if (isSold && sn.warrantyExpiry) {
      isWarrantyActive = new Date(sn.warrantyExpiry) > new Date();
    }

    return {
      id: sn.id,
      serialNumber: sn.serialNumber,
      status: sn.status,
      warrantyMonths,
      warrantyExpiry: sn.warrantyExpiry,
      isWarrantyActive,
      variant: {
        sku: sn.variant.sku,
        name: sn.variant.product.name,
        brand: sn.variant.product.brand,
      },
      purchase: sn.purchaseItem ? {
        id: sn.purchaseItem.transaction.id,
        txnNumber: sn.purchaseItem.transaction.txnNumber,
        date: sn.purchaseItem.transaction.date,
        partyName: sn.purchaseItem.transaction.party?.name,
      } : null,
      sale: sn.saleItem ? {
        id: sn.saleItem.transaction.id,
        txnNumber: sn.saleItem.transaction.txnNumber,
        date: sn.saleItem.transaction.date,
        buyerName: sn.saleItem.transaction.buyerName || sn.saleItem.transaction.party?.name,
        buyerPhone: sn.saleItem.transaction.buyerPhone,
      } : null,
    };
  });
}
