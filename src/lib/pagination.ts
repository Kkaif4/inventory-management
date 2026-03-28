/**
 * Pagination utility functions for server-side pagination
 */

import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  LIMIT_OPTIONS,
} from "@/constants/pagination";
import { PaginationMeta } from "@/types/pagination";

/**
 * Parse pagination parameters from URL search params
 * Validates and clamps values to safe ranges
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): { page: number; limit: number } {
  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;

  // Handle both URLSearchParams and object formats
  const getParam = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const val = searchParams[key];
    return typeof val === "string" ? val : Array.isArray(val) ? val[0] : null;
  };

  const pageStr = getParam("page");
  const limitStr = getParam("limit");

  if (pageStr) {
    const parsed = parseInt(pageStr, 10);
    page = Math.max(1, parsed) || DEFAULT_PAGE;
  }

  if (limitStr) {
    const parsed = parseInt(limitStr, 10);
    limit = Math.max(1, Math.min(parsed, MAX_LIMIT)) || DEFAULT_LIMIT;
  }

  return { page, limit };
}

/**
 * Calculate pagination metadata
 * Returns skip/take offsets and total page count
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const skip = (safePage - 1) * limit;

  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    skip,
  };
}

/**
 * Generate page number range for pagination UI
 * Returns an array with page numbers and '...' for omitted ranges
 * Example: [1, '...', 4, 5, 6, '...', 10]
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  delta: number = 2,
): (number | string)[] {
  if (totalPages <= 1) return [1];

  const range: (number | string)[] = [];
  const leftSide = currentPage - delta;
  const rightSide = currentPage + delta + 1;

  const getNumbers = () => {
    const nums: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= leftSide && i < rightSide)) {
        nums.push(i);
      }
    }
    return nums;
  };

  const numbers = getNumbers();

  numbers.forEach((num, i) => {
    if (i > 0 && numbers[i - 1] !== num - 1) {
      range.push("...");
    }
    range.push(num);
  });

  return range;
}

/**
 * Build a query string from pagination and filter params
 * Omits default values to keep URLs clean
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const filtered = Object.entries(params).filter(
    ([, value]) => value != null && value !== "" && value !== false,
  );

  const searchParams = new URLSearchParams(
    filtered.map(([key, value]) => [key, String(value)]),
  );

  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
