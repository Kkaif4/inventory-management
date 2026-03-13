"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function getLocations() {
  const [warehouses, outlets] = await Promise.all([
    prisma.warehouse.findMany({
      include: {
        _count: {
          select: { outlets: true, stocks: true },
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
}

export async function getWarehouseById(id: string) {
  return await prisma.warehouse.findUnique({
    where: { id },
  });
}

export async function createWarehouse(data: {
  name: string;
  address?: string;
  state?: string;
  contactName?: string;
  contactPhone?: string;
}) {
  const warehouse = await prisma.warehouse.create({
    data,
  });
  revalidatePath("/dashboard/admin/warehouses");
  revalidatePath("/dashboard/admin/outlets");
  return warehouse;
}

export async function updateWarehouse(
  id: string,
  data: {
    name: string;
    address?: string;
    state?: string;
    contactName?: string;
    contactPhone?: string;
  },
) {
  const warehouse = await prisma.warehouse.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/admin/warehouses");
  return warehouse;
}

export async function getOutletById(id: string) {
  return await prisma.outlet.findUnique({
    where: { id },
    include: {
      warehouses: true,
    },
  });
}

export async function getOutletsByUserId(userId: string) {
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
}

export async function createOutlet(data: {
  name: string;
  address?: string;
  state?: string;
  invoicePrefix: string;
  invoiceStartingNumber?: number;
  gstin?: string;
  bankDetails?: string;
  defaultWarehouseId?: string;
  negativeStockPolicy: string;
  batchTrackingEnabled: boolean;
  warehouseIds: string[];
}) {
  const { warehouseIds, ...outletData } = data;

  if (warehouseIds.length === 0) {
    throw new Error("At least one warehouse must be linked to the outlet.");
  }

  const outlet = await prisma.outlet.create({
    data: {
      ...outletData,
      warehouses: {
        connect: warehouseIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/dashboard/admin/outlets");
  return outlet;
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
    defaultWarehouseId?: string;
    negativeStockPolicy: string;
    batchTrackingEnabled: boolean;
    warehouseIds: string[];
  },
) {
  const { warehouseIds, ...outletData } = data;

  if (warehouseIds.length === 0) {
    throw new Error("At least one warehouse must be linked to the outlet.");
  }

  // FRD Rule: Cannot change prefix if invoices exist
  const existingTxns = await prisma.transaction.count({
    where: { outletId: id, type: "SALES_INVOICE" },
  });

  const currentOutlet = await prisma.outlet.findUnique({
    where: { id },
    select: { invoicePrefix: true },
  });

  if (existingTxns > 0 && currentOutlet?.invoicePrefix !== data.invoicePrefix) {
    throw new Error(
      "Cannot change Invoice Series Prefix once invoices exist for this outlet.",
    );
  }

  const outlet = await prisma.outlet.update({
    where: { id },
    data: {
      ...outletData,
      warehouses: {
        set: warehouseIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/dashboard/admin/outlets");
  return outlet;
}

export async function deleteWarehouse(id: string) {
  // FRD Rule: Cannot deactivate if stock > 0
  const stockCount = await prisma.stock.aggregate({
    where: { warehouseId: id },
    _sum: { quantity: true },
  });

  if ((stockCount._sum?.quantity || 0) > 0) {
    throw new Error(
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
    throw new Error(
      "Warehouse cannot be deleted as it has historical transactions. Deactivate it instead (if stock is zero).",
    );
  }

  const warehouse = await prisma.warehouse.delete({
    where: { id },
  });
  revalidatePath("/dashboard/admin/warehouses");
  return warehouse;
}

export async function deleteOutlet(id: string) {
  // FRD Rule: Blocked if outlet has open (unpaid) invoices
  const unpaidInvoices = await prisma.transaction.count({
    where: {
      outletId: id,
      type: "SALES_INVOICE",
      status: { notIn: ["PAID", "CANCELLED"] },
    },
  });

  if (unpaidInvoices > 0) {
    throw new Error(
      "Cannot delete outlet with open (unpaid) invoices. Please settle all bills first.",
    );
  }

  const outlet = await prisma.outlet.delete({
    where: { id },
  });
  revalidatePath("/dashboard/admin/outlets");
  return outlet;
}
