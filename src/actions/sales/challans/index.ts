"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/exceptions";

export async function getDeliveryChallans() {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new UnauthorizedError();
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
