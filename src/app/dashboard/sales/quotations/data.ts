"use client";

import { prisma } from "@/lib/prisma";

export async function getQuotationData() {
  return await prisma.transaction.findMany({
    where: { type: "QUOTATION" },
    include: {
      party: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });
}
