"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startRange = (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-2">
      <div className="text-sm text-text-muted">
        Showing{" "}
        <span className="font-bold text-text-secondary">
          {startRange}–{endRange}
        </span>{" "}
        of <span className="font-bold text-text-secondary">{totalResults}</span>{" "}
        results
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Page size:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-default border border-border-default bg-surface-base px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1; // Simplistic - logic for elipsis needed for 10+ pages
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "primary" : "ghost"}
                  className={cn(
                    "h-8 w-8 p-0 text-xs",
                    currentPage !== pageNum &&
                      "text-text-muted hover:text-text-primary",
                  )}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
