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
}) {
  const category = await prisma.category.create({
    data: {
      name: data.name,
      parentId: data.parentId || null,
    },
  });

  await AuditService.log({
    action: "CREATE",
    entity: "CATEGORY",
    entityId: category.id,
    newValues: data,
  });

  revalidatePath("/dashboard/master-data/categories");
  return category;
}
