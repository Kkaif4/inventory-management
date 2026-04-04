"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Filter, RotateCcw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Outlet {
  id: string;
  name: string;
}

export interface ReportFiltersProps {
  outlets: Outlet[];
  selectedOutletId: string;
  onOutletChange?: (outletId: string) => void;
  startDate?: Date;
  endDate?: Date;
  onDateChange?: (startDate: Date, endDate: Date) => void;
  onReset?: () => void;
  onApply?: () => void;
  isLoading?: boolean;
  isPending?: boolean;
  showDateRange?: boolean;
  showOutlet?: boolean;
  applyButtonLabel?: string;
  allowMultipleOutlets?: boolean;
  children?: React.ReactNode;
}

/**
 * Reusable Report Filters Component
 * Provides consistent filtering across all reports
 * - Outlet selection with proper name display
 * - Optional date range selection
 * - Reset functionality
 * - Apply/Load report button
 */
export function ReportFilters({
  outlets,
  selectedOutletId,
  onOutletChange,
  startDate,
  endDate,
  onDateChange,
  onReset,
  onApply,
  isLoading = false,
  isPending = false,
  showDateRange = true,
  showOutlet = true,
  applyButtonLabel = "Load Report",
  allowMultipleOutlets = false,
  children,
}: ReportFiltersProps) {
  const [localStartDate, setLocalStartDate] = useState(
    startDate || new Date(),
  );
  const [localEndDate, setLocalEndDate] = useState(endDate || new Date());

  // Find outlet name for display - show proper name instead of ID
  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId);
  const outletDisplayName = selectedOutlet?.name || "Select Outlet";

  const isDisabled = isLoading || isPending;

  const handleOutletChange = useCallback(
    (value: string | null) => {
      if (value && onOutletChange) {
        onOutletChange(value);
      }
    },
    [onOutletChange],
  );

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      setLocalStartDate(newDate);
      if (onDateChange) {
        onDateChange(newDate, localEndDate);
      }
    },
    [localEndDate, onDateChange],
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = new Date(e.target.value);
      setLocalEndDate(newDate);
      if (onDateChange) {
        onDateChange(localStartDate, newDate);
      }
    },
    [localStartDate, onDateChange],
  );

  const handleReset = useCallback(() => {
    setLocalStartDate(new Date());
    setLocalEndDate(new Date());
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  const handleApply = useCallback(() => {
    if (onApply) {
      onApply();
    }
  }, [onApply]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Report Filters</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isDisabled}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Outlet Filter */}
          {showOutlet && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Outlet
              </label>
              <Select
                value={selectedOutletId}
                onValueChange={handleOutletChange}
                disabled={isDisabled}
              >
                <SelectTrigger className="w-full">
                  <span className="text-slate-900">{outletDisplayName}</span>
                </SelectTrigger>
                <SelectContent>
                  {allowMultipleOutlets && (
                    <SelectItem value="all">All Outlets (Consolidated)</SelectItem>
                  )}
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          {showDateRange && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={format(localStartDate, "yyyy-MM-dd")}
                  onChange={handleStartDateChange}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={format(localEndDate, "yyyy-MM-dd")}
                  onChange={handleEndDateChange}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Additional filters (children) */}
          {children}

          {/* Apply/Load Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">&nbsp;</label>
            <Button
              className="w-full"
              onClick={handleApply}
              disabled={isDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                applyButtonLabel
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
