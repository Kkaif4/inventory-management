import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { withErrorHandler } from "@/lib/error-handler";
import {
  parsePaginationParams,
  calculatePagination,
} from "@/lib/pagination";
import { PaginatedResult, BasePaginationParams } from "@/types/pagination";

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

// ─── Get purchase returns with server-side pagination ──────────────────────
export async function getPurchaseReturnsPaginated(
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

    const andClauses: any[] = [{ type: "DEBIT_NOTE" as any }, { outletId }];

    if (search) {
      andClauses.push({
        OR: [
          { txnNumber: { contains: search, mode: "insensitive" } },
          { party: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (status && status !== "ALL") {
      andClauses.push({ status });
    }

    const where = { AND: andClauses };

    const [total, returns] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          txnNumber: true,
          date: true,
          grandTotal: true,
          status: true,
          party: {
            select: {
              id: true,
              name: true,
              gstin: true,
            },
          },
          _count: { select: { items: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);

    return {
      data: returns,
      pagination,
    } as any;
  });
}
