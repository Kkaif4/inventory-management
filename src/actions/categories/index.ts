"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/exceptions";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/exceptions";

export async function getCategories() {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new UnauthorizedError();

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
  });
}

export async function createCategory(data: {
  name: string;
  parentId?: string;
  outletId: string;
  userId: string;
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);
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
  });
}

export async function updateCategory(data: {
  id: string;
  name: string;
  description?: string;
  userId: string;
}) {
  return withErrorHandler(async () => {
    const cat = await prisma.category.findUnique({ where: { id: data.id }, select: { outletId: true } });
    if (cat?.outletId) await validateSessionOutletAccess(cat.outletId);
    const category = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    await AuditService.log({
      action: "UPDATE",
      entity: "CATEGORY",
      entityId: category.id,
      userId: data.userId,
      newValues: { name: data.name, description: data.description },
    });

    revalidatePath("/dashboard/master-data/categories");
    return category;
  });
}

export async function deactivateCategory(id: string, userId: string) {
  return withErrorHandler(async () => {
    const cat = await prisma.category.findUnique({ where: { id }, select: { outletId: true } });
    if (cat?.outletId) await validateSessionOutletAccess(cat.outletId);
    // Check for active products
    const activeProducts = await prisma.product.findMany({
      where: {
        categoryId: id,
        isArchived: false,
      },
      select: { name: true },
    });

    if (activeProducts.length > 0) {
      const names = activeProducts.map((p) => p.name).join(", ");
      throw new ValidationError(
        `Cannot deactivate: Category is used by active products: ${names}`,
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    await AuditService.log({
      action: "UPDATE",
      entity: "CATEGORY",
      entityId: id,
      userId,
      newValues: { isActive: false },
    });

    revalidatePath("/dashboard/master-data/categories");
    return category;
  });
}

export async function activateCategory(id: string, userId: string) {
  return withErrorHandler(async () => {
    const cat = await prisma.category.findUnique({ where: { id }, select: { outletId: true } });
    if (cat?.outletId) await validateSessionOutletAccess(cat.outletId);
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: true },
    });

    await AuditService.log({
      action: "UPDATE",
      entity: "CATEGORY",
      entityId: id,
      userId,
      newValues: { isActive: true },
    });

    revalidatePath("/dashboard/master-data/categories");
    return category;
  });
}

export async function deleteCategory(id: string, userId: string) {
  return withErrorHandler(async () => {
    const cat = await prisma.category.findUnique({ where: { id }, select: { outletId: true } });
    if (cat?.outletId) await validateSessionOutletAccess(cat.outletId);
    // Check for sub-categories
    const subCategories = await prisma.category.count({
      where: { parentId: id },
    });

    if (subCategories > 0) {
      throw new ValidationError("Cannot delete: Category has sub-categories.");
    }

    // Check for ANY products (even archived)
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new ValidationError("Cannot delete: Category has linked products.");
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    await AuditService.log({
      action: "DELETE",
      entity: "CATEGORY",
      entityId: id,
      userId,
      oldValues: category,
    });

    revalidatePath("/dashboard/master-data/categories");
    return { success: true };
  });
}
