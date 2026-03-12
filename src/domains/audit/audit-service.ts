import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const AuditService = {
  /**
   * Log an administrative action
   */
  async log(data: {
    action: "CREATE" | "UPDATE" | "DELETE" | "POST";
    entity: string;
    entityId: string;
    userId?: string;
    oldValues?: any;
    newValues?: any;
  }) {
    try {
      let finalUserId = data.userId;

      if (!finalUserId) {
        const session = await getServerSession(authOptions);
        finalUserId = session?.user?.id;
      }

      if (!finalUserId) return; // Skip audit if no user found

      return await prisma.auditLog.create({
        data: {
          userId: finalUserId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValues: data.oldValues || null,
          newValues: data.newValues || null,
        },
      });
    } catch (err) {
      console.error("Audit Logging Failed:", err);
      // We don't throw here to avoid breaking the main transaction,
      // but in high-compliance systems, this might be required.
    }
  },
};
