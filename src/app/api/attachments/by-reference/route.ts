import { NextRequest, NextResponse } from "next/server";
import { getAttachmentsByReference } from "@/actions/attachments";

/**
 * GET /api/attachments/by-reference?moduleType=EXPENSE&referenceId=...
 * Get attachment metadata for a module/reference
 *
 * Query parameters:
 * - moduleType: "EXPENSE" | "INVOICE"
 * - referenceId: string (cuid)
 *
 * Returns: Array of attachment metadata (without binary data)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const moduleType = searchParams.get("moduleType");
    const referenceId = searchParams.get("referenceId");

    if (!moduleType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_MODULE_TYPE",
            message: "Module type query parameter is required (EXPENSE or INVOICE)",
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
            message: "Reference ID query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    console.log(`[API] List attachments: ${moduleType}/${referenceId}`);

    // Get attachments
    const response = await getAttachmentsByReference(moduleType, referenceId);

    if (!response.success || !response.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LIST_FAILED",
            message: "Failed to retrieve attachments",
          },
        },
        { status: 500 }
      );
    }

    const attachments = response.data;

    console.log(`[API] Found ${attachments.length} attachments`);

    return NextResponse.json(
      {
        success: true,
        data: attachments.map((a) => ({
          id: a.id,
          fileName: a.fileName,
          mimeType: a.mimeType,
          size: a.size,
          createdAt: a.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[API] List error: ${errorMessage}`);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LIST_FAILED",
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
