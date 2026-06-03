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
import { getVariantBatchPrice } from "@/actions/sales/invoice-helpers";
import { toast } from "sonner";
import { getAvailableSerialNumbers } from "@/actions/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface POSInvoiceTableProps {
  form: UseFormReturn<any>;
  fieldArray: UseFieldArrayReturn<any, "items", "id">;
  billType: string;
  fromOutletId: string;
  isPosted: boolean;
  isGlobalDiscount: boolean;
  productSearchRef?: React.RefObject<HTMLInputElement | null>;
  partyId?: string;
}

export function POSInvoiceTable({
  form,
  fieldArray,
  billType,
  fromOutletId,
  isPosted,
  isGlobalDiscount,
  productSearchRef,
  partyId,
}: POSInvoiceTableProps) {
  const t = useTranslations("billing");
  const { fields, append, remove } = fieldArray;
  const isNO1 = billType === "NO1";

  const { search, setSearch, flatVariants, isLoading, clearResults } =
    useProductSearch(fromOutletId, 250, partyId);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [pendingProduct, setPendingProduct] = React.useState<{
    product: any;
    variant: any;
  } | null>(null);
  const [pendingQty, setPendingQty] = React.useState("1");
  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  const [serialPickerIndex, setSerialPickerIndex] = React.useState<number | null>(null);
  const [availableSerials, setAvailableSerials] = React.useState<string[]>([]);
  const [loadingSerials, setLoadingSerials] = React.useState(false);
  const [serialSearch, setSerialSearch] = React.useState("");

  const openSerialPicker = async (index: number) => {
    const item = form.getValues(`items.${index}`);
    if (!item.variantId) return;
    
    setSerialPickerIndex(index);
    setLoadingSerials(true);
    setSerialSearch("");
    try {
      const res = await getAvailableSerialNumbers(fromOutletId, item.variantId);
      if (res.success && res.data) {
        setAvailableSerials(res.data);
      } else {
        toast.error("Failed to load available serial numbers");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSerials(false);
    }
  };

  const addSerial = (sn: string) => {
    if (serialPickerIndex === null) return;
    const current = form.getValues(`items.${serialPickerIndex}.serialNumbers`) || [];
    const limit = Number(form.getValues(`items.${serialPickerIndex}.quantity`));
    
    if (current.length >= limit) {
      toast.error(`Quantity limit reached (${limit}). Remove an existing serial number or increase quantity first.`);
      return;
    }
    
    form.setValue(`items.${serialPickerIndex}.serialNumbers`, [...current, sn]);
  };

  const removeSerial = (sn: string) => {
    if (serialPickerIndex === null) return;
    const current = form.getValues(`items.${serialPickerIndex}.serialNumbers`) || [];
    form.setValue(
      `items.${serialPickerIndex}.serialNumbers`,
      current.filter((s: string) => s !== sn)
    );
  };

  const handleSerialScan = (searchVal: string) => {
    const val = searchVal.trim();
    if (!val) return;
    
    const isAvailable = availableSerials.some((s) => s.toLowerCase() === val.toLowerCase());
    
    if (!isAvailable) {
      toast.error(`Serial number "${val}" is not available in stock.`);
      return;
    }
    
    const exactSn = availableSerials.find((s) => s.toLowerCase() === val.toLowerCase())!;
    addSerial(exactSn);
    setSerialSearch("");
  };

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [flatVariants]);

  const selectProduct = async (product: any, variant: any) => {
    if (variant.matchedSerialNumber) {
      let rate = variant.customerPrice ?? variant.sellingPrice ?? 0;
      try {
        const priceResult = await getVariantBatchPrice(
          variant.id,
          product.warehouseId || fromOutletId,
          fromOutletId,
          partyId,
        );
        if (priceResult.success && priceResult.data) {
          rate = (priceResult.data as any).price || rate;
        }
      } catch (error) {
        console.warn("Failed to fetch batch price, using standard price:", error);
      }

      const existingItems = form.getValues("items") || [];
      const existingIndex = existingItems.findIndex((i: any) => i.variantId === variant.id);
      
      if (existingIndex !== -1) {
        const currentSns = form.getValues(`items.${existingIndex}.serialNumbers`) || [];
        if (currentSns.includes(variant.matchedSerialNumber)) {
          toast.warning(`Serial number ${variant.matchedSerialNumber} is already added to this invoice.`);
        } else {
          const newQty = Number(form.getValues(`items.${existingIndex}.quantity`)) + 1;
          form.setValue(`items.${existingIndex}.quantity`, newQty);
          form.setValue(`items.${existingIndex}.serialNumbers`, [...currentSns, variant.matchedSerialNumber]);
          toast.success(`Appended serial number: ${variant.matchedSerialNumber}`);
        }
      } else {
        append({
          variantId: variant.id,
          productName: product.name,
          description: product.name,
          quantity: 1,
          unit: "BASE",
          rate,
          discountPercent: 0,
          gstRate: isNO1 ? product.gstRate || 0 : 0,
          hsnCode: variant.sku || product.sku || "",
          taxableValue: 0,
          lineTotal: 0,
          hasSerialNumbers: product.hasSerialNumbers,
          serialNumbers: [variant.matchedSerialNumber],
        });
        toast.success(`Scanned & added serial number: ${variant.matchedSerialNumber}`);
      }
      clearResults();
      setIsSearchOpen(false);
      setTimeout(() => productSearchRef?.current?.focus(), 50);
      return;
    }

    setPendingProduct({ product, variant });
    setPendingQty("1");
    clearResults();
    setIsSearchOpen(false);
    setTimeout(() => qtyInputRef.current?.focus(), 50);
  };

  const confirmAddItem = async () => {
    if (!pendingProduct || !fromOutletId) return;
    const qty = parseInt(pendingQty, 10) || 1;
    const { product, variant } = pendingProduct;

    // Get batch price if FIFO is enabled, fallback to customer/standard price
    let rate = variant.customerPrice ?? variant.sellingPrice ?? 0;
    try {
      const priceResult = await getVariantBatchPrice(
        variant.id,
        product.warehouseId || fromOutletId,
        fromOutletId,
        partyId,
      );
      if (priceResult.success && priceResult.data) {
        rate = (priceResult.data as any).price || rate;
      }
    } catch (error) {
      // Fallback to standard price on error
      console.warn("Failed to fetch batch price, using standard price:", error);
    }

    append({
      variantId: variant.id,
      productName: product.name,
      description: product.name,
      quantity: qty,
      unit: "BASE",
      rate,
      discountPercent: 0,
      gstRate: isNO1 ? product.gstRate || 0 : 0,
      hsnCode: variant.sku || product.sku || "",
      taxableValue: 0,
      lineTotal: 0,
      hasSerialNumbers: product.hasSerialNumbers,
      serialNumbers: [],
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
                                <div className="truncate flex-1">
                                  <div className="font-medium truncate">
                                    {item.product.name}
                                  </div>
                                  {item.product.brand && (
                                    <div className="text-xs text-slate-400 truncate">
                                      {item.product.brand}
                                    </div>
                                  )}
                                </div>
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
                    <td className="px-3 py-1">
                      <div className="flex flex-col">
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
                        {form.watch(`items.${index}.hasSerialNumbers`) && (
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-6 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm transition-colors",
                                (form.watch(`items.${index}.serialNumbers`) || []).length === Number(form.watch(`items.${index}.quantity`))
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              )}
                              onClick={() => openSerialPicker(index)}
                            >
                              Serials ({(form.watch(`items.${index}.serialNumbers`) || []).length}/{Number(form.watch(`items.${index}.quantity`))})
                            </Button>
                            {(form.watch(`items.${index}.serialNumbers`) || []).length > 0 && (
                              <span className="text-[10px] text-slate-400 truncate max-w-xs font-mono">
                                {(form.watch(`items.${index}.serialNumbers`) || []).join(", ")}
                              </span>
                            )}
                          </div>
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

      {/* Serial Number Picker Dialog */}
      <Dialog
        open={serialPickerIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSerialPickerIndex(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-indigo-600" />
              Select Serial Numbers
            </DialogTitle>
          </DialogHeader>
          
          {serialPickerIndex !== null && (
            <div className="space-y-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {form.getValues(`items.${serialPickerIndex}.productName`)}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  SKU: {form.getValues(`items.${serialPickerIndex}.hsnCode`)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-500">
                  Scan / Type Serial Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Scan barcode or type serial..."
                    value={serialSearch}
                    onChange={(e) => setSerialSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSerialScan(serialSearch);
                      }
                    }}
                    className="h-9"
                  />
                  <Button
                    type="button"
                    onClick={() => handleSerialScan(serialSearch)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 h-9 font-bold"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Selected List */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-500 block">
                  Selected ({ (form.watch(`items.${serialPickerIndex}.serialNumbers`) || []).length } / { Number(form.watch(`items.${serialPickerIndex}.quantity`)) })
                </Label>
                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-slate-50 border rounded-lg max-h-[100px] overflow-y-auto">
                  {((form.watch(`items.${serialPickerIndex}.serialNumbers`) || []) as string[]).length === 0 ? (
                    <span className="text-xs text-slate-400 italic m-auto">No serial numbers selected yet.</span>
                  ) : (
                    ((form.watch(`items.${serialPickerIndex}.serialNumbers`) || []) as string[]).map((sn) => (
                      <span
                        key={sn}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-semibold"
                      >
                        {sn}
                        <button
                          type="button"
                          onClick={() => removeSerial(sn)}
                          className="text-indigo-400 hover:text-indigo-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Available Stock */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-slate-500 block">
                  Available in Stock
                </Label>
                {loadingSerials ? (
                  <p className="text-xs text-slate-400 italic py-2">Loading stock...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[150px] overflow-y-auto border rounded-lg p-2 bg-white">
                    {availableSerials
                      .filter((sn) => 
                        sn.toLowerCase().includes(serialSearch.toLowerCase()) &&
                        !((form.watch(`items.${serialPickerIndex}.serialNumbers`) || []) as string[]).includes(sn)
                      )
                      .slice(0, 20) // Show top 20
                      .map((sn) => (
                        <button
                          key={sn}
                          type="button"
                          onClick={() => addSerial(sn)}
                          className="text-left px-2 py-1 text-xs font-mono text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded transition-colors"
                        >
                          + {sn}
                        </button>
                      ))}
                    {availableSerials.filter((sn) => 
                      sn.toLowerCase().includes(serialSearch.toLowerCase()) &&
                      !((form.watch(`items.${serialPickerIndex}.serialNumbers`) || []) as string[]).includes(sn)
                    ).length === 0 && (
                      <span className="col-span-2 text-xs text-slate-400 italic text-center py-2">
                        No matches in stock
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setSerialPickerIndex(null)}
              className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-6 font-bold"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
