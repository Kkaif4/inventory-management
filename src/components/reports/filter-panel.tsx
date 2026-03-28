"use client";

import { useState } from "react";
import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search as SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterPanelProps {
  filters: Array<{
    id: string;
    label: string;
    type: "select" | "date-range" | "search" | "checkbox-group";
    options?: FilterOption[];
    placeholder?: string;
    value?: any;
    onChange: (value: any) => void;
  }>;
  onApply?: () => void;
  onReset?: () => void;
  isLoading?: boolean;
}

export function FilterPanel({
  filters,
  onApply,
  onReset,
  isLoading = false,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(true); // Default expanded for better discoverability
  const activeFilters = filters.filter(
    (f) =>
      f.value &&
      f.value !== "" &&
      (!Array.isArray(f.value) || f.value.length > 0) &&
      (f.type !== "date-range" || (f.value.from && f.value.to)),
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header / Trigger */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">
              Filter Results
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Refine your report data
            </p>
          </div>
          {activeFilters > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
              {activeFilters}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronDown
            size={18}
            className={cn(
              "text-slate-400 transition-transform duration-300",
              expanded && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Filter Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-6 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {filter.label}
                  </label>
                  <FilterField {...filter} />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end mt-8 pt-6 border-t border-slate-100 gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={isLoading}
                className="text-slate-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest h-10 px-6"
              >
                <RotateCcw size={14} className="mr-2" />
                Reset Defaults
              </Button>
              <Button
                size="sm"
                onClick={onApply}
                disabled={isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest h-10 px-8 rounded-xl shadow-lg shadow-slate-200 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? "Applying..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({
  label,
  type,
  options,
  placeholder,
  value,
  onChange,
}: any) {
  switch (type) {
    case "select":
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="bg-slate-50/50 border-slate-200 h-10 rounded-xl focus:ring-blue-500/20">
            <SelectValue placeholder={placeholder || `Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200">
            {options?.map((opt: FilterOption) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "search":
      return (
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Search...`}
            className="pl-10 bg-slate-50/50 border-slate-200 h-10 rounded-xl focus:ring-blue-500/20"
          />
        </div>
      );

    case "date-range":
      return (
        <DateRangePicker
          value={value}
          onChange={onChange}
          placeholder={placeholder || "Select dates"}
        />
      );

    case "checkbox-group":
      return (
        <div className="flex flex-wrap gap-2 p-1 bg-slate-50/50 rounded-xl border border-slate-200 min-h-[40px] px-3 items-center">
          {options?.map((opt: FilterOption) => {
            const isChecked = Array.isArray(value)
              ? value.includes(opt.value)
              : false;
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all",
                  isChecked
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:bg-slate-200/50 text-slate-600",
                )}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isChecked}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(opt.value);
                    } else {
                      const index = newValue.indexOf(opt.value);
                      if (index > -1) newValue.splice(index, 1);
                    }
                    onChange(newValue);
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}
