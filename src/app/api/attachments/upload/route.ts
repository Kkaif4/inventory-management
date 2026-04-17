import { NextRequest, NextResponse } from "next/server";
import { uploadAttachment } from "@/actions/attachments";

/**
 * POST /api/attachments/upload
 * Upload and process image attachment
 *
 * FormData:
 * - file: File (JPG/PNG, max 5MB)
 * - moduleType: "EXPENSE" | "INVOICE"
 * - referenceId: string (cuid)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const moduleType = formData.get("moduleType") as string;
    const referenceId = formData.get("referenceId") as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FILE",
            message: "File is required",
          },
        },
        { status: 400 }
      );
    }

    if (!moduleType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_MODULE_TYPE",
            message: "Module type is required (EXPENSE or INVOICE)",
          },
        },
        { status: 400 }
      );
    }

    if (!referenceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REFERENCE_ID",
            message: "Reference ID is required",
          },
        },
        { status: 400 }
      );
    }

    // Call server action
    const result = await uploadAttachment(moduleType, referenceId, file);

    if (!result.success) {
      const errorMessage = result.error?.message || "Upload failed";
      const errorCode = result.error?.code || "UPLOAD_FAILED";

      console.error(`[API] Upload error: ${errorCode} - ${errorMessage}`);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
          },
        },
        { status: result.error?.code === "VALIDATION_ERROR" ? 400 : 500 }
      );
    }

    const attachment = result.data;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: attachment?.id,
          fileName: attachment?.fileName,
          mimeType: attachment?.mimeType,
          size: attachment?.size,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[API] Upload exception: ${errorMessage}`);

    // Determine error code
    let errorCode = "UPLOAD_FAILED";
    if (errorMessage.includes("MIME")) {
      errorCode = "INVALID_FILE_TYPE";
    } else if (errorMessage.includes("5MB")) {
      errorCode = "FILE_TOO_LARGE";
    } else if (errorMessage.includes("compression")) {
      errorCode = "COMPRESSION_ERROR";
    } else if (errorMessage.includes("not found")) {
      errorCode = "MODULE_NOT_FOUND";
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      },
      { status: errorCode === "MODULE_NOT_FOUND" ? 404 : 400 }
    );
  }
}
