"use client";

import React from "react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LIMIT_OPTIONS } from "@/constants/pagination";
import { getPaginationRange } from "@/lib/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isPending?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
  isPending = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  const pageRange = getPaginationRange(page, totalPages);

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {/* Desktop pagination controls */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {total === 0 ? 0 : startIndex} to {endIndex} of {total} results
        </div>

        <div className="flex items-center gap-2">
          {/* Page navigation buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={page === 1 || isPending}
              title="First page"
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isPending}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {pageRange.map((item, index) => (
                <React.Fragment key={index}>
                  {item === "..." ? (
                    <span className="px-2 text-slate-500">…</span>
                  ) : (
                    <Button
                      variant={item === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onPageChange(item as number)}
                      disabled={isPending}
                    >
                      {item}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isPending}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages || isPending}
              title="Last page"
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l">
            <span className="text-sm text-slate-600">Per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile pagination controls */}
      <div className="sm:hidden flex flex-col gap-3">
        <div className="text-sm text-slate-600 text-center">
          Page {page} of {totalPages} — Showing {total === 0 ? 0 : startIndex} to{" "}
          {endIndex} of {total}
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium min-w-16 text-center">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={String(limit)}
          onValueChange={(val) => onLimitChange(Number(val))}
          disabled={isPending}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
