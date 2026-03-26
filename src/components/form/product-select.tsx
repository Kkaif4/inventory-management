"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Search } from "lucide-react";
import { useOutletStore } from "@/store/use-outlet-store";
import { getProducts } from "@/actions/products";
import { cn } from "@/lib/utils";

interface ProductSelectProps {
  value?: string;
  onChange: (variantId: string, productData: any) => void;
  onAfterSelect?: () => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  search?: string;
  outletId?: string;
}

export function ProductSelect({
  value,
  onChange,
  onAfterSelect,
  disabled,
  compact = false,
  className,
  search: initialSearch,
  outletId: propOutletId,
}: ProductSelectProps) {
  const { currentOutletId } = useOutletStore();
  const outletId = propOutletId || currentOutletId;
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState(initialSearch || "");
  const [displayText, setDisplayText] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Build a flat list of variants for navigation
  const flatVariants = React.useMemo(() => {
    const list: { product: any; variant: any }[] = [];
    for (const product of products) {
      for (const variant of product.variants || []) {
        list.push({ product, variant });
      }
    }
    return list;
  }, [products]);

  // Load products on search change
  React.useEffect(() => {
    if (!outletId) return;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const limit = search === "" ? 10 : undefined;
        const res = await getProducts(outletId, { search, limit });
        if (res.success) {
          setProducts(res.data || []);
          setHighlightedIndex(0);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [outletId, search]);

  // Resolve display text for existing value
  React.useEffect(() => {
    if (value && !displayText && products.length > 0) {
      for (const p of products) {
        const v = p.variants?.find((v: any) => v.id === value);
        if (v) {
          setDisplayText(`${v.sku} ${p.name}`);
          break;
        }
      }
    }
  }, [value, products, displayText]);

  const selectVariant = (product: any, variant: any) => {
    setDisplayText(`${variant.sku} ${product.name}`);
    setSearch("");
    setIsOpen(false);
    onChange(variant.id, { product, variant });
    // Defer onAfterSelect so focus can move after popover closes
    if (onAfterSelect) {
      setTimeout(onAfterSelect, 50);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, flatVariants.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatVariants.length > 0) {
        const item = flatVariants[highlightedIndex];
        if (item) {
          selectVariant(item.product, item.variant);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      // Show search text when focused for editing
      if (displayText) {
        setSearch("");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(0);
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`,
      );
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? search : displayText}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            placeholder="Search product..."
            className={cn(
              "w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
              compact ? "h-7 text-xs" : "h-9 text-sm",
              disabled && "bg-slate-100 cursor-not-allowed opacity-60",
              className,
            )}
            autoComplete="off"
          />
          {!displayText && !isOpen && (
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          )}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[var(--radix-popover-trigger-width)] min-w-[400px] z-50 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95"
          align="start"
          sideOffset={2}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            ref={listRef}
            className="max-h-[240px] overflow-y-auto"
          >
            {isLoading ? (
              <div className="text-center py-3 text-xs text-slate-500">
                Loading...
              </div>
            ) : flatVariants.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-500">
                {search ? "No products found" : "Type to search..."}
              </div>
            ) : (
              flatVariants.map((item, idx) => (
                <button
                  key={item.variant.id}
                  data-index={idx}
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
                    selectVariant(item.product, item.variant);
                  }}
                >
                  <span className="font-mono text-[10px] text-slate-400 w-20 shrink-0 truncate">
                    {item.variant.sku}
                  </span>
                  <span className="font-medium truncate flex-1">
                    {item.product.name}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    ₹{item.variant.sellingPrice}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="border-t px-3 py-1 text-[10px] text-slate-400">
            {search === ""
              ? "Top 10 shown. Type to search all."
              : `${flatVariants.length} result${flatVariants.length !== 1 ? "s" : ""}. ↑↓ navigate, Enter select.`}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
