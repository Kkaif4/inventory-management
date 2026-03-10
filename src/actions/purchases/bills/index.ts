"use server";

import { prisma } from "@/lib/prisma";

export async function getPurchaseBills() {
  return await prisma.transaction.findMany({
    where: { type: "PURCHASE_BILL" as any },
    include: {
      party: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });
}
