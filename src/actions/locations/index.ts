"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import { requireAdminSession } from "@/lib/outlet-auth";

export async function getLocations() {
  return withErrorHandler(async () => {
    await requireAdminSession();
    const [warehouses, outlets] = await Promise.all([
      prisma.warehouse.findMany({
        include: {
          outlet: true,
          _count: {
            select: { stocks: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.outlet.findMany({
        include: {
          warehouses: true,
          _count: {
            select: { users: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return { warehouses, outlets };
  });
}

export async function getWarehouseById(id: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    return await prisma.warehouse.findUnique({
      where: { id },
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
    revalidatePath("/dashboard/admin/warehouses");
    revalidatePath("/dashboard/admin/outlets");
    revalidatePath("/dashboard/master-data/locations");
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
        where: {
          outletId: currentWarehouse.outletId,
          isDefault: true,
          NOT: { id },
        },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/admin/warehouses");
    revalidatePath("/dashboard/master-data/locations");
    return warehouse;
  });
}

export async function getOutletById(id: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    return await prisma.outlet.findUnique({
      where: { id },
      include: {
        warehouses: true,
      },
    });
  });
}

export async function getOutletsByUserId(userId: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    if (!userId) return [];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        outlets: {
          select: {
            id: true,
            name: true,
            invoicePrefix: true,
          },
        },
      },
    });

    return user?.outlets ?? [];
  });
}

export async function createOutlet(data: {
  name: string;
  address?: string;
  state?: string;
  invoicePrefix: string;
  invoiceStartingNumber?: number;
  gstin?: string;
  bankDetails?: string;
  negativeStockPolicy: string;
  batchTrackingEnabled: boolean;
}) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    const outlet = await prisma.$transaction(async (tx) => {
      // Create outlet
      const newOutlet = await tx.outlet.create({
        data,
      });

      // Initialize DocumentSeries for all invoice types
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const financialYear =
        month >= 3
          ? `${year}-${(year + 1).toString().slice(-2)}`
          : `${year - 1}-${year.toString().slice(-2)}`;

      const documentTypes = [
        { type: "SALES_INVOICE", prefix: "INV" },
        { type: "CASH_MEMO", prefix: "CM" },
        { type: "OLD_BILL", prefix: "OLD" },
      ];

      await Promise.all(
        documentTypes.map((doc) =>
          tx.documentSeries.create({
            data: {
              type: doc.type,
              prefix: doc.prefix,
              financialYear,
              outletId: newOutlet.id,
              nextNumber: 1,
            },
          }),
        ),
      );

      return newOutlet;
    });

    revalidatePath("/dashboard/admin/outlets");
    revalidatePath("/dashboard/master-data/locations");
    return outlet;
  });
}

export async function updateOutlet(
  id: string,
  data: {
    name: string;
    address?: string;
    state?: string;
    invoicePrefix: string;
    invoiceStartingNumber?: number;
    gstin?: string;
    bankDetails?: string;
    negativeStockPolicy: string;
    batchTrackingEnabled: boolean;
  },
) {
  return withErrorHandler(async () => {
    await requireAdminSession();

    // FRD Rule: Cannot change prefix if invoices exist
    const existingTxns = await prisma.transaction.count({
      where: { outletId: id, type: "SALES_INVOICE" },
    });

    const currentOutlet = await prisma.outlet.findUnique({
      where: { id },
      select: { invoicePrefix: true },
    });

    if (
      existingTxns > 0 &&
      currentOutlet?.invoicePrefix !== data.invoicePrefix
    ) {
      throw new ValidationError(
        "Cannot change Invoice Series Prefix once invoices exist for this outlet.",
      );
    }

    const outlet = await prisma.outlet.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/admin/outlets");
    revalidatePath("/dashboard/master-data/locations");
    return outlet;
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
    revalidatePath("/dashboard/admin/warehouses");
    return warehouse;
  });
}

export async function deleteOutlet(id: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    // FRD Rule: Blocked if outlet has open (unpaid) invoices
    const unpaidInvoices = await prisma.transaction.count({
      where: {
        outletId: id,
        type: "SALES_INVOICE",
        status: { notIn: ["PAID", "CANCELLED"] },
      },
    });

    if (unpaidInvoices > 0) {
      throw new ValidationError(
        "Cannot delete outlet with open (unpaid) invoices. Please settle all bills first.",
      );
    }

    const outlet = await prisma.outlet.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admin/outlets");
    return outlet;
  });
}
