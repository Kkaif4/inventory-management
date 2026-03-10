"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";

export async function getParties() {
  return await prisma.party.findMany({
    orderBy: { name: "asc" },
    include: {
      priceList: {
        include: {
          entries: true,
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });
}

export async function getVendorsByProduct(variantId: string) {
  return await prisma.party.findMany({
    where: {
      type: "VENDOR",
      suppliedProducts: {
        some: {
          variantId,
        },
      },
    },
    include: {
      suppliedProducts: {
        where: {
          variantId,
        },
      },
    },
  });
}

export async function createParty(data: {
  type: "VENDOR" | "CUSTOMER";
  name: string;
  gstin?: string;
  pan?: string;
  address: string;
  state: string;
  contactInfo?: string;
  creditPeriod: number;
  creditLimit?: number;
  openingBalance: number;
  priceListId?: string;
}) {
  const { priceListId, ...rest } = data;

  const party = await prisma.party.create({
    data: {
      ...rest,
      priceListId: priceListId === "" ? null : priceListId,
    },
  });

  await AuditService.log({
    action: "CREATE",
    entity: "PARTY",
    entityId: party.id,
    newValues: data,
  });

  revalidatePath("/dashboard/master-data/parties");
  return party;
}

export async function getVendorMetrics() {
  const vendors = await prisma.party.findMany({
    where: { type: "VENDOR" },
    include: {
      transactions: {
        where: {
          type: {
            in: ["PURCHASE_ORDER", "GRN", "DEBIT_NOTE"],
          },
        },
        include: {
          items: true,
        },
      },
    },
  });

  return vendors.map((vendor) => {
    const pos = vendor.transactions.filter((t) => t.type === "PURCHASE_ORDER");
    const grns = vendor.transactions.filter((t) => t.type === "GRN");
    const returns = vendor.transactions.filter((t) => t.type === "DEBIT_NOTE");

    // Performance Logic
    const onTimeCount = grns.filter((g) => {
      // Find parent PO to compare dates
      const po = pos.find((p) => p.id === g.parentId);
      if (!po) return true; // Default to on-time if no link
      return new Date(g.date) <= new Date(po.date);
    }).length;

    const onTimeRate =
      grns.length > 0 ? (onTimeCount / grns.length) * 100 : 100;
    const returnRate = pos.length > 0 ? (returns.length / pos.length) * 100 : 0;

    // Rating Calculation
    let rating = "B";
    if (onTimeRate >= 95 && returnRate < 2) rating = "A+";
    else if (onTimeRate >= 90) rating = "A";
    else if (onTimeRate < 70) rating = "C";

    return {
      id: vendor.id,
      name: vendor.name,
      rating,
      onTime: `${onTimeRate.toFixed(1)}%`,
      leadTime: "4.2 Days", // Placeholder until historical diff logic is added
      returns: `${returnRate.toFixed(1)}%`,
    };
  });
}

export async function linkProductToVendor(variantId: string, vendorId: string) {
  return await prisma.vendorProduct.create({
    data: {
      variantId,
      vendorId,
    },
  });
}

export async function removeProductFromVendor(
  variantId: string,
  vendorId: string,
) {
  return await prisma.vendorProduct.delete({
    where: {
      vendorId_variantId: {
        vendorId,
        variantId,
      },
    },
  });
}
