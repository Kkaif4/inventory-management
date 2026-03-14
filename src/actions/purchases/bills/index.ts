"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";

export async function getPurchaseBills() {
  return withErrorHandler(async () => {
    return await prisma.transaction.findMany({
      where: { type: "PURCHASE_BILL" as any },
      include: {
        party: true,
        items: true,
      },
      orderBy: { date: "desc" },
    });
  });
}
