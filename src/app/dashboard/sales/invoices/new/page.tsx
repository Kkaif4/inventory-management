"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Save,
  Info,
  Trash2,
  Search,
  Package,
  Receipt,
  FileText,
  Warehouse,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getParties } from "@/actions/parties";
import { getProducts } from "@/actions/products";
import { getCurrentStock, getInventoryLocations } from "@/actions/inventory";
import { createSalesInvoice } from "@/actions/sales/sales-invoice";
import {
  getQuotationById,
  convertQuotationToInvoice,
} from "@/actions/sales/quotation";
import { roundToTwo } from "@/lib/utils";
import { useOutletStore } from "@/store/use-outlet-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  InvoiceFormValues,
  invoiceSchema,
} from "@/validations/invoice.validation";

function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");
  const partyIdFromUrl = searchParams.get("partyId");
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();

  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [currentOutlet, setCurrentOutlet] = useState<{
    id: string;
    name: string;
    state: string | null;
    allowRawCashBills: boolean;
    negativeStockPolicy: string;
  } | null>(null);
  const [otherOutlets, setOtherOutlets] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<
    {
      variantId: string;
      quantity: number;
      warehouseId?: string | null;
      outletId?: string | null;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      billType: "NO1",
      date: new Date(),
      freightCost: 0,
      items: [
        {
          variantId: "",
          quantity: 1,
          unit: "BASE",
          rate: 0,
          discountPercent: 0,
          gstRate: 18,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          hsnCode: "",
        },
      ],
      partyId: partyIdFromUrl || "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchItems = watch("items");
  const watchFreight = watch("freightCost") || 0;
  const watchOutletId = watch("fromOutletId");
  const watchBillType = watch("billType");
  const watchPartyId = watch("partyId" as any);

  const primaryWarehouseId = null; // We'll simplify for now or fetch if needed

  useEffect(() => {
    if (currentOutletId) {
      setValue("fromOutletId", currentOutletId);
      loadInventoryData(currentOutletId).then(() => {
        if (quoteId) {
          loadQuotation(quoteId, currentOutletId);
        }
      });
    }
  }, [currentOutletId, quoteId]);

  const loadQuotation = async (id: string, outletId: string) => {
    try {
      const res = await getQuotationById(id, outletId);
      if (!res.success) {
        toast.error("Failed to load quotation: " + res.error?.message);
        return;
      }
      const quote = res.data;
      if (!quote) return;

      setValue("partyId" as any, quote.partyId || "");
      setValue("billType", "NO1");

      const items = quote.items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unit: item.unit || "BASE",
        rate: item.rate,
        discountPercent: 0,
        gstRate: item.variant.product.gstRate,
        taxableValue: item.taxableValue,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        hsnCode: item.variant.product.sku, // Defaulting SKU as HSN if missing
      }));

      setValue("items", items as any);
      toast.success("Quotation details imported");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load quotation");
    }
  };

  const loadInventoryData = async (outletId: string) => {
    try {
      const [partyRes, productRes, locationRes, stockRes] = await Promise.all([
        getParties(outletId),
        getProducts(outletId),
        getInventoryLocations(outletId),
        getCurrentStock(outletId),
      ]);

      if (!partyRes.success) throw new Error(partyRes.error?.message);
      if (!productRes.success) throw new Error(productRes.error?.message);
      if (!locationRes.success) throw new Error(locationRes.error?.message);
      if (!stockRes.success) throw new Error(stockRes.error?.message);

      setParties(partyRes.data!.filter((p: any) => p.type === "CUSTOMER"));
      setProducts(productRes.data!);
      setCurrentOutlet(locationRes.data!.currentOutlet);
      setOtherOutlets(locationRes.data!.outlets);
      setStockLevels(stockRes.data!);
    } catch (error: any) {
      toast.error("Initialization failed: " + error.message);
    }
  };

  const calculateRow = (index: number) => {
    const item = getValues(`items.${index}` as any);
    if (!item || !item.variantId) return;

    if (watchBillType === "NO2") {
      const taxable = roundToTwo(item.quantity * item.rate);
      setValue(`items.${index}.taxableValue` as any, taxable);
      setValue(`items.${index}.cgst` as any, 0);
      setValue(`items.${index}.sgst` as any, 0);
      setValue(`items.${index}.igst` as any, 0);
      return;
    }

    // NO1 Logic
    const discountAmount = roundToTwo(
      (item.quantity * item.rate * (item.discountPercent || 0)) / 100,
    );
    const taxable = roundToTwo(item.quantity * item.rate - discountAmount);
    const gstTotal = roundToTwo((taxable * (item.gstRate || 0)) / 100);

    const customer = parties.find((p) => p.id === watchPartyId);
    const isInterState =
      customer &&
      currentOutlet?.state &&
      customer.state !== currentOutlet.state;

    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (isInterState) {
      igst = gstTotal;
    } else {
      cgst = roundToTwo(gstTotal / 2);
      sgst = roundToTwo(gstTotal / 2);
    }

    setValue(`items.${index}.taxableValue` as any, taxable);
    setValue(`items.${index}.cgst` as any, cgst);
    setValue(`items.${index}.sgst` as any, sgst);
    setValue(`items.${index}.igst` as any, igst);
  };

  const getAvailableStock = (variantId: string) => {
    const stock = stockLevels.find(
      (s) => s.variantId === variantId && s.outletId === watchOutletId,
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
    (acc, item: any) => {
      acc.taxable = roundToTwo(acc.taxable + (item.taxableValue || 0));
      acc.gst = roundToTwo(
        acc.gst + (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0),
      );
      return acc;
    },
    { taxable: 0, gst: 0 } as { taxable: number; gst: number },
  );

  const onSubmit: SubmitHandler<InvoiceFormValues> = async (data) => {
    try {
      if (!session?.user?.id) throw new Error("Unauthorized");
      setIsSubmitting(true);
      const res = await createSalesInvoice({
        ...data,
        userId: session.user.id,
      } as any);

      if (!res.success) {
        throw new Error(res.error?.message || "Failed to create Invoice");
      }

      if (quoteId) {
        await convertQuotationToInvoice(quoteId, session.user.id);
      }

      toast.success(
        data.billType === "NO1" ? "Invoice created" : "Cash Bill posted",
      );
      router.push("/dashboard/sales/transactions");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create Invoice",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOutletId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <Warehouse className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Assign Outlet</h2>
          <p className="text-slate-500 text-sm">
            Please select an active outlet from the navigation bar.
          </p>
          <Button
            onClick={() => router.push("/dashboard/sales")}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/sales/transactions"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Generate Sales Invoice
            </h2>
            <p className="text-slate-500">Retail & B2B Billing Terminal.</p>
          </div>
        </div>
      </div>

      {currentOutlet?.allowRawCashBills && (
        <div className="bg-white p-2 rounded-2xl border border-slate-200 w-fit">
          <Tabs
            value={watchBillType}
            onValueChange={(v) => {
              reset({
                ...getValues(),
                billType: v as any,
                partyId: v === "NO2" ? undefined : "",
              } as any);
            }}
          >
            <TabsList className="bg-transparent h-12 gap-1">
              <TabsTrigger
                value="NO1"
                className="rounded-xl px-6 h-10 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-lg shadow-brand/20 transition-all font-black"
              >
                <Receipt className="w-4 h-4 mr-2" />
                NO. 1 LEGAL BILL
              </TabsTrigger>
              <TabsTrigger
                value="NO2"
                className="rounded-xl px-6 h-10 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-amber-500/20 transition-all font-black"
              >
                <FileText className="w-4 h-4 mr-2" />
                NO. 2 RAW/CASH BILL
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {watchBillType === "NO2" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <Info className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900">Informal Billing Mode</h4>
            <p className="text-amber-700 text-sm mt-1">
              Inventory only update. No Ledger/GST impact. Direct Post only.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Dispatch Location
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    From Outlet*
                  </label>
                  <select
                    {...register("fromOutletId")}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value={currentOutlet?.id}>
                      {currentOutlet?.name}
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Invoice Date*
                  </label>
                  <input
                    type="date"
                    value={(watch("date") as Date).toISOString().split("T")[0]}
                    onChange={(e) => setValue("date", new Date(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 mr-3 text-blue-500" />
                  Cart Items
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      variantId: "",
                      quantity: 1,
                      unit: "BASE",
                      rate: 0,
                      discountPercent: 0,
                      gstRate: 0,
                      taxableValue: 0,
                      cgst: 0,
                      sgst: 0,
                      igst: 0,
                      hsnCode: "",
                    } as any)
                  }
                  className="text-blue-600 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl transition-all"
                >
                  + Add Line
                </button>
              </div>

              <div className="p-8 space-y-6">
                {fields.map((field, index) => {
                  const stockStatus = getStockStatus(index);
                  const isNegative = stockStatus.isNegative;
                  const item = watchItems[index];
                  const itemProduct = products.find((p) =>
                    p.variants.some((v: any) => v.id === item?.variantId)
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
                                const variant = products
                                  .flatMap((p) => p.variants)
                                  .find((v) => v.id === variantId);
                                const parent = products.find((p) =>
                                  p.variants.some(
                                    (v: any) => v.id === variantId,
                                  ),
                                );
                                if (variant && parent) {
                                  const customer = parties.find(
                                    (p) => p.id === watchPartyId,
                                  );
                                  const customPrice =
                                    customer?.priceList?.entries?.find(
                                      (e: any) => e.variantId === variantId,
                                    )?.price;

                                  const baseRate =
                                    customPrice ?? variant.sellingPrice;
                                  setValue(
                                    `items.${index}.rate` as any,
                                    roundToTwo(baseRate),
                                  );
                                  setValue(
                                    `items.${index}.gstRate` as any,
                                    parent.gstRate || 0,
                                  );
                                  setValue(
                                    `items.${index}.hsnCode` as any,
                                    variant.sku || "",
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
                                {p.variants.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.sku} - {p.name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-8 p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Qty {itemProduct?.baseUnit ? `(${itemProduct.baseUnit})` : ""}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.quantity` as any, {
                              valueAsNumber: true,
                              onChange: () => calculateRow(index),
                            })}
                            className={`w-full bg-white border-none rounded-xl p-3 text-sm font-black text-center shadow-sm ${isNegative ? "text-amber-600 ring-2 ring-amber-500/20" : "text-slate-900"}`}
                          />
                          <p
                            className={`text-[9px] font-bold text-center mt-1 ${isNegative ? "text-amber-500" : "text-slate-400"}`}
                          >
                            STK: {stockStatus.available} {stockStatus.baseUnit}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                            Rate (₹)
                          </label>
                          <input
                            type="number"
                            {...register(`items.${index}.rate` as any, {
                              valueAsNumber: true,
                              onChange: () => calculateRow(index),
                            })}
                            className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-right shadow-sm"
                          />
                        </div>

                        {watchBillType === "NO1" && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Disc %
                              </label>
                              <input
                                type="number"
                                {...register(
                                  `items.${index}.discountPercent` as any,
                                  {
                                    valueAsNumber: true,
                                    onChange: () => calculateRow(index),
                                  },
                                )}
                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-center shadow-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                GST %
                              </label>
                              <input
                                type="number"
                                {...register(`items.${index}.gstRate` as any, {
                                  valueAsNumber: true,
                                  onChange: () => calculateRow(index),
                                })}
                                className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-center shadow-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                HSN
                              </label>
                              <input
                                type="text"
                                {...register(`items.${index}.hsnCode` as any)}
                                className="w-full bg-slate-100 border-none rounded-xl p-3 text-[10px] font-bold text-slate-500 uppercase text-center shadow-inner"
                              />
                            </div>
                          </>
                        )}

                        <div
                          className={`flex flex-col justify-center items-end ${watchBillType === "NO1" ? "col-span-1" : "col-span-4"}`}
                        >
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {watchBillType === "NO1"
                              ? "Value (Excl)"
                              : "Net Total"}
                          </p>
                          <p className="text-sm font-black text-slate-800">
                            ₹
                            {(
                              watchItems[index]?.taxableValue || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center">
                  {watchBillType === "NO2" ? (
                    <User className="w-5 h-5 mr-3 text-amber-500" />
                  ) : (
                    <Search className="w-5 h-5 mr-3 text-blue-500" />
                  )}
                  {watchBillType === "NO2"
                    ? "Retail Buyer"
                    : "Customer Contract"}
                </span>

                {watchBillType === "NO1" && watchPartyId && (
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      parties.find((p) => p.id === watchPartyId)?.state !==
                      currentOutlet?.state
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {parties.find((p) => p.id === watchPartyId)?.state !==
                    currentOutlet?.state
                      ? "Inter-state (IGST)"
                      : "Intra-state (CGST+SGST)"}
                  </div>
                )}
              </h3>

              {watchBillType === "NO1" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <select
                      {...register("partyId" as any, {
                        onChange: () =>
                          fields.forEach((_, i) => calculateRow(i)),
                      })}
                      className={`w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 ${(errors as any).partyId ? "ring-2 ring-red-500" : ""}`}
                    >
                      <option value="">Search Customer...</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {(errors as any).partyId && (
                      <p className="text-red-500 text-xs font-bold pl-2">
                        {(errors as any).partyId.message}
                      </p>
                    )}
                  </div>

                  {watchPartyId && (
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                      {(() => {
                        const party = parties.find(
                          (p) => p.id === watchPartyId,
                        );
                        if (!party?.creditLimit)
                          return (
                            <p className="text-[10px] font-bold text-slate-400 text-center">
                              No Credit Limit Set
                            </p>
                          );

                        const limit = party.creditLimit;
                        const currentBalance = party.currentBalance || 0;
                        const projectedBalance =
                          currentBalance +
                          (totals.taxable +
                            totals.gst +
                            (Number(watchFreight) || 0));
                        const percentage = Math.min(
                          100,
                          (projectedBalance / limit) * 100,
                        );
                        const isOver = projectedBalance > limit;

                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <p className="text-[10px] font-black uppercase text-slate-500">
                                Credit Limit
                              </p>
                              <p
                                className={`text-xs font-black ${isOver ? "text-red-600" : "text-slate-900"}`}
                              >
                                ₹{projectedBalance.toLocaleString()} / ₹
                                {limit.toLocaleString()}
                              </p>
                            </div>
                            <Progress
                              value={percentage}
                              className={`h-2 ${isOver ? "bg-red-100 [&>div]:bg-red-500" : "bg-slate-200 [&>div]:bg-blue-500"}`}
                            />
                            {isOver && (
                              <p className="text-[9px] font-bold text-red-500 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Limit
                                Exceeded
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    {...register("buyerName" as any)}
                    placeholder="Customer Name (Optional)"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input
                    type="text"
                    {...register("buyerPhone" as any)}
                    placeholder="Contact Number (Optional)"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}
            </div>

            <div
              className={`bg-slate-900 p-8 rounded-3xl text-white shadow-2xl sticky top-8 border-t-4 ${watchBillType === "NO1" ? "border-brand" : "border-amber-500"}`}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-500">
                  Total
                </h3>
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase">
                  {watchBillType}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">
                    Items Total
                  </span>
                  <span className="font-bold">
                    ₹ {totals.taxable.toLocaleString()}
                  </span>
                </div>
                {watchBillType === "NO1" && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">
                      Total GST
                    </span>
                    <span className="font-bold text-blue-400">
                      ₹ {totals.gst.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Freight</span>
                  <input
                    type="number"
                    {...register("freightCost", { valueAsNumber: true })}
                    className="w-24 bg-white/5 border-none rounded-lg p-2 text-right font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="pt-8 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-2 text-center">
                    Grand Total
                  </p>
                  <p
                    className={`text-4xl font-black text-center tracking-tighter ${watchBillType === "NO1" ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    ₹{" "}
                    {Math.round(
                      totals.taxable + totals.gst + (Number(watchFreight) || 0),
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (watchItems.some((_, i) => getStockStatus(i).isNegative) &&
                      currentOutlet?.negativeStockPolicy === "BLOCK")
                  }
                  className={`w-full py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
                    watchBillType === "NO1"
                      ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                      : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  }`}
                >
                  {isSubmitting
                    ? "Finalizing..."
                    : watchBillType === "NO1"
                      ? "Post Invoice"
                      : "Post Cash Bill"}
                </button>

                {watchBillType === "NO1" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white h-12"
                  >
                    Save Draft
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewSalesInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
        </div>
      }
    >
      <InvoiceForm />
    </Suspense>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
