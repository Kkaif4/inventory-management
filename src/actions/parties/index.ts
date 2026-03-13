"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { AccountingService } from "@/domains/accounting/ledger-service";

export async function getParties(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.party.findMany({
    where: { outletId },
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

export async function getVendorsByProduct(variantId: string, outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  return await prisma.party.findMany({
    where: {
      outletId,
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

export async function createParty(
  data: {
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
  },
  outletId: string,
) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  const { priceListId, ...rest } = data;

  const party = await prisma.$transaction(async (tx) => {
    // 1. Create the party record
    const p = await tx.party.create({
      data: {
        ...rest,
        outletId,
        priceListId: priceListId === "" ? null : priceListId,
      },
    });

    // 2. Handle Opening Balance if present
    if (data.openingBalance && data.openingBalance !== 0) {
      // Find system accounts
      const offsetAcc = await tx.account.findUnique({
        where: { code_outletId: { code: "5001", outletId } },
      });
      const partyGroupAcc = await tx.account.findUnique({
        where: {
          code_outletId: {
            code: data.type === "VENDOR" ? "2001" : "1003",
            outletId,
          },
        },
      });

      if (offsetAcc && partyGroupAcc) {
        // Post Entry
        // For Vendor: Credit Vendor Group (+Liability), Debit Offset
        // For Customer: Debit Customer Group (+Asset), Credit Offset
        const entries =
          data.type === "VENDOR"
            ? [
                { accountId: partyGroupAcc.id, credit: data.openingBalance },
                { accountId: offsetAcc.id, debit: data.openingBalance },
              ]
            : [
                { accountId: partyGroupAcc.id, debit: data.openingBalance },
                { accountId: offsetAcc.id, credit: data.openingBalance },
              ];

        await AccountingService.postJournalEntry(tx, {
          transactionId: `OPB-${p.id}`, // Virtual transaction ID
          partyId: p.id,
          entries,
        });
      }
    }

    return p;
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

export async function getVendorMetrics(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  const vendors = await prisma.party.findMany({
    where: {
      outletId, // Filter by outlet
      type: "VENDOR",
    },
    include: {
      transactions: {
        where: {
          outletId, // Also filter transactions by outlet
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

export async function linkProductToVendor(
  variantId: string,
  vendorId: string,
  outletId: string,
) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  // Verify vendor belongs to this outlet
  const vendor = await prisma.party.findUnique({
    where: { id: vendorId },
  });

  if (!vendor || vendor.outletId !== outletId) {
    throw new Error("403: Vendor not found in this outlet");
  }

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
  outletId: string,
) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  // Verify vendor belongs to this outlet
  const vendor = await prisma.party.findUnique({
    where: { id: vendorId },
  });

  if (!vendor || vendor.outletId !== outletId) {
    throw new Error("403: Vendor not found in this outlet");
  }

  return await prisma.vendorProduct.delete({
    where: {
      vendorId_variantId: {
        vendorId,
        variantId,
      },
    },
  });
}
