"use client";

import * as React from "react";
import { Search, Filter, Columns, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

interface TableToolbarProps {
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selectedCount?: number;
  onBulkDelete?: () => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function TableToolbar({
  onSearchChange,
  searchPlaceholder = "Search...",
  selectedCount = 0,
  onBulkDelete,
  filters,
  actions,
}: TableToolbarProps) {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-default animate-in fade-in slide-in-from-top-1">
              <span className="text-xs font-bold text-red-600">
                {selectedCount} selected
              </span>
              <div className="w-px h-3 bg-red-200" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-red-600 hover:bg-red-100 p-1"
                onClick={onBulkDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button variant="secondary" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>

          <Button variant="secondary" size="sm" className="gap-2">
            <Columns className="w-4 h-4" />
            <span>Columns</span>
          </Button>

          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>

          {actions}
        </div>
      </div>

      {/* Active Filters row would go here */}
    </div>
  );
}
