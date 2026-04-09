import { NextRequest, NextResponse } from "next/server";
import { deleteAttachment } from "@/actions/attachments";

/**
 * DELETE /api/attachments/[id]
 * Delete attachment
 *
 * Request body:
 * {
 *   "moduleType": "EXPENSE" | "INVOICE",
 *   "referenceId": string
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params
    const resolvedParams = params instanceof Promise ? await params : params;
    const attachmentId = resolvedParams?.id;

    if (!attachmentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ID",
            message: "Attachment ID is required",
          },
        },
        { status: 400 }
      );
    }

    // Parse request body
    let moduleType: string | null = null;
    let referenceId: string | null = null;

    try {
      const body = await request.json();
      moduleType = body.moduleType;
      referenceId = body.referenceId;
    } catch {
      // Body might be empty, check for query parameters as fallback
      const searchParams = request.nextUrl.searchParams;
      moduleType = searchParams.get("moduleType");
      referenceId = searchParams.get("referenceId");
    }

    if (!moduleType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_MODULE_TYPE",
            message: "Module type is required",
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
    const result = await deleteAttachment(attachmentId, moduleType, referenceId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELETE_FAILED",
            message: "Failed to delete attachment",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[API] Delete error: ${errorMessage}`);

    let statusCode = 500;
    let errorCode = "DELETE_FAILED";

    if (errorMessage.includes("not found")) {
      statusCode = 404;
      errorCode = "ATTACHMENT_NOT_FOUND";
    } else if (errorMessage.includes("Access denied")) {
      statusCode = 403;
      errorCode = "ACCESS_DENIED";
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      },
      { status: statusCode }
    );
  }
}
