"use server";

import { prisma } from "@/lib/prisma";

export async function getSalesReturns() {
  return await prisma.transaction.findMany({
    where: { type: "CREDIT_NOTE" as any },
    include: {
      party: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });
}
