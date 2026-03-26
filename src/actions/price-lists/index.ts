"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";
import { withErrorHandler } from "@/lib/error-handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/exceptions";

export async function getPriceLists() {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new UnauthorizedError();
    return await prisma.priceList.findMany({
      include: {
        _count: {
          select: { entries: true, parties: true },
        },
      },
      orderBy: { name: "asc" },
    });
  });
}

export async function createPriceList(data: {
  name: string;
  description?: string | null;
  isActive: boolean;
  entries: { variantId: string; price: number }[];
  partyIds: string[];
}) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new UnauthorizedError();
    const { entries, partyIds, ...rest } = data;
    const priceList = await prisma.priceList.create({
      data: {
        ...rest,
        entries: {
          create: entries.map((e) => ({
            variantId: e.variantId,
            price: roundToTwo(e.price),
          })),
        },
        parties: {
          connect: partyIds.map((id) => ({ id })),
        },
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "PRICE_LIST",
      entityId: priceList.id,
      newValues: { ...rest, entryCount: entries.length },
    });

    revalidatePath("/dashboard/master-data/price-lists");
    return priceList;
  });
}
