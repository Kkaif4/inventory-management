"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/error-handler";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";
import { ValidationError, NotFoundError } from "@/lib/exceptions";
import {
  processAttachmentFile,
  validateModuleReference,
  formatAttachmentForClient,
} from "@/lib/attachment-handler";
import type {
  AttachmentWithData,
  AttachmentMetadata,
} from "@/types/expense.types";

export async function uploadAttachment(
  moduleType: string,
  referenceId: string,
  file: File,
  outletId?: string,
) {
  return withErrorHandler(async () => {
    // Validate module & reference
    const moduleValidation = validateModuleReference(moduleType, referenceId);
    if (!moduleValidation.valid) {
      throw new ValidationError(
        moduleValidation.error || "Invalid module reference",
      );
    }

    // Validate outlet access if provided
    if (outletId) {
      await validateSessionOutletAccess(outletId);
    }

    // Verify reference exists based on module type
    if (moduleType === "EXPENSE") {
      const expense = await prisma.expense.findUnique({
        where: { id: referenceId },
      });

      if (!expense) {
        throw new NotFoundError("Expense not found");
      }

      // Verify outlet access
      if (outletId) {
        if (expense.outletId !== outletId) {
          throw new ValidationError("Access denied to this expense");
        }
      }
    } else if (moduleType === "INVOICE") {
      if (!referenceId.startsWith("TEMP:")) {
        const invoice = await prisma.transaction.findUnique({
          where: { id: referenceId },
        });

        if (!invoice) {
          throw new NotFoundError("Invoice not found");
        }

        // Verify outlet access
        if (outletId) {
          if (invoice.outletId !== outletId) {
            throw new ValidationError("Access denied to this invoice");
          }
        }
      }
    }

    // Check max attachments
    const existingCount = await prisma.attachment.count({
      where: {
        moduleType,
        referenceId,
      },
    });

    if (existingCount >= 3) {
      throw new ValidationError(
        "Maximum 3 attachments per record. Please delete an existing attachment first.",
      );
    }

    // Process file (compress, encode to Base64 data URI)
    const processed = await processAttachmentFile(file);

    // Store in DB as Buffer. extractDataUriFromAttachment handles Buffer conversions.
    const attachment = await prisma.attachment.create({
      data: {
        moduleType,
        referenceId,
        fileName: processed.fileName,
        mimeType: processed.mimeType,
        size: processed.size,
        data: Buffer.from(processed.buffer),
      },
    });

    console.log(
      `[Attachment] Stored: ${attachment.id} (${processed.fileName})`,
    );

    return formatAttachmentForClient(attachment);
  });
}

/**
 * Get attachment with image data
 * Used for displaying/downloading images
 */
export async function getAttachment(attachmentId: string) {
  return withErrorHandler(async () => {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundError("Attachment not found");
    }

    return {
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      data: attachment.data,
      moduleType: attachment.moduleType,
      referenceId: attachment.referenceId,
      createdAt: attachment.createdAt,
    };
  });
}

/**
 * Get attachment metadata only (without binary data)
 * Used for listing attachments
 */
export async function getAttachmentsByReference(
  moduleType: string,
  referenceId: string,
) {
  return withErrorHandler(async () => {
    // Validate module & reference
    const validation = validateModuleReference(moduleType, referenceId);
    if (!validation.valid) {
      throw new ValidationError(validation.error || "Invalid module reference");
    }

    const attachments = await prisma.attachment.findMany({
      where: {
        moduleType,
        referenceId,
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return attachments;
  });
}

/**
 * Delete attachment
 */
export async function deleteAttachment(
  attachmentId: string,
  moduleType: string,
  referenceId: string,
) {
  return withErrorHandler(async () => {
    // Validate module & reference
    const validation = validateModuleReference(moduleType, referenceId);
    if (!validation.valid) {
      throw new ValidationError(validation.error || "Invalid module reference");
    }

    // Find attachment
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundError("Attachment not found");
    }

    // Verify module type and reference match
    if (
      attachment.moduleType !== moduleType ||
      attachment.referenceId !== referenceId
    ) {
      throw new ValidationError(
        "Attachment does not belong to this module/reference",
      );
    }

    // Delete
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    console.log(`[Attachment] Deleted: ${attachmentId}`);

    return { success: true };
  });
}

/**
 * Get attachment count for a module/reference
 */
export async function getAttachmentCount(
  moduleType: string,
  referenceId: string,
) {
  return withErrorHandler(async () => {
    const count = await prisma.attachment.count({
      where: {
        moduleType,
        referenceId,
      },
    });

    return count;
  });
}

/**
 * Migrate attachments from temporary reference to final reference
 * Used when invoice is created: rename TEMP:invoiceNumber to invoiceId
 */
export async function migrateAttachments(
  moduleType: string,
  tempReferenceId: string,
  finalReferenceId: string,
) {
  return withErrorHandler(async () => {
    // Update all attachments with temp reference to final reference
    const updated = await prisma.attachment.updateMany({
      where: {
        moduleType,
        referenceId: tempReferenceId,
      },
      data: {
        referenceId: finalReferenceId,
      },
    });

    console.log(
      `[Attachment] Migrated ${updated.count} attachments from ${tempReferenceId} to ${finalReferenceId}`,
    );

    return { success: true, count: updated.count };
  });
}
