"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
  subLabel?: string;
  searchTerms?: string[];
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
  emptyMessage = "No results found.",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(lowerSearch);
      const matchSub = opt.subLabel?.toLowerCase().includes(lowerSearch);
      const matchTerms = opt.searchTerms?.some((t) =>
        t.toLowerCase().includes(lowerSearch),
      );
      return matchLabel || matchSub || matchTerms;
    });
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-medium border-slate-200 hover:bg-slate-50 h-9 px-3 transition-all",
            !value && "text-slate-500",
            className,
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in-0 zoom-in-95"
          align="start"
          sideOffset={4}
        >
          <div className="flex items-center border-b border-slate-100 px-3 h-10 sticky top-0 bg-white">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
            <input
              className="flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500 font-medium italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-50 text-left group",
                    value === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex flex-col flex-1 truncate">
                    <span className="font-bold truncate leading-tight">
                      {option.label}
                    </span>
                    {option.subLabel && (
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="h-4 w-4 ml-2 shrink-0 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
