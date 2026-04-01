"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus, Search, Package } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { getProducts } from "@/actions/products";
import { appendItemsToInvoice } from "@/actions/sales/sales-invoice";

interface AppendItemsDrawerProps {
  open: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    txnNumber: string;
    outletId: string;
    billType: string;
    status: string;
  };
  userId: string;
  onSuccess?: () => void;
}

interface PendingItem {
  variantId: string;
  productName: string;
  quantity: number;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstRate: number;
}

export function AppendItemsDrawer({
  open,
  onClose,
  invoice,
  userId,
  onSuccess,
}: AppendItemsDrawerProps) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<{
    product: any;
    variant: any;
  } | null>(null);
  const [pendingQty, setPendingQty] = useState("1");
  const [items, setItems] = useState<PendingItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  // Flatten products to variants
  const flatVariants = useMemo(() => {
    const list: { product: any; variant: any }[] = [];
    for (const p of products) {
      for (const v of p.variants || []) {
        list.push({ product: p, variant: v });
      }
    }
    return list;
  }, [products]);

  // Fetch products on search change with debounce
  useEffect(() => {
    if (!invoice.outletId || !search) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getProducts(invoice.outletId, { search });
        if (res.success) {
          setProducts(res.data || []);
          setHighlightedIndex(0);
        }
      } catch (err) {
        console.error("[AppendItemsDrawer] Product search error:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, invoice.outletId]);

  // Reset when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setItems([]);
      setPendingProduct(null);
      setPendingQty("1");
      setIsSearchOpen(false);
    } else {
      // Focus the search input when drawer opens using requestAnimationFrame
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [open]);

  const selectProduct = useCallback((product: any, variant: any) => {
    setPendingProduct({ product, variant });
    setPendingQty("1");
    setSearch("");
    setIsSearchOpen(false);
    // Wait for render, then focus qty input
    requestAnimationFrame(() => {
      qtyInputRef.current?.focus();
    });
  }, []);

  const confirmAddItem = useCallback(() => {
    if (!pendingProduct) return;

    const qty = parseFloat(pendingQty) || 1;
    const { product, variant } = pendingProduct;
    const gstRate = invoice.billType === "NO1" ? product.gstRate || 0 : 0;
    const taxableValue = qty * (variant.sellingPrice || 0);
    const taxAmount = (taxableValue * gstRate) / 100;

    const cgst = gstRate > 0 ? taxAmount / 2 : 0;
    const sgst = gstRate > 0 ? taxAmount / 2 : 0;
    const igst = 0;

    const newItem: PendingItem = {
      variantId: variant.id,
      productName: product.name,
      quantity: qty,
      rate: variant.sellingPrice || 0,
      taxableValue,
      cgst,
      sgst,
      igst,
      gstRate,
    };

    setItems((prev) => [...prev, newItem]);
    setPendingProduct(null);
    setPendingQty("1");
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [pendingProduct, pendingQty, invoice.billType]);

  const cancelPending = useCallback(() => {
    setPendingProduct(null);
    setPendingQty("1");
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        if (flatVariants[highlightedIndex]) {
          const item = flatVariants[highlightedIndex];
          selectProduct(item.product, item.variant);
        }
      } else if (e.key === "Escape") {
        setSearch("");
        setIsSearchOpen(false);
      }
    },
    [flatVariants, highlightedIndex, selectProduct],
  );

  const handleQtyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAddItem();
      } else if (e.key === "Escape") {
        cancelPending();
      }
    },
    [confirmAddItem, cancelPending],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setIsSearchOpen(true);
    },
    [],
  );

  const handleQtyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPendingQty(e.target.value.replace(/[^\d.]/g, ""));
    },
    [],
  );

  const totalValue = items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalTax = items.reduce(
    (sum, item) => sum + item.cgst + item.sgst + item.igst,
    0,
  );
  const grandTotal = totalValue + totalTax;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  const handleSubmit = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await appendItemsToInvoice(invoice.id, {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          rate: item.rate,
          taxableValue: item.taxableValue,
          cgst: item.cgst,
          sgst: item.sgst,
          igst: item.igst,
          gstRate: item.gstRate,
        })),
        userId,
      });

      if (res.success) {
        toast.success(
          `Added ${items.length} item${items.length > 1 ? "s" : ""} to invoice`,
        );
        onClose();
        onSuccess?.();
      } else {
        toast.error(res.error?.message ?? "Failed to add items");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }, [items, invoice.id, userId, onClose, onSuccess]);

  // Calculate popover width to match drawer content
  const popoverWidth = "calc(100% - 48px)"; // 560px - 24px padding on each side

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="!w-[560px] !max-w-full h-full flex flex-col overflow-y-auto">
        <DrawerHeader className="border-b border-slate-100 pb-4 px-6 pt-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <DrawerTitle className="text-base font-bold text-slate-900">
                  Add Items
                </DrawerTitle>
                <p className="text-xs text-slate-500">
                  Invoice: {invoice.txnNumber}
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <button className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Product Search */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-2 block">
              Search Product
            </Label>
            {pendingProduct ? (
              <div className="flex items-center gap-3 h-10 px-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
                <Package className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm font-semibold text-blue-900 truncate flex-1">
                  {pendingProduct.product.name}
                </span>
                <span className="text-sm text-blue-600 font-mono shrink-0">
                  @ ₹{pendingProduct.variant.sellingPrice}
                </span>
                <div className="w-px h-6 bg-blue-200 shrink-0" />
                <label className="text-sm text-blue-700 font-medium shrink-0">
                  Qty:
                </label>
                <input
                  ref={qtyInputRef}
                  type="text"
                  inputMode="numeric"
                  value={pendingQty}
                  onChange={handleQtyChange}
                  onKeyDown={handleQtyKeyDown}
                  className="w-16 h-7 text-center text-sm font-mono font-bold bg-white border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  onClick={confirmAddItem}
                  className="px-3 h-7 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700"
                  aria-label="Add item"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={cancelPending}
                  className="text-blue-400 hover:text-blue-600"
                  aria-label="Cancel item selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <PopoverPrimitive.Root
                open={isSearchOpen && search.length > 0}
                onOpenChange={setIsSearchOpen}
              >
                <PopoverPrimitive.Anchor asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => search.length > 0 && setIsSearchOpen(true)}
                      placeholder="Search by product name..."
                      className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm cursor-text"
                      autoComplete="off"
                      aria-autocomplete="list"
                      aria-controls="product-listbox"
                      aria-expanded={isSearchOpen && search.length > 0}
                      role="combobox"
                    />
                  </div>
                </PopoverPrimitive.Anchor>
                <PopoverPrimitive.Content
                  ref={popoverContentRef}
                  side="bottom"
                  align="start"
                  className="max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50 focus:outline-none"
                  style={{ width: popoverWidth, pointerEvents: "auto" }}
                  sideOffset={4}
                >
                  <div
                    id="product-listbox"
                    role="listbox"
                    aria-label="Product search results"
                  >
                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        Loading...
                      </div>
                    ) : flatVariants.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No products found
                      </div>
                    ) : (
                      flatVariants.map((item, idx) => (
                        <button
                          key={`${item.variant.id}-${idx}`}
                          type="button"
                          onClick={() =>
                            selectProduct(item.product, item.variant)
                          }
                          className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors ${
                            idx === highlightedIndex ? "bg-blue-100" : ""
                          }`}
                          role="option"
                          aria-selected={idx === highlightedIndex}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {item.variant.sku}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-sm font-bold text-slate-900">
                              ₹{item.variant.sellingPrice}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Root>
            )}
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-700">
                Items to Add ({items.length})
              </Label>
              <div className="space-y-2 bg-slate-50 rounded-lg p-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} × ₹{item.rate.toFixed(2)} = ₹
                        {item.taxableValue.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-slate-100 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxable Value</span>
                  <span className="font-bold text-slate-900">
                    {fmt(totalValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Tax</span>
                  <span className="font-bold text-slate-900">
                    {fmt(totalTax)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-1.5">
                  <span className="font-semibold text-slate-700">
                    Total to Add
                  </span>
                  <span className="text-lg font-black text-blue-600">
                    {fmt(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="px-6 py-4 border-t border-slate-100">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-lg shadow-blue-100"
          >
            {isSubmitting
              ? "Adding items..."
              : `Add ${items.length} Item${items.length !== 1 ? "s" : ""}`}
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full" type="button">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
