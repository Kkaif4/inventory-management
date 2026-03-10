"use server";

import { prisma } from "@/lib/prisma";

export async function getPurchaseReturns() {
  return await prisma.transaction.findMany({
    where: { type: "DEBIT_NOTE" as any },
    include: {
      party: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });
}
