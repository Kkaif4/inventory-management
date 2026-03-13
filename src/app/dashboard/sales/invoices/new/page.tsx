"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Save,
  Info,
  Trash2,
  Search,
  Package,
  Warehouse,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { getParties } from "@/actions/parties";
import { getProducts } from "@/actions/products";
import { getCurrentStock, getInventoryLocations } from "@/actions/inventory";
import { InventoryFilter, StockStatus } from "@/actions/inventory/types";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import { roundToTwo } from "@/lib/utils";
import { useOutletStore } from "@/store/use-outlet-store";
import { Button } from "@/components/ui/button";
import {
  InvoiceFormValues,
  invoiceSchema,
} from "@/validations/invoice.validation";

export default function NewSalesInvoicePage() {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();

  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<
    {
      id: string;
      name: string;
      negativeStockPolicy: string;
      warehouses: { id: string }[];
    }[]
  >([]);
  const [stockLevels, setStockLevels] = useState<
    {
      variantId: string;
      quantity: number;
      warehouseId?: string | null;
      outletId?: string | null;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentOutletId) return;

  useEffect(() => {
    if (currentOutletId) {
      setValue("fromOutletId", currentOutletId);
    }
  }, [currentOutletId]);

  useEffect(() => {
    getParties(currentOutletId).then((data) =>
      setParties(data.filter((p) => p.type === "CUSTOMER")),
    );
    getProducts(currentOutletId).then(setProducts);
    getInventoryLocations(currentOutletId).then((data) =>
      setOutlets(data.outlets),
    );
    if (currentOutletId) {
      getCurrentStock(currentOutletId).then(setStockLevels);
    }
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      date: new Date(),
      freightCost: 0,
      items: [
        {
          variantId: "",
          quantity: 1,
          unit: "BASE",
          rate: 0,
          gstRate: 18,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchItems = watch("items");
  const watchFreight = watch("freightCost") || 0;
  const watchOutletId = watch("fromOutletId");
  const selectedOutlet = outlets.find((o) => o.id === watchOutletId);
  const primaryWarehouseId = selectedOutlet?.warehouses[0]?.id;

  const calculateRow = (index: number) => {
    const item = getValues(`items.${index}`);
    if (!item) return;

    const variant = products
      .flatMap((p) => p.variants)
      .find((v) => v.id === item.variantId);
    const product = products.find((p) =>
      p.variants.some((v: any) => v.id === item.variantId),
    );

    if (!variant || !product) return;

    const conversionRatio = product.conversionRatio || 1;
    const baseQuantity =
      item.unit === "SALES" ? item.quantity * conversionRatio : item.quantity;

    const taxable = roundToTwo(item.quantity * item.rate);
    const gstTotal = roundToTwo((taxable * item.gstRate) / 100);

    const customer = parties.find((p) => p.id === getValues("partyId"));
    const isInterState = customer && customer.state !== "Maharashtra";

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = gstTotal;
    } else {
      cgst = roundToTwo(gstTotal / 2);
      sgst = roundToTwo(gstTotal / 2);
    }

    setValue(`items.${index}.taxableValue`, taxable);
    setValue(`items.${index}.cgst`, cgst);
    setValue(`items.${index}.sgst`, sgst);
    setValue(`items.${index}.igst`, igst);
  };

  const getAvailableStock = (variantId: string) => {
    const stock = stockLevels.find(
      (s) =>
        s.variantId === variantId &&
        (primaryWarehouseId
          ? s.warehouseId === primaryWarehouseId
          : s.outletId === watchOutletId),
    );
    return stock?.quantity || 0;
  };

  const getStockStatus = (index: number) => {
    const item = watchItems[index];
    if (!item?.variantId || !watchOutletId)
      return { isNegative: false, available: 0, requestedBase: 0 };

    const product = products.find((p) =>
      p.variants.some((v: any) => v.id === item.variantId),
    );
    if (!product) return { isNegative: false, available: 0, requestedBase: 0 };

    const conversionRatio = product.conversionRatio || 1;
    const requestedBase =
      item.unit === "SALES" ? item.quantity * conversionRatio : item.quantity;
    const available = getAvailableStock(item.variantId);

    return {
      isNegative: requestedBase > available,
      available,
      requestedBase,
      baseUnit: product.baseUnit,
    };
  };

  const totals = watchItems.reduce(
    (acc, item) => {
      acc.taxable = roundToTwo(acc.taxable + (item.taxableValue || 0));
      acc.gst = roundToTwo(
        acc.gst + (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0),
      );
      return acc;
    },
    { taxable: 0, gst: 0 } as { taxable: number; gst: number },
  );

  const { data: session } = useSession();

  const onSubmit: SubmitHandler<InvoiceFormValues> = async (data) => {
    try {
      if (!session?.user?.id) throw new Error("Unauthorized");
      setIsSubmitting(true);
      await createSalesInvoice({ ...data, userId: session.user.id });
      router.push("/dashboard/sales/invoices");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create Invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/sales"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Generate Sales Invoice
            </h2>
            <p className="text-slate-500">
              Immediate billing for customer purchases.
            </p>
          </div>
        </div>
      </div>

      {watchItems.some((_, i) => getStockStatus(i).isNegative) &&
        selectedOutlet?.negativeStockPolicy === "WARN" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900">Inventory Warning</h4>
              <p className="text-amber-700 text-sm mt-1">
                One or more items in this invoice have insufficient stock at the
                assigned location (
                <span className="font-bold">
                  {primaryWarehouseId ? "Warehouse" : selectedOutlet.name}
                </span>
                ). Since your policy is set to{" "}
                <span className="font-bold underline uppercase tracking-tighter">
                  Warn and Allow
                </span>
                , you can proceed, but stock levels will become negative.
              </p>
            </div>
          </div>
        )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Sale Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Point of Sale
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Dispatch Outlet*
                  </label>
                  <select
                    {...register("fromOutletId")}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select Outlet...</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} (Policy: {o.negativeStockPolicy})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Invoice Date*
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 mr-3 text-blue-500" />
                  Billing Items
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      variantId: "",
                      quantity: 1,
                      unit: "BASE",
                      rate: 0,
                      gstRate: 18,
                      taxableValue: 0,
                      cgst: 0,
                      sgst: 0,
                      igst: 0,
                    })
                  }
                  className="text-blue-600 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl transition-all"
                >
                  + Add Item
                </button>
              </div>

              <div className="p-8 space-y-6">
                {fields.map((field, index) => {
                  const stockStatus = getStockStatus(index);
                  const isNegative = stockStatus.isNegative;
                  const item = watchItems[index];
                  const product = products.find((p) =>
                    p.variants.some((v: any) => v.id === item?.variantId),
                  );

                  return (
                    <div
                      key={field.id}
                      className={`p-6 rounded-2xl border ${isNegative ? "bg-amber-50/30 border-amber-100" : "bg-slate-50/30 border-slate-100"} space-y-4`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Product
                          </label>
                          <select
                            {...register(`items.${index}.variantId` as const, {
                              onChange: (e) => {
                                const variantId = e.target.value;
                                const currentProducts = products;
                                const variant = currentProducts
                                  .flatMap((p) => p.variants)
                                  .find((v) => v.id === variantId);

                                const parent = currentProducts.find((p) =>
                                  p.variants.some(
                                    (v: any) => v.id === variantId,
                                  ),
                                );

                                if (variant && parent) {
                                  // Automated Pricing Logic
                                  const customerId = getValues("partyId");
                                  const customer = parties.find(
                                    (p) => p.id === customerId,
                                  );
                                  const customPrice =
                                    customer?.priceList?.entries?.find(
                                      (e: any) => e.variantId === variantId,
                                    )?.price;

                                  // sellingPrice is for BASE unit
                                  const baseRate =
                                    customPrice ?? variant.sellingPrice;
                                  const currentUnit = getValues(
                                    `items.${index}.unit`,
                                  );
                                  const rate =
                                    currentUnit === "SALES"
                                      ? baseRate * (parent.conversionRatio || 1)
                                      : baseRate;

                                  setValue(
                                    `items.${index}.rate`,
                                    roundToTwo(rate),
                                  );
                                  setValue(
                                    `items.${index}.gstRate`,
                                    parent.gstRate,
                                  );
                                }
                                calculateRow(index);
                              },
                            })}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm"
                          >
                            <option value="">Search Product...</option>
                            {products.map((p) => (
                              <optgroup key={p.id} label={p.name}>
                                {p.variants.map(
                                  (v: { id: string; sku: string }) => (
                                    <option key={v.id} value={v.id}>
                                      {v.sku} - Stock:{" "}
                                      {watchOutletId
                                        ? getAvailableStock(v.id)
                                        : "(Pick Outlet)"}{" "}
                                      {p.baseUnit}
                                    </option>
                                  ),
                                )}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => remove(index)}
                          className="mt-8 p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="space-y-1 lg:col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.quantity` as const, {
                              onChange: () => calculateRow(index),
                            })}
                            className={`w-full bg-white border-none rounded-xl p-3 text-sm font-black text-center shadow-sm ${isNegative ? "text-amber-600 ring-2 ring-amber-500/20" : "text-slate-900"}`}
                          />
                        </div>
                        <div className="space-y-1 lg:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Unit
                          </label>
                          <select
                            {...register(`items.${index}.unit` as const, {
                              onChange: (e) => {
                                const newUnit = e.target.value;
                                const vId = getValues(
                                  `items.${index}.variantId`,
                                );
                                const variant = products
                                  .flatMap((p) => p.variants)
                                  .find((v) => v.id === vId);
                                const parent = products.find((p) =>
                                  p.variants.some((v: any) => v.id === vId),
                                );

                                if (variant && parent) {
                                  const basePrice = variant.sellingPrice;
                                  const rate =
                                    newUnit === "SALES"
                                      ? basePrice *
                                        (parent.conversionRatio || 1)
                                      : basePrice;
                                  setValue(
                                    `items.${index}.rate`,
                                    roundToTwo(rate),
                                  );
                                }
                                calculateRow(index);
                              },
                            })}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm"
                          >
                            <option value="BASE">
                              {product?.baseUnit || "Base"}
                            </option>
                            {product?.salesUnit && (
                              <option value="SALES">{product.salesUnit}</option>
                            )}
                          </select>
                        </div>
                        <div className="space-y-1 lg:col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.rate` as const, {
                              onChange: () => calculateRow(index),
                            })}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-right shadow-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end space-x-4 pt-2 lg:pt-0">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              Taxable
                            </p>
                            <p className="text-xs font-extrabold text-slate-700">
                              ₹
                              {(watchItems[index]?.taxableValue || 0).toFixed(
                                2,
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              GST
                            </p>
                            <p className="text-xs font-extrabold text-blue-600">
                              ₹
                              {(
                                (watchItems[index]?.cgst || 0) +
                                (watchItems[index]?.sgst || 0) +
                                (watchItems[index]?.igst || 0)
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isNegative && (
                        <div className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit">
                          <Info className="w-3 h-3 mr-1.5" />
                          STOCK OVERDRAW DETECTED: {stockStatus.available}{" "}
                          {stockStatus.baseUnit} AVAILABLE (Requested:{" "}
                          {stockStatus.requestedBase} {stockStatus.baseUnit})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Customer Hub */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <Search className="w-5 h-5 mr-3 text-blue-500" />
                Customer
              </h3>
              <select
                {...register("partyId")}
                onChange={(e) => {
                  const customerId = e.target.value;
                  const customer = parties.find((p) => p.id === customerId);

                  // Refresh all item rates based on new customer's price list
                  watchItems.forEach((item, i) => {
                    if (!item.variantId) return;

                    const variant = products
                      .flatMap((p) => p.variants)
                      .find((v) => v.id === item.variantId);
                    const parent = products.find((p) =>
                      p.variants.some((v: any) => v.id === item.variantId),
                    );

                    if (variant && parent) {
                      const customPrice = customer?.priceList?.entries?.find(
                        (e: any) => e.variantId === item.variantId,
                      )?.price;
                      const baseRate = customPrice ?? variant.sellingPrice;
                      const currentUnit = getValues(`items.${i}.unit`);
                      const rate =
                        currentUnit === "SALES"
                          ? baseRate * (parent.conversionRatio || 1)
                          : baseRate;
                      setValue(`items.${i}.rate`, roundToTwo(rate));
                    }
                    calculateRow(i);
                  });
                }}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select Customer...</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.state}){" "}
                    {p.priceList ? `[${p.priceList.name}]` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Summary */}
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl shadow-slate-200 sticky top-8">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-800 pb-4">
                Order Total
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-black text-white">
                    ₹{" "}
                    {totals.taxable.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium">Taxes (GST)</span>
                  <span className="font-black text-blue-400">
                    ₹{" "}
                    {totals.gst.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium">Freight Cost</span>
                  <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-2 py-1">
                    <span className="text-[10px] font-bold">₹</span>
                    <input
                      type="number"
                      {...register("freightCost")}
                      className="bg-transparent border-none p-0 w-16 text-right text-white font-black focus:ring-0 text-sm"
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">
                    Amount Due
                  </p>
                  <p className="text-5xl font-black text-emerald-400 text-center tracking-tighter">
                    ₹{" "}
                    {(
                      totals.taxable +
                      totals.gst +
                      (Number(watchFreight) || 0)
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (watchItems.some((_, i) => getStockStatus(i).isNegative) &&
                    selectedOutlet?.negativeStockPolicy === "BLOCK")
                }
                className="w-full mt-10 group relative bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Save className="w-6 h-6 mr-3" />
                  {isSubmitting ? "Finalizing..." : "Complete Invoice"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </form>

      {!currentOutletId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Selection Required
              </h3>
              <p className="text-slate-500">
                Please select an active outlet from the switcher in the top
                navigation bar before generating an invoice.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/sales/invoices")}
              variant="outline"
              className="w-full py-6 rounded-2xl font-bold"
            >
              Go Back to Invoices
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
