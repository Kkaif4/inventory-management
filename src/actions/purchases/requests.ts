"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";
import { roundToTwo } from "@/lib/utils";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import {
  parsePaginationParams,
  calculatePagination,
} from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";

export async function getPurchaseRequests(outletId: string) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);
    return await prisma.transaction.findMany({
      where: {
        type: "PURCHASE_REQUEST",
        outletId: outletId,
      },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
      orderBy: { date: "desc" },
    });
  });
}

// ─── Get purchase requests with server-side pagination ──────────────────────
export async function getPurchaseRequestsPaginated(
  outletId: string,
  params: BasePaginationParams & {
    search?: string;
    status?: string;
  },
) {
  return withErrorHandler(async (): Promise<PaginatedResult<any>> => {
    await validateSessionOutletAccess(outletId);

    const { page, limit } = parsePaginationParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    const { search, status } = params;

    const andClauses: any[] = [{ type: "PURCHASE_REQUEST" }, { outletId }];

    if (search) {
      andClauses.push({
        OR: [
          { txnNumber: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (status && status !== "ALL") {
      andClauses.push({ status });
    }

    const where = { AND: andClauses };

    const [total, requests] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          txnNumber: true,
          date: true,
          grandTotal: true,
          status: true,
          _count: { select: { items: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);

    return {
      data: requests,
      pagination,
    } as any;
  });
}

export async function updatePurchaseRequestStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  return withErrorHandler(async () => {
    const txn = await prisma.transaction.findUnique({ where: { id }, select: { outletId: true } });
    if (txn?.outletId) await validateSessionOutletAccess(txn.outletId);
    const pr = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    await AuditService.log({
      action: "UPDATE",
      entity: "PURCHASE_REQUEST",
      entityId: id,
      newValues: { status },
    });

    revalidatePath("/dashboard/purchases/requests");
    return pr;
  });
}

export async function createPurchaseRequest(data: {
  outletId: string;
  userId: string;
  items: { variantId: string; quantity: number }[];
}) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);
    // 1. Fetch variant prices to calculate estimated total
    const variantIds = data.items.map((it) => it.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, purchasePrice: true },
    });

    const priceMap = new Map(variants.map((v) => [v.id, v.purchasePrice]));

    // 2. Build items with calculated taxable values
    let totalTaxable = 0;
    const itemsData = data.items.map((it) => {
      const rate = priceMap.get(it.variantId) || 0;
      const taxableValue = roundToTwo(rate * it.quantity);
      totalTaxable += taxableValue;

      return {
        variantId: it.variantId,
        quantity: it.quantity,
        rate,
        taxableValue,
      };
    });

    // 3. Generate simple PR number
    const prNum = `PR-${Date.now()}`;

    const pr = await prisma.transaction.create({
      data: {
        type: "PURCHASE_REQUEST",
        txnNumber: prNum,
        status: "PENDING_APPROVAL",
        outletId: data.outletId,
        userId: data.userId,
        totalTaxable: roundToTwo(totalTaxable),
        grandTotal: roundToTwo(totalTaxable), // Assuming neutral GST for PR Estimates
        items: {
          create: itemsData,
        },
      },
    });

    await AuditService.log({
      action: "CREATE",
      entity: "PURCHASE_REQUEST",
      entityId: pr.id,
      newValues: { prNum, total: totalTaxable },
    });

    revalidatePath("/dashboard/purchases/requests");
    return pr;
  });
}
