"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { z } from "zod";
import { peekNextInvoiceNumber } from "@/actions/sales/invoice-form-handler";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSection, FormGrid } from "@/components/ui/form-layout";
import { InvoiceSummaryPanel } from "@/components/sales/invoice-summary-panel";
import { cn } from "@/lib/utils";
import { invoiceSchema } from "@/validations/invoice.validation";
import { ProductSelect } from "@/components/form/product-select";
import { CustomerSelect } from "@/components/form/customer-select";
import { DiscountInput } from "@/components/form/discount-input";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceFormProps {
  mode: "create" | "edit";
  invoice?: any;
  outlets: any[];
  onSubmit?: (data: any) => Promise<{ success: boolean; error?: any }>;
  onSaveDraft?: (data: any) => Promise<{ success: boolean; error?: any }>;
}

export function InvoiceForm({
  mode,
  invoice,
  outlets,
  onSubmit: onSubmitProp,
}: InvoiceFormProps) {
  type FormValues = z.infer<typeof invoiceSchema>;

  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [invoiceNumber, setInvoiceNumber] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: (invoice
      ? {
          billType: invoice.billType || "NO1",
          date: invoice.date ? new Date(invoice.date) : new Date(),
          fromOutletId: invoice.outletId || "",
          partyId: invoice.partyId || "",
          buyerName: invoice.buyerName || "",
          buyerPhone: invoice.buyerPhone || "",
          items: invoice.items || [],
          headerDiscount: invoice.headerDiscount || 0,
          freightCost: invoice.freightCost || 0,
          remarks: invoice.remarks || "",
        }
      : {
          billType: "NO1",
          date: new Date(),
          fromOutletId: "",
          partyId: "",
          buyerName: "",
          buyerPhone: "",
          items: [],
          headerDiscount: 0,
          freightCost: 0,
          remarks: "",
        }) as any,
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const billType = form.watch("billType");
  const fromOutletId = form.watch("fromOutletId");
  const items = form.watch("items") || [];
  const headerDiscount = form.watch("headerDiscount");
  const freightCost = form.watch("freightCost");

  // Load next invoice number when outlet or bill type changes
  React.useEffect(() => {
    if (!fromOutletId) return;

    const loadNextNumber = async () => {
      const res = await peekNextInvoiceNumber(
        fromOutletId,
        billType as "NO1" | "NO2",
      );
      console.log("Peek next invoice number response:", res);
      if (res.success && res.data) {
        setInvoiceNumber(res.data);
      }
    };

    loadNextNumber();
  }, [fromOutletId, billType]);

  console.log("Next invoice number:", invoiceNumber);
  // Calculate totals
  const itemsTotal = items.reduce(
    (sum, item) => sum + (item?.quantity || 0) * (item?.rate || 0),
    0,
  );
  const lineDiscounts = items.reduce(
    (sum, item) =>
      sum +
      ((item?.quantity || 0) *
        (item?.rate || 0) *
        ((item as any)?.discountPercent || 0)) /
        100,
    0,
  );
  const subtotalBeforeHeaderDiscount = itemsTotal - lineDiscounts;
  const headerDiscountAmount =
    (subtotalBeforeHeaderDiscount * (headerDiscount || 0)) / 100;
  const subtotal = subtotalBeforeHeaderDiscount - headerDiscountAmount;
  const totalTax = items.reduce((sum, item) => {
    const tax =
      ((item?.quantity || 0) *
        (item?.rate || 0) *
        ((item as any)?.gstRate || 0)) /
      100;
    return sum + tax;
  }, 0);
  const grandTotal = subtotal + totalTax + (freightCost || 0);

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Discard and leave?")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleValidationClick = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error?.message}`)
        .join(", ");
      console.error("❌ Validation errors:", errorMessages);
      toast.error("Please fix validation errors before submitting");
    } else {
      form.handleSubmit(handleFormSubmit)();
    }
  };

  const handleFormSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      if (!onSubmitProp) {
        toast.error("Form handler not configured");
        return;
      }

      const res = await onSubmitProp(data as any);
      if (res.success) {
        toast.success(
          mode === "create" ? "Invoice posted successfully" : "Invoice updated",
        );
        router.push("/dashboard/sales/invoices");
      } else {
        console.error("❌ Invoice submission failed:", res.error);
        toast.error("Failed: " + res.error?.message);
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPosted = invoice?.status === "POSTED";

  const dateValue =
    form.watch("date") instanceof Date
      ? form.watch("date").toISOString().split("T")[0]
      : "";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        onChange={() => setIsDirty(true)}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {mode === "create"
                ? "Generate Sales Invoice"
                : "Edit Sales Invoice"}
            </h2>
            <p className="text-slate-500">Retail & B2B Billing Terminal</p>
          </div>

          {isPosted && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              ⚠ This invoice is posted. Most fields are locked.
            </div>
          )}

          {/* Bill Type Tabs */}
          <FormField
            control={form.control}
            name="billType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      if (val === "NO2") {
                        form.setValue("partyId", "");
                      }
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2 h-12">
                      <TabsTrigger
                        value="NO1"
                        className="rounded-lg"
                        disabled={fields.length > 0}
                      >
                        No.1 Legal Bill
                      </TabsTrigger>
                      <TabsTrigger
                        value="NO2"
                        className="rounded-lg"
                        disabled={fields.length > 0}
                      >
                        No.2 Cash Bill
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {billType === "NO2" && (
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              ℹ This creates an informal cash memo. No GST, no customer ledger.
            </div>
          )}

          {/* Invoice Number Display */}
          {invoiceNumber && (
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Next Invoice Number
              </p>
              <p className="text-lg font-bold text-slate-900 font-mono">
                {invoiceNumber}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1: Dispatch Location */}
            <FormSection
              title="Dispatch Location"
              description="Outlet and date"
            >
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="fromOutletId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Outlet*</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isPosted}
                          className={cn(
                            "w-full h-14 px-6 rounded-lg border border-input bg-slate-50 text-base appearance-none cursor-pointer",
                            isPosted && "bg-slate-100 cursor-not-allowed",
                          )}
                        >
                          <option value="">Select outlet...</option>
                          {outlets.map((outlet) => (
                            <option key={outlet.id} value={outlet.id}>
                              {outlet.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date*</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          disabled={isPosted}
                          value={dateValue}
                          onChange={(e) => {
                            field.onChange(new Date(e.target.value));
                          }}
                          className={cn(
                            "w-full h-14 px-6 rounded-lg border border-input bg-slate-50 text-base",
                            isPosted && "bg-slate-100 cursor-not-allowed",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Section 2: Customer/Buyer */}
            {billType === "NO1" ? (
              <FormSection title="Customer" description="account details">
                <FormGrid cols={1}>
                  <FormField
                    control={form.control}
                    name="partyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer*</FormLabel>
                        <FormControl>
                          <CustomerSelect
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isPosted}
                            onCustomerLoad={(customer) => {
                              setSelectedCustomer(customer);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>
            ) : (
              <FormSection
                title="Retail Buyer"
                description="Counter sale details"
              >
                <FormGrid cols={2}>
                  <FormField
                    control={form.control}
                    name="buyerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buyer Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Optional"
                            disabled={isPosted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buyerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="Optional"
                            disabled={isPosted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>
            )}

            {/* Section 3: Line Items */}
            <FormSection title="Items" description="Products and quantities">
              <div className="space-y-4">
                {fields.length === 0 && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-6 rounded-lg border border-slate-200 text-center">
                    No items added. Click "Add Line" to begin.
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    {/* Single Row: Product | Qty | Rate | Discount% | HSN (NO1) | Total | Delete */}
                    <div
                      className={`grid gap-3 ${billType === "NO1" ? "grid-cols-[1.5fr_0.7fr_0.8fr_0.7fr_0.7fr_0.8fr_0.4fr]" : "grid-cols-[1.5fr_0.7fr_0.8fr_0.7fr_0.8fr_0.4fr]"}`}
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.variantId`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Product*</FormLabel>
                            <FormControl>
                              <ProductSelect
                                value={field.value}
                                outletId={fromOutletId}
                                onChange={async (variantId, productData) => {
                                  field.onChange(variantId);

                                  // Auto-fill fields from productData
                                  if (
                                    productData?.variant &&
                                    productData?.product
                                  ) {
                                    const { variant, product } = productData;

                                    // Auto-fill rate from variant.sellingPrice
                                    if (variant.sellingPrice) {
                                      form.setValue(
                                        `items.${index}.rate`,
                                        variant.sellingPrice,
                                      );
                                    }

                                    // Auto-fill gstRate from product.gstRate
                                    if (product.gstRate !== undefined) {
                                      form.setValue(
                                        `items.${index}.gstRate`,
                                        product.gstRate,
                                      );
                                    }

                                    // Auto-fill hsnCode from variant.sku or product.sku
                                    const hsnCode =
                                      variant.sku || product.sku || "";
                                    form.setValue(
                                      `items.${index}.hsnCode`,
                                      hsnCode,
                                    );

                                    // Auto-fill description from product.name
                                    form.setValue(
                                      `items.${index}.description`,
                                      product.name,
                                    );
                                  }
                                }}
                                disabled={isPosted}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Qty */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Qty*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                min="0"
                                max="999999"
                                value={field.value || ""}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  val = val.replace(/[^\d]/g, "");
                                  const num = parseInt(val, 10) || 0;
                                  field.onChange(num);
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    ["-", "+", ".", "e", "E"].includes(e.key)
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                disabled={isPosted}
                                placeholder="0"
                                className="font-mono h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Rate */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.rate`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Rate (₹)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="9999999.99"
                                value={field.value || ""}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  val = val.replace(/[^\d.]/g, "");
                                  val = val.replace(/\.(?=.*\.)/g, "");
                                  if (val.includes(".")) {
                                    const [int, dec] = val.split(".");
                                    val = int + "." + dec.slice(0, 2);
                                  }
                                  const num = parseFloat(val) || 0;
                                  field.onChange(num);
                                }}
                                onKeyDown={(e) => {
                                  if (["-", "+", "e", "E"].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                disabled={isPosted}
                                placeholder="0.00"
                                className="font-mono h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Discount% */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.discountPercent`}
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Discount%</FormLabel>
                            <FormControl>
                              <DiscountInput
                                value={field.value || 0}
                                onChange={field.onChange}
                                type="line"
                                baseAmount={
                                  (form.watch(`items.${index}.quantity`) || 0) *
                                  (form.watch(`items.${index}.rate`) || 0)
                                }
                                isPosted={isPosted}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* HSN Code (only for NO1) */}
                      {billType === "NO1" && (
                        <FormField
                          control={form.control}
                          name={`items.${index}.hsnCode`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">HSN</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  {...field}
                                  disabled
                                  className="text-sm bg-slate-100 h-10"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Line Total */}
                      <div className="space-y-1 flex flex-col justify-end">
                        <FormLabel className="text-xs">Total</FormLabel>
                        <div className="h-10 flex items-center justify-end bg-slate-100 rounded px-2 font-mono text-sm font-bold">
                          ₹
                          {(
                            (form.watch(`items.${index}.quantity`) || 0) *
                            (form.watch(`items.${index}.rate`) || 0) *
                            (1 -
                              (form.watch(`items.${index}.discountPercent`) ||
                                0) /
                                100)
                          ).toFixed(2)}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-end justify-end h-full">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 hover:bg-red-100 rounded"
                          title="Delete"
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      variantId: "",
                      description: "",
                      quantity: 1,
                      unit: "BASE",
                      rate: 0,
                      discountPercent: 0,
                      gstRate: billType === "NO1" ? 18 : 0,
                      hsnCode: "",
                      taxableValue: 0,
                      lineTotal: 0,
                    })
                  }
                  disabled={isPosted}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              </div>
            </FormSection>

            {/* Section 4: Additional */}
            <FormSection
              title="Additional"
              description="Freight, discount and remarks"
            >
              <FormGrid cols={billType === "NO1" ? 3 : 2}>
                <FormField
                  control={form.control}
                  name="freightCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Freight Cost (₹)</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="number"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={isPosted}
                          className="w-full h-10 px-3 rounded-lg border border-input bg-slate-50 text-sm font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {billType === "NO1" && (
                  <FormField
                    control={form.control}
                    name="headerDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Discount (%)</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="number"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            disabled={isPosted}
                            min={0}
                            max={100}
                            className="w-full h-10 px-3 rounded-lg border border-input bg-slate-50 text-sm font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="text"
                          placeholder="Optional notes"
                          disabled={isPosted}
                          className="w-full h-10 px-3 rounded-lg border border-input bg-slate-50 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div>
            <InvoiceSummaryPanel
              billType={billType === "NO1" ? "NO1" : "NO2"}
              itemsTotal={itemsTotal}
              lineDiscount={lineDiscounts}
              headerDiscount={headerDiscountAmount}
              subtotal={subtotal}
              gstBreakup={[]}
              totalTax={totalTax}
              freightCost={freightCost || 0}
              roundOff={0}
              grandTotal={grandTotal}
              isPosted={isPosted}
              canSubmit={
                items.length > 0 &&
                !!fromOutletId &&
                (billType === "NO2" || !!(form.watch("partyId") as string))
              }
              isSubmitting={isSubmitting}
              onSubmit={handleValidationClick}
              submitButtonText={
                mode === "create"
                  ? billType === "NO1"
                    ? "Post Invoice"
                    : "Post Cash Bill"
                  : "Update"
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-4 pt-8 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
