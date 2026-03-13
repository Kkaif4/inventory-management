"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function getVariantLedger(
  outletId: string,
  variantId: string,
  warehouseId: string,
) {
  await validateSessionOutletAccess(outletId);

  const ledger = await prisma.stockLedger.findMany({
    where: {
      outletId,
      variantId,
      warehouseId,
    },
    include: {
      transaction: {
        select: {
          txnNumber: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return ledger.map((entry) => ({
    id: entry.id,
    date: entry.date,
    quantity: entry.quantity,
    balance: entry.balance,
    type: entry.type,
    reference: entry.transaction.txnNumber,
    user: entry.user.name,
  }));
}
