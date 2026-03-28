'use server';

import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { validateSessionOutletAccess } from '@/lib/outlet-auth';
import { parsePaginationParams, calculatePagination } from '@/lib/pagination';
import type { CustomerOutstandingItem, OutstandingReportParams } from '@/types/reports/outstanding';

export async function getCustomerOutstandingReport(params: OutstandingReportParams) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(params.outletId);

    const { page, limit } = parsePaginationParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    const where: any = {
      outletId: params.outletId,
      type: 'CUSTOMER',
      outstandingBalance: { gt: 0 },
    };

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [total, customers] = await Promise.all([
      prisma.party.count({ where }),
      prisma.party.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          outstandingBalance: true,
          creditLimit: true,
          transactions: {
            where: {
              type: 'SALES_INVOICE',
            },
            select: {
              date: true,
            },
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
        orderBy: { outstandingBalance: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const now = new Date();
    const data: CustomerOutstandingItem[] = customers.map((customer) => {
      const outstanding = customer.outstandingBalance || 0;
      const creditLimit = customer.creditLimit || 0;
      const utilizationPercent = creditLimit > 0 ? (outstanding / creditLimit) * 100 : 0;

      const lastInvoice = customer.transactions[0];
      const daysSinceLastTxn = lastInvoice
        ? Math.floor((now.getTime() - new Date(lastInvoice.date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      let status: 'CURRENT' | 'OVERDUE_30' | 'OVERDUE_60' | 'OVERDUE_90' = 'CURRENT';
      if (daysSinceLastTxn > 90) status = 'OVERDUE_90';
      else if (daysSinceLastTxn > 60) status = 'OVERDUE_60';
      else if (daysSinceLastTxn > 30) status = 'OVERDUE_30';

      return {
        id: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        outstandingAmount: outstanding,
        creditLimit,
        utilizationPercent: Math.round(utilizationPercent),
        lastInvoiceDate: lastInvoice?.date,
        daysSinceLastTransaction: daysSinceLastTxn,
        status,
      };
    });

    const pagination = calculatePagination(total, page, limit);

    return {
      data,
      pagination,
      total,
      page,
      limit,
    };
  });
}
