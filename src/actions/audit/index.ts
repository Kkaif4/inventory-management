"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";

export async function getAuditLogs() {
  return withErrorHandler(async () => {
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
