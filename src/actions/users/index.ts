"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { AuditService } from "@/domains/audit/audit-service";
enum Role {
  ADMIN = "ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  SALES = "SALES",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
}

export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      _count: {
        select: { outlets: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  role: Role;
  passwordRaw: string;
  outletIds: string[];
}) {
  const { passwordRaw, outletIds, ...userData } = data;

  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      outlets: {
        connect: outletIds.map((id) => ({ id })),
      },
    },
  });

  await AuditService.log({
    action: "CREATE",
    entity: "USER",
    entityId: user.id,
    newValues: { name: user.name, email: user.email, role: user.role },
  });

  revalidatePath("/dashboard/master-data/users");
  return { id: user.id, email: user.email };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus },
  });

  await AuditService.log({
    action: "UPDATE",
    entity: "USER",
    entityId: userId,
    newValues: { isActive: !currentStatus },
  });

  revalidatePath("/dashboard/master-data/users");
}
