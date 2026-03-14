"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withErrorHandler } from "@/lib/error-handler";

export async function getCurrentSession() {
  return withErrorHandler(async () => {
    return await getServerSession(authOptions);
  });
}
