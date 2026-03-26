"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withErrorHandler } from "@/lib/error-handler";
import { UnauthorizedError } from "@/lib/exceptions";
import { requireAdminSession } from "@/lib/outlet-auth";
import { userSchema } from "@/validations/user.validation";
import bcrypt from "bcryptjs";

export async function getUserOutlets() {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        outlets: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return user?.outlets || [];
  });
}

export async function createUser(data: unknown) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    const { name, email, role, passwordRaw, outletIds } = userSchema.parse(data);
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    return await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        outlets: {
          connect: outletIds.map((id: string) => ({ id })),
        },
      },
    });
  });
}

export async function getUsers(outletId: string) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    const users = await prisma.user.findMany({
      where: {
        outlets: {
          some: { id: outletId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { outlets: true }, // ✅ returns outlets as a number
        },
      },
      orderBy: { name: "asc" },
    });

    // Flatten _count.outlets → outlets for clean access in the component
    return users.map((u) => ({
      ...u,
      outlets: u._count.outlets,
    }));
  });
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  return withErrorHandler(async () => {
    await requireAdminSession();
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  });
}
