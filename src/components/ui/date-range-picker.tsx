"use client";

import * as React from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DateRangePickerProps {
  value?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const shortcuts = [
    { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
    {
      label: "This Week",
      getValue: () => ({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 }),
      }),
    },
    {
      label: "Last 3 Months",
      getValue: () => ({
        from: subMonths(new Date(), 3),
        to: new Date(),
      }),
    },
    {
      label: "This Year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      }),
    },
    {
      label: "Last Year",
      getValue: () => ({
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1)),
      }),
    },
  ];

  const formattedRange = value
    ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
    : placeholder;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white h-10 border-slate-200 hover:border-blue-400 transition-colors",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
            <span className="flex-1 truncate">{formattedRange}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-none shadow-xl ring-1 ring-black/5"
          align="start"
        >
          <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden">
            {/* Shortcuts Panel */}
            <div className="w-full md:w-48 bg-slate-50 border-r border-slate-100 p-2 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
                Shortcuts
              </p>
              {shortcuts.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onChange(s.getValue())}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white hover:text-blue-600 transition-all font-medium text-slate-600"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Date Inputs Form */}
            <div className="p-4 space-y-4 min-w-[300px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    From
                  </label>
                  <input
                    type="date"
                    value={value ? format(value.from, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const from = new Date(e.target.value);
                      if (!isNaN(from.getTime())) {
                        onChange({ from, to: value?.to || from });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    To
                  </label>
                  <input
                    type="date"
                    value={value ? format(value.to, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const to = new Date(e.target.value);
                      if (!isNaN(to.getTime())) {
                        onChange({ from: value?.from || to, to });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-red-600"
                  onClick={() => onChange({ from: new Date(), to: new Date() })}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
