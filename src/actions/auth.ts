"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getCurrentSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
