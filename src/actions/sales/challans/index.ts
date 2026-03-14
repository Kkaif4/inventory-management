"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";

export async function getDeliveryChallans() {
  return withErrorHandler(async () => {
    return await prisma.transaction.findMany({
      where: { type: "DELIVERY_CHALLAN" as any },
      include: {
        party: true,
        items: true,
      },
      orderBy: { date: "desc" },
    });
  });
}
