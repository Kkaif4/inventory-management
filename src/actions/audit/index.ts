"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { requireAdminSession } from "@/lib/outlet-auth";

export async function getAuditLogs() {
  return withErrorHandler(async () => {
    await requireAdminSession();
    return await prisma.auditLog.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Limit to most recent 500 logs for payload sanity
    });
  });
}
