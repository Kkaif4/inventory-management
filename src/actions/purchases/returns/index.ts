import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";

export async function getPurchaseReturns(outletId: string) {
  return withErrorHandler(async () => {
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
  });
}
