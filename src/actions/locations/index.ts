"use server";

import { prisma } from "@/lib/prisma";
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

export async function createWarehouse(data: {
  name: string;
  address?: string;
}) {
  const warehouse = await prisma.warehouse.create({
    data,
  });
  revalidatePath("/dashboard/master-data/locations");
  return warehouse;
}

export async function createOutlet(data: {
  name: string;
  invoicePrefix: string;
  gstin?: string;
  negativeStockPolicy: string;
  warehouseIds: string[];
}) {
  const { warehouseIds, ...outletData } = data;

  const outlet = await prisma.outlet.create({
    data: {
      ...outletData,
      warehouses: {
        connect: warehouseIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/dashboard/master-data/locations");
  return outlet;
}
