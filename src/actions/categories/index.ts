"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";

export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
      _count: {
        select: { products: true, children: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: {
  name: string;
  parentId?: string;
  outletId: string;
  userId: string;
}) {
  const category = await prisma.category.create({
    data: {
      name: data.name,
      parentId: data.parentId || null,
      outletId: data.outletId,
    },
  });

  await AuditService.log({
    action: "CREATE",
    entity: "CATEGORY",
    entityId: category.id,
    userId: data.userId,
    newValues: {
      name: data.name,
      parentId: data.parentId,
      outletId: data.outletId,
    },
  });

  revalidatePath("/dashboard/master-data/categories");
  return category;
}
