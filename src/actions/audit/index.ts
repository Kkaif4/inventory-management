"use server";

import { prisma } from "@/lib/prisma";

export async function getAuditLogs() {
  return await prisma.auditLog.findMany({
    include: {
      user: {
        select: { name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500, // Limit to most recent 500 logs for payload sanity
  });
}
