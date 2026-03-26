"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Search } from "lucide-react";
import { useOutletStore } from "@/store/use-outlet-store";
import { getPartiesWithBalances } from "@/actions/parties";
import { cn } from "@/lib/utils";

interface CustomerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  onCustomerLoad?: (customer: any) => void;
}

export function CustomerSelect({
  value,
  onChange,
  disabled,
  compact = false,
  className,
  onCustomerLoad,
}: CustomerSelectProps) {
  const { currentOutletId } = useOutletStore();
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!currentOutletId) return;

    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const res = await getPartiesWithBalances(currentOutletId, "CUSTOMER");
        if (res.success) {
          setCustomers(res.data || []);
        }
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [currentOutletId]);

  const filtered = React.useMemo(() => {
    if (!search) return customers;
    const lower = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.gstin?.toLowerCase().includes(lower),
    );
  }, [customers, search]);

  const selectedCustomer = customers.find((c) => c.id === value);

  const handleSelect = (customer: any) => {
    onChange(customer.id);
    setSearch("");
    setIsOpen(false);
    if (onCustomerLoad) onCustomerLoad(customer);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0 && filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearch("");
    }
  };

  const isOverLimit =
    selectedCustomer &&
    selectedCustomer.currentBalance > (selectedCustomer.creditLimit || 0);

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? search : selectedCustomer?.name || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={handleFocus}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            placeholder="Search customer..."
            className={cn(
              "w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
              compact ? "h-7 text-xs" : "h-9 text-sm",
              isOverLimit && "border-red-300 focus:ring-red-500/20",
              disabled && "bg-slate-100 cursor-not-allowed opacity-60",
              className,
            )}
            autoComplete="off"
          />
          {!selectedCustomer && !isOpen && (
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          )}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[var(--radix-popover-trigger-width)] min-w-[300px] z-50 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95"
          align="start"
          sideOffset={2}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[240px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-3 text-xs text-slate-500">
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-500">
                No customers found
              </div>
            ) : (
              filtered.map((customer, idx) => {
                const over =
                  customer.currentBalance > (customer.creditLimit || 0);
                return (
                  <button
                    key={customer.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                      idx === highlightedIndex
                        ? "bg-blue-50 text-blue-900"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(customer);
                    }}
                  >
                    <span className="font-medium truncate flex-1">
                      {customer.name}
                    </span>
                    {customer.creditLimit != null && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded shrink-0",
                          over
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        ₹{customer.currentBalance?.toLocaleString()} / ₹
                        {customer.creditLimit?.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
