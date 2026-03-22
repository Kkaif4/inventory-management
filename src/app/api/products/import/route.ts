import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  processProductImport,
  ImportOptions,
} from "@/actions/products/import-logic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { outletId, rows } = body;

  if (!outletId) {
    return NextResponse.json(
      { error: "Outlet ID is required" },
      { status: 400 },
    );
  }

  // Basic validation of rows structure before processing
  if (!Array.isArray(rows)) {
    return NextResponse.json(
      { error: "Rows must be an array" },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log(`Processing import: ${rows.length} rows.`);
        const options: ImportOptions = {
          outletId,
          userId: session.user.id,
          skipOnError: true, // Always skip invalid rows
        };

        await processProductImport(rows, options, (progress) => {
          controller.enqueue(encoder.encode(JSON.stringify(progress) + "\n"));
        });

        controller.enqueue(
          encoder.encode(JSON.stringify({ done: true }) + "\n"),
        );
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ error: error.message, done: true }) + "\n",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
