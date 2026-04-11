"use client";

import * as React from "react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { X, Search, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/hooks/use-product-search";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface POSInvoiceTableProps {
  form: UseFormReturn<any>;
  fieldArray: UseFieldArrayReturn<any, "items", "id">;
  billType: string;
  fromOutletId: string;
  isPosted: boolean;
  isGlobalDiscount: boolean;
  productSearchRef?: React.RefObject<HTMLInputElement | null>;
}

export function POSInvoiceTable({
  form,
  fieldArray,
  billType,
  fromOutletId,
  isPosted,
  isGlobalDiscount,
  productSearchRef,
}: POSInvoiceTableProps) {
  const t = useTranslations("billing");
  const { fields, append, remove } = fieldArray;
  const isNO1 = billType === "NO1";

  const { search, setSearch, flatVariants, isLoading, clearResults } =
    useProductSearch(fromOutletId);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [pendingProduct, setPendingProduct] = React.useState<{
    product: any;
    variant: any;
  } | null>(null);
  const [pendingQty, setPendingQty] = React.useState("1");
  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [flatVariants]);

  const selectProduct = (product: any, variant: any) => {
    setPendingProduct({ product, variant });
    setPendingQty("1");
    clearResults();
    setIsSearchOpen(false);
    setTimeout(() => qtyInputRef.current?.focus(), 50);
  };

  const confirmAddItem = () => {
    if (!pendingProduct) return;
    const qty = parseInt(pendingQty, 10) || 1;
    const { product, variant } = pendingProduct;

    append({
      variantId: variant.id,
      productName: product.name,
      description: product.name,
      quantity: qty,
      unit: "BASE",
      rate: variant.sellingPrice || 0,
      discountPercent: 0,
      gstRate: isNO1 ? product.gstRate || 0 : 0,
      hsnCode: variant.sku || product.sku || "",
      taxableValue: 0,
      lineTotal: 0,
    });

    setPendingProduct(null);
    setPendingQty("1");
    setTimeout(() => productSearchRef?.current?.focus(), 50);
  };

  const cancelPending = () => {
    setPendingProduct(null);
    setPendingQty("1");
    setTimeout(() => productSearchRef?.current?.focus(), 50);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    }
  };

  const addManualItem = () => {
    if (!search || billType !== "OLD") return;
    append({
      variantId: null,
      productName: search,
      itemDescription: search,
      description: search,
      quantity: 1,
      unit: "BASE",
      rate: 0,
      discountPercent: 0,
      gstRate: 0,
      hsnCode: "",
      taxableValue: 0,
      lineTotal: 0,
    });
    clearResults();
    setIsSearchOpen(false);
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmAddItem();
    } else if (e.key === "Escape") {
      cancelPending();
    }
  };

  const getLineTotal = (index: number) => {
    const qty = form.watch(`items.${index}.quantity`) || 0;
    const rate = form.watch(`items.${index}.rate`) || 0;
    const disc = form.watch(`items.${index}.discountPercent`) || 0;
    return qty * rate * (1 - disc / 100);
  };

  const handleInlineQtyChange = (index: number, value: string) => {
    const num = parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
    form.setValue(`items.${index}.quantity`, num);
  };

  const handleInlineRateChange = (index: number, value: string) => {
    let val = value.replace(/[^\d.]/g, "");
    val = val.replace(/\.(?=.*\.)/g, "");
    if (val.includes(".")) {
      const [int, dec] = val.split(".");
      val = int + "." + dec.slice(0, 2);
    }
    form.setValue(`items.${index}.rate`, parseFloat(val) || 0);
  };

  const handleInlineDiscChange = (index: number, value: string) => {
    const num = parseFloat(value) || 0;
    form.setValue(
      `items.${index}.discountPercent`,
      Math.min(100, Math.max(0, num)),
    );
  };

  return (
    <TooltipProvider>
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Product Search Bar */}
        {!isPosted && (
          <div className="shrink-0 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="relative max-w-xl">
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
                    {t("table.qty")}:
                  </label>
                  <input
                    ref={qtyInputRef}
                    type="text"
                    inputMode="numeric"
                    value={pendingQty}
                    onChange={(e) =>
                      setPendingQty(e.target.value.replace(/[^\d]/g, ""))
                    }
                    onKeyDown={handleQtyKeyDown}
                    title={t("tooltips.quantity")}
                    className="w-16 h-7 text-center text-sm font-mono font-bold bg-white border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={confirmAddItem}
                    className="px-3 h-7 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t("table.addToInvoice")}
                  </button>
                  <button
                    type="button"
                    onClick={cancelPending}
                    className="text-blue-400 hover:text-blue-600"
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
                    <div className="relative" title={t("tooltips.searchProducts")}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        ref={productSearchRef}
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setIsSearchOpen(true);
                        }}
                        onFocus={() => {
                          if (search) setIsSearchOpen(true);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={t("table.searchProducts")}
                        className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                        autoComplete="off"
                      />
                      {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </PopoverPrimitive.Anchor>
                  <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                      className="w-[var(--radix-popover-trigger-width)] z-50 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95"
                      align="start"
                      sideOffset={4}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="max-h-[260px] overflow-y-auto">
                        {flatVariants.length === 0 && !isLoading ? (
                          <div className="py-5 text-center">
                            <p className="text-sm text-slate-400 mb-3 ml-2">No products found</p>
                            {billType === "OLD" && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-[90%] mx-auto h-9 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 font-bold"
                                onClick={addManualItem}
                              >
                                + Add "{search}" as manual entry
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            {flatVariants.map((item, idx) => (
                              <button
                                key={item.variant.id}
                                type="button"
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                                  idx === highlightedIndex
                                    ? "bg-blue-50 text-blue-900"
                                    : "text-slate-700 hover:bg-slate-50",
                                )}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectProduct(item.product, item.variant);
                                }}
                              >
                                <span className="font-mono text-xs text-slate-400 w-24 shrink-0 truncate">
                                  {item.variant.sku}
                                </span>
                                <span className="font-medium truncate flex-1">
                                  {item.product.name}
                                </span>
                                <span className="text-sm text-slate-500 font-mono shrink-0">
                                  ₹{item.variant.sellingPrice}
                                </span>
                              </button>
                            ))}
                            {billType === "OLD" && (
                              <button
                                type="button"
                                className="w-full text-center py-2 text-xs font-bold text-blue-600 bg-slate-50 hover:bg-blue-50 border-t"
                                onClick={addManualItem}
                              >
                                + Add "{search}" as manual entry
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <div className="border-t px-4 py-1.5 text-xs text-slate-400">
                        ↑↓ navigate &middot; Enter select &middot; Esc close
                      </div>
                    </PopoverPrimitive.Content>
                  </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr>
                <th className="w-12 px-3 py-2.5 text-xs font-bold text-slate-500 text-center">
                  {t("table.sr")}
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-slate-500 text-left">
                  {t("table.product")}
                </th>
                <th className="w-24 px-3 py-2.5 text-xs font-bold text-slate-500 text-center">
                  {t("table.qty")}
                </th>
                <th className="w-28 px-3 py-2.5 text-xs font-bold text-slate-500 text-center">
                  {t("table.rate")}
                </th>
                {isNO1 && (
                  <th className="w-16 px-3 py-2.5 text-xs font-bold text-slate-500 text-center">
                    {t("table.gst")}
                  </th>
                )}
                {!isGlobalDiscount && (
                  <th className="w-24 px-3 py-2.5 text-xs font-bold text-slate-500 text-center">
                    {t("table.discount")}
                  </th>
                )}
                <th className="w-28 px-3 py-2.5 text-xs font-bold text-slate-500 text-right">
                  {t("table.amount")}
                </th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      isNO1
                        ? isGlobalDiscount
                          ? 6
                          : 7
                        : isGlobalDiscount
                          ? 5
                          : 6
                    }
                    className="text-center py-20"
                  >
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Package className="h-12 w-12" />
                      <p className="text-base font-medium">
                        {t("table.emptyTitle")}
                      </p>
                      <p className="text-sm">{t("table.emptyHint")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="group border-b border-slate-100 h-11 hover:bg-slate-50/50"
                  >
                    <td className="px-3 text-center text-sm text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        {billType === "OLD" ? (
                          <Input
                            value={form.watch(`items.${index}.itemDescription`) || form.watch(`items.${index}.description`) || ""}
                            onChange={(e) => {
                              form.setValue(`items.${index}.itemDescription`, e.target.value);
                              form.setValue(`items.${index}.description`, e.target.value);
                            }}
                            disabled={isPosted}
                            className="h-8 text-sm font-medium border-slate-200 focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {form.watch(`items.${index}.description`) ||
                              form.watch(`items.${index}.productName`) ||
                              "—"}
                          </span>
                        )}
                        {isNO1 && form.watch(`items.${index}.hsnCode`) && (
                          <span className="text-xs font-mono text-slate-400 shrink-0">
                            {form.watch(`items.${index}.hsnCode`)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2">
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        value={form.watch(`items.${index}.quantity`) || ""}
                        onChange={(e) =>
                          handleInlineQtyChange(index, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (["-", "+", ".", "e", "E"].includes(e.key))
                            e.preventDefault();
                        }}
                        disabled={isPosted}
                        title={t("tooltips.quantity")}
                        className="h-8 text-sm font-mono text-center px-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.watch(`items.${index}.rate`) || ""}
                        onChange={(e) =>
                          handleInlineRateChange(index, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E"].includes(e.key))
                            e.preventDefault();
                        }}
                        disabled={isPosted}
                        title={t("tooltips.rate")}
                        className="h-8 text-sm font-mono text-right px-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {isNO1 && (
                      <td className="px-2 text-center">
                        <span className="text-sm font-mono text-slate-500">
                          {form.watch(`items.${index}.gstRate`) || 0}%
                        </span>
                      </td>
                    )}
                    {!isGlobalDiscount && (
                      <td className="px-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={
                            form.watch(`items.${index}.discountPercent`) || ""
                          }
                          onChange={(e) =>
                            handleInlineDiscChange(index, e.target.value)
                          }
                          disabled={isPosted}
                          title={t("tooltips.discountPercent")}
                          className="h-8 text-sm font-mono text-center px-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-3 text-right">
                      <span className="text-sm font-mono font-bold text-slate-900">
                        ₹{getLineTotal(index).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-2">
                      {!isPosted && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-1.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-50 transition-opacity"
                                tabIndex={-1}
                              />
                            }
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {t("tooltips.deleteRow")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
