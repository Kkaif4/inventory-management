"use server";

import { prisma } from "@/lib/prisma";

export async function getDeliveryChallans() {
  return await prisma.transaction.findMany({
    where: { type: "DELIVERY_CHALLAN" as any },
    include: {
      party: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });
}
