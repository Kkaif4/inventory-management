"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";

export async function getParties() {
  return await prisma.party.findMany({
    orderBy: { name: "asc" },
    include: {
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
}) {
  const party = await prisma.party.create({
    data: {
      ...data,
      // When a party is created with an opening balance, we ideally need to create a ledger entry.
      // For this phase, we'll just set the party field. Full double-entry will hook into this later.
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
