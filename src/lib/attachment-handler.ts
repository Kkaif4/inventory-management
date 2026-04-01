import {
  validateImageFile,
  compressAndEncodeImage,
  formatFileSize,
  calculateEncodedSize,
} from "@/lib/image-processing";
import { attachmentValidationRules } from "@/validations/expense.validation";

export interface AttachmentUploadResult {
  success: boolean;
  attachmentId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface AttachmentProcessResult {
  buffer: Buffer;
  base64: string;
  dataUri: string;
  fileName: string;
  mimeType: string;
  size: number;
  originalSize: number;
  compressionRatio: number;
  encodedSize: number;
}

export async function processAttachmentFile(
  file: any,
): Promise<AttachmentProcessResult> {
  // Validate file
  const validation = validateImageFile(
    file,
    attachmentValidationRules.MAX_SIZE_BEFORE_COMPRESSION / (1024 * 1024),
  );

  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // Compress and encode image
    const processed = await compressAndEncodeImage(originalBuffer, {
      quality: attachmentValidationRules.COMPRESSION_QUALITY,
      maxWidth: attachmentValidationRules.MAX_DIMENSION,
    });

    const encodedSize = calculateEncodedSize(processed.size);

    return {
      buffer: processed.buffer,
      base64: processed.base64,
      dataUri: processed.dataUri,
      fileName: file.name,
      mimeType: processed.mimeType,
      size: processed.size,
      originalSize: processed.originalSize,
      compressionRatio: processed.compressionRatio,
      encodedSize,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Attachment] Processing failed: ${errorMessage}`);
    throw new Error(`Failed to process attachment: ${errorMessage}`);
  }
}

/**
 * Validate module type and reference ID combination
 */
export function validateModuleReference(
  moduleType: string,
  referenceId: string,
): { valid: boolean; error?: string } {
  if (!moduleType || !referenceId) {
    return {
      valid: false,
      error: "Module type and reference ID are required",
    };
  }

  if (!["EXPENSE", "INVOICE"].includes(moduleType)) {
    return {
      valid: false,
      error: "Module type must be EXPENSE or INVOICE",
    };
  }

  // Accept TEMP: prefix for invoices being created (before invoice ID exists)
  // Format: TEMP:invoiceNumber (e.g., TEMP:INV-001)
  if (moduleType === "INVOICE" && referenceId.startsWith("TEMP:")) {
    return { valid: true };
  }

  // Standard format: Prisma cuid, cuid2, or uuid (alphanumeric and hyphens)
  if (!/^[a-z0-9\-]{8,}$/i.test(referenceId)) {
    return {
      valid: false,
      error: "Invalid reference ID format",
    };
  }

  return { valid: true };
}

/**
 * Get attachment error response
 */
export function createAttachmentErrorResponse(
  code: string,
  message: string,
): AttachmentUploadResult {
  console.error(`[Attachment Error] ${code}: ${message}`);

  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

/**
 * Create attachment success response
 */
export function createAttachmentSuccessResponse(
  attachmentId: string,
  fileName: string,
  mimeType: string,
  size: number,
): AttachmentUploadResult {
  return {
    success: true,
    attachmentId,
    fileName,
    mimeType,
    size,
  };
}

/**
 * Format attachment for client response
 * Returns ID and metadata (no binary data)
 */
export function formatAttachmentForClient(attachment: any) {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    size: attachment.size,
    createdAt: attachment.createdAt,
  };
}

/**
 * Extract data URI from attachment for rendering
 * Used in HTML img tags and PDF embedding
 */
export function extractDataUriFromAttachment(attachment: any): string | null {
  // If data is stored as data URI string, return directly
  if (
    typeof attachment.data === "string" &&
    attachment.data.startsWith("data:")
  ) {
    return attachment.data;
  }

  // If data is stored as Buffer, convert to data URI
  if (Buffer.isBuffer(attachment.data)) {
    const base64 = attachment.data.toString("base64");
    return `data:${attachment.mimeType};base64,${base64}`;
  }

  return null;
}
