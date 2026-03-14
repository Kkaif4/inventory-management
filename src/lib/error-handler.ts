import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { AppError, ErrorCode, StandardResponse } from "./exceptions";

export function handleError(error: unknown): StandardResponse {
  console.error("[Error Handler]:", error);

  // If it's already an instance of AppError, return it formatted
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };
  }

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Generic Error handling
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "An unexpected error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };
  }

  // Fallback for non-Error throws
  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unknown error occurred",
    },
  };
}

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): StandardResponse {
  let code: ErrorCode = "DATABASE_ERROR";
  let message = "A database error occurred";
  let details: any = undefined;

  switch (error.code) {
    case "P2002": // Unique constraint failed
      code = "CONFLICT";
      const targets = error.meta?.target as string[];
      message = `Unique constraint failed on: ${targets?.join(", ")}`;
      details = error.meta;
      break;
    case "P2025": // Record not found
      code = "NOT_FOUND";
      message = "The requested record was not found";
      break;
    case "P2003": // Foreign key constraint failed
      code = "VALIDATION_ERROR";
      message =
        "Resource is being used elsewhere or invalid reference provided";
      break;
    default:
      message = `Database Error: ${error.message}`;
  }

  return {
    success: false,
    error: { code, message, details },
  };
}

/**
 * Higher-order function for Server Actions
 */
export async function withErrorHandler<T>(
  action: () => Promise<T>,
): Promise<StandardResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    return handleError(error) as StandardResponse<T>;
  }
}

/**
 * Higher-order function for API Route Handlers
 */
export function apiHandler(
  handler: (req: Request, ...args: any[]) => Promise<Response>,
) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      const formatted = handleError(error);
      const statusCode = (error as any).statusCode || 500;
      return NextResponse.json(formatted, { status: statusCode });
    }
  };
}
