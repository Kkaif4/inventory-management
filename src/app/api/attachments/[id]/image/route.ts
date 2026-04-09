import { NextRequest, NextResponse } from "next/server";
import { getAttachment } from "@/actions/attachments";

/**
 * GET /api/attachments/[id]/image
 * Stream image data
 *
 * Returns: WebP image with proper MIME type
 * Caching: 24 hours (public cache)
 */
export async function GET(
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
    // Get attachment with data
    const response = await getAttachment(attachmentId);

    if (!response.success || !response.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ATTACHMENT_NOT_FOUND",
            message: "Attachment not found",
          },
        },
        { status: 404 }
      );
    }

    const attachment = response.data;

    // Stream binary data
    const headers = new Headers();
    headers.set("Content-Type", attachment.mimeType || "image/webp");
    headers.set("Content-Length", attachment.size.toString());
    headers.set(
      "Content-Disposition",
      `inline; filename="${attachment.fileName}"`
    );
    headers.set("Cache-Control", "public, max-age=86400"); // 24 hours
    headers.set("X-File-Name", encodeURIComponent(attachment.fileName));
    headers.set("X-File-Size", attachment.size.toString());

    return new NextResponse(attachment.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[API] Image fetch error: ${errorMessage}`);

    const statusCode = errorMessage.includes("not found") ? 404 : 500;
    const errorCode = errorMessage.includes("not found")
      ? "ATTACHMENT_NOT_FOUND"
      : "FETCH_FAILED";

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
