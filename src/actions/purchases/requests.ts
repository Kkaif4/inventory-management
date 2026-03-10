"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AuditService } from "@/domains/audit/audit-service";

export async function getPurchaseRequests() {
  return await prisma.transaction.findMany({
    where: { type: "PURCHASE_REQUEST" as any },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function updatePurchaseRequestStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
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
}

export async function createPurchaseRequest(data: {
  items: { variantId: string; quantity: number }[];
}) {
  // Generate simple PR number
  const prNum = `PR-${Date.now()}`;

  const pr = await prisma.transaction.create({
    data: {
      type: "PURCHASE_REQUEST" as any,
      txnNumber: prNum,
      status: "PENDING_APPROVAL",
      items: {
        create: data.items.map((it) => ({
          variantId: it.variantId,
          quantity: it.quantity,
          rate: 0,
          taxableValue: 0,
        })),
      },
    },
  });

  await AuditService.log({
    action: "CREATE",
    entity: "PURCHASE_REQUEST",
    entityId: pr.id,
    newValues: { prNum, itemCount: data.items.length },
  });

  revalidatePath("/dashboard/purchases/requests");
  return pr;
}
