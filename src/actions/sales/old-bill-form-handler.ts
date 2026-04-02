"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withErrorHandler } from "@/lib/error-handler";
import { ValidationError } from "@/lib/exceptions";
import { createOldBill } from "./old-bill";
import { OldBillFormValues } from "@/validations/invoice.validation";

/**
 * Handle form submission for OLD bill mode
 */
export async function handleCreateOldBill(formData: OldBillFormValues) {
  return withErrorHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new ValidationError("Unauthorized");
    }

    // Pass session user ID to the database action
    return await createOldBill({
      ...formData,
      userId: session.user.id,
    });
  });
}
