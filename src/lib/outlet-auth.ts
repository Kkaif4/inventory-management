"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Validates that a user has access to a specific outlet
 * Throws Error('403: Outlet access denied') if unauthorized
 */
export async function validateOutletAccess(userId: string, outletId: string) {
  if (!userId || !outletId) {
    throw new Error("User ID and Outlet ID are required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      outlets: {
        where: { id: outletId },
      },
    },
  });

  if (!user || user.outlets.length === 0) {
    throw new Error("403: Outlet access denied");
  }

  return true;
}

/**
 * Gets all outlets for a user
 */
export async function getUserOutlets(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

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
}

/**
 * Gets session with user outlets
 * For use in server components or protected routes
 */
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

/**
 * Middleware-like function to validate outlet access from session
 * Used when outletId comes from user input (forms, queries, etc.)
 */
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

/**
 * Gets the current outlet ID from session and validates access
 * If no outletId provided, uses the first available outlet
 */
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
