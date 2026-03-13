import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function getPurchaseReturns(outletId: string) {
  await validateSessionOutletAccess(outletId);

  return await prisma.transaction.findMany({
    where: {
      type: "DEBIT_NOTE" as any,
      outletId,
    },
    include: {
      party: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });
}
