"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function searchVariants(outletId: string, query: string) {
  await validateSessionOutletAccess(outletId);

  return await prisma.variant.findMany({
    where: {
      product: {
        outletId,
      },
      OR: [
        { sku: { contains: query, mode: "insensitive" } },
        { product: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      product: {
        select: {
          name: true,
          baseUnit: true,
        },
      },
    },
    take: 10,
  });
}
