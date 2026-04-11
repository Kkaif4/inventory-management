"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { requireAdminSession } from "@/lib/outlet-auth";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function getWarehousesPaginated(
  params: PaginationParams = {},
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.max(params.limit ?? 10, 1);
    const search = params.search?.trim() || "";

    // Build the where clause for search and optional outlet filter
    const whereClause: any = {};
    if (params.outletId) {
      whereClause.outletId = params.outletId;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.warehouse.count({
      where: whereClause,
    });

    // Get paginated warehouses
    const warehouses = await prisma.warehouse.findMany({
      where: whereClause,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { stocks: true },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { warehouses, pagination };
  });
}

export async function getWarehouseById(id: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    return await prisma.warehouse.findUnique({
      where: { id },
      include: {
        outlet: true,
        _count: {
          select: { stocks: true },
        },
      },
    });
  });
}

export async function createWarehouse(data: {
  name: string;
  address?: string;
  state?: string;
  contactName?: string;
  contactPhone?: string;
  outletId: string;
  isDefault?: boolean;
}) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    const { outletId, isDefault = false, ...warehouseData } = data;

    // If setting as default, unset other defaults for this outlet
    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { outletId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        ...warehouseData,
        outletId,
        isDefault,
      },
    });
    revalidatePath("/dashboard/master-data/warehouses");
    revalidatePath("/dashboard/admin/warehouses");
    return warehouse;
  });
}

export async function updateWarehouse(
  id: string,
  data: {
    name?: string;
    address?: string;
    state?: string;
    contactName?: string;
    contactPhone?: string;
    isDefault?: boolean;
  },
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    // Get current warehouse to find its outlet
    const currentWarehouse = await prisma.warehouse.findUnique({
      where: { id },
      select: { outletId: true },
    });

    if (!currentWarehouse) {
      throw new NotFoundError("Warehouse not found");
    }

    // If setting as default, unset other defaults for this outlet
    if (data.isDefault) {
      await prisma.warehouse.updateMany({
        where: { outletId: currentWarehouse.outletId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/master-data/warehouses");
    revalidatePath("/dashboard/admin/warehouses");
    return warehouse;
  });
}

export async function deleteWarehouse(id: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    // FRD Rule: Cannot deactivate if stock > 0
    const stockCount = await prisma.stock.aggregate({
      where: { warehouseId: id },
      _sum: { quantity: true },
    });

    if ((stockCount._sum?.quantity || 0) > 0) {
      throw new ValidationError(
        "Cannot delete or deactivate warehouse with non-zero stock on hand.",
      );
    }

    // Deleting is not permitted if historical transactions exist
    const txnLinks = await prisma.transaction.count({
      where: {
        OR: [{ fromLocationId: id }, { toLocationId: id }],
      },
    });

    if (txnLinks > 0) {
      throw new ValidationError(
        "Warehouse cannot be deleted as it has historical transactions. Deactivate it instead (if stock is zero).",
      );
    }

    const warehouse = await prisma.warehouse.delete({
      where: { id },
    });
    revalidatePath("/dashboard/master-data/warehouses");
    return warehouse;
  });
}

/**
 * Get all outlets for warehouse assignment
 * Used by warehouse edit/create forms
 */
export async function getOutlets() {
  return withErrorHandler(async () => {
    await requireAdminSession();
    return await prisma.outlet.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
  });
}
