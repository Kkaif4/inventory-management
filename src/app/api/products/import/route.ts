import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  processProductImport,
  ImportOptions,
} from "@/actions/products/import-logic";
import { importRowSchema } from "@/validations/import.validation";
import * as z from "zod";

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

        // First, pre-validate all rows to catch major issues early
        const validatedRowsWithErrors = rows.map((row, index) => {
          try {
            // Pre-process common type issues from XLSX/CSV parsing
            const normalized = { ...row };
            if (typeof normalized.pricingMethod === "string") {
              normalized.pricingMethod = normalized.pricingMethod
                .toUpperCase()
                .trim();
            }
            if (typeof normalized.gstRate === "string") {
              normalized.gstRate = parseFloat(
                normalized.gstRate.replace("%", "").trim(),
              );
            }

            return { row: importRowSchema.parse(normalized), error: null };
          } catch (e: any) {
            let message = e.message;
            if (e instanceof z.ZodError) {
              message = e.issues
                .map(
                  (iss: z.ZodIssue) => `${iss.path.join(".")}: ${iss.message}`,
                )
                .join(", ");
            }
            return { row: null, error: `Row ${index + 1}: ${message}` };
          }
        });

        const validRows = validatedRowsWithErrors
          .filter((r) => r.row !== null)
          .map((r) => r.row);

        const firstError = validatedRowsWithErrors.find(
          (r) => r.error !== null,
        )?.error;

        if (validRows.length === 0 && rows.length > 0) {
          console.error("Import failed validation. Sample error:", firstError);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                error: `Validation failed. Example error: ${firstError}`,
                done: true,
              }) + "\n",
            ),
          );
          return;
        }

        await processProductImport(validRows, options, (progress) => {
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
