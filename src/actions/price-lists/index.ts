"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";

export async function getPriceLists() {
  return await prisma.priceList.findMany({
    include: {
      _count: {
        select: { entries: true, parties: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createPriceList(data: {
  name: string;
  description?: string | null;
  isActive: boolean;
  entries: { variantId: string; price: number }[];
  partyIds: string[];
}) {
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
}
