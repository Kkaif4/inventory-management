"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function validateOutletAccess(userId: string, outletId: string) {
  if (!userId || !outletId) {
    throw new Error("User ID and Outlet ID are required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        outlets: {
          where: { id: outletId },
        },
      },
    });

    if (!user) {
      throw new Error("401: User not found");
    }

    if (user.outlets.length === 0) {
      throw new Error("403: Outlet access denied");
    }

    return true;
  } catch (error: any) {
    console.error("Outlet Access Validation Error:", error);

    // Pass through recognized error codes or messages
    if (error.message.startsWith("401") || error.message.startsWith("403")) {
      throw error;
    }

    if (error.code === "P2022") {
      throw new Error(
        "Internal Server Error: Database schema mismatch. Please run 'npx prisma db push'.",
      );
    }

    throw new Error("An unexpected error occurred during authorization.");
  }
}

export async function getUserOutlets(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
  } catch (error: any) {
    console.error("Error fetching user outlets:", error);
    if (error.code === "P2022") {
      throw new Error(
        "Database configuration error. Please run 'npx prisma db push'.",
      );
    }
    return [];
  }
}

export async function getSessionWithOutlets() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const outlets = await getUserOutlets(session.user.id);

  return {
    session,
    outlets,
  };
}

export async function validateSessionOutletAccess(
  outletId: string,
): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("401: Unauthorized");
  }

  await validateOutletAccess(session.user.id, outletId);

  return session.user.id;
}

export async function getCurrentSessionOutlet(outletId?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("401: Unauthorized");
  }

  let activeOutletId = outletId;

  // If no outlet specified, use first available
  if (!activeOutletId) {
    const outlets = (session.user as any).availableOutlets as any[];
    if (!outlets || outlets.length === 0) {
      throw new Error("No outlets available for user");
    }
    activeOutletId = outlets[0].id as string;
  }

  // Validate user has access to this outlet
  await validateOutletAccess(session.user.id, activeOutletId);

  return activeOutletId;
}
