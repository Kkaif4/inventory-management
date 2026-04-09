"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { invoiceSchema } from "@/validations/invoice.validation";
import { useOutletStore } from "@/store/use-outlet-store";
import { POSInvoiceHeader } from "@/components/sales/pos-invoice-header";
import { POSInvoiceTable } from "@/components/sales/pos-invoice-table";
import { POSInvoiceFooter } from "@/components/sales/pos-invoice-footer";
import { peekNextInvoiceNumber } from "@/actions/sales/invoice-form-handler";
import { handleCreateOldBill } from "@/actions/sales/old-bill-form-handler";

interface POSInvoiceFormProps {
  mode: "create" | "edit";
  invoice?: any;
  outlets: any[];
  onSubmit?: (data: any) => Promise<{ success: boolean; error?: any }>;
  onSaveDraft?: (data: any) => Promise<{ success: boolean; error?: any }>;
}

export function POSInvoiceForm({
  mode,
  invoice,
  outlets,
  onSubmit: onSubmitProp,
  onSaveDraft: onSaveDraftProp,
}: POSInvoiceFormProps) {
  type FormValues = z.infer<typeof invoiceSchema>;

  const t = useTranslations("billing");
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [isGlobalDiscount, setIsGlobalDiscount] = React.useState(true);
  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [attachmentCount, setAttachmentCount] = React.useState(0);

  // Refs for keyboard shortcut targets
  const formContainerRef = React.useRef<HTMLDivElement>(null);
  const customerSearchRef = React.useRef<HTMLInputElement>(null);
  const productSearchRef = React.useRef<HTMLInputElement>(null);
  const notesRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: (invoice
      ? {
          billType: invoice.billType || "NO1",
          txnNumber: invoice.txnNumber || "",
          date: invoice.date ? new Date(invoice.date) : new Date(),
          fromOutletId: invoice.outletId || "",
          partyId: invoice.partyId || "",
          buyerName: invoice.buyerName || "",
          buyerPhone: invoice.buyerPhone || "",
          items: invoice.items || [],
          headerDiscount: invoice.headerDiscount || 0,
          freightCost: invoice.freightCost || 0,
          remarks: invoice.remarks || "",
          ...(invoice.billType === "OLD" && {
            grandTotal: invoice.grandTotal || 0,
            payments: invoice.payments || [],
          }),
        }
      : {
          billType: "NO1",
          txnNumber: "",
          date: new Date(),
          fromOutletId: (currentOutletId && currentOutletId !== "ALL") ? currentOutletId : "",
          partyId: "",
          buyerName: "",
          buyerPhone: "",
          items: [],
          headerDiscount: 0,
          freightCost: 0,
          remarks: "",
          grandTotal: 0,
          payments: [],
        }) as any,
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  const paymentFieldArray = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const billType = form.watch("billType");
  const fromOutletId = form.watch("fromOutletId");
  const items = form.watch("items");
  const headerDiscount = form.watch("headerDiscount");
  const freightCost = form.watch("freightCost");
  const isPosted = invoice?.status === "POSTED";

  // Load next invoice number when outlet or bill type changes
  React.useEffect(() => {
    if (!fromOutletId) return;

    const loadNextNumber = async () => {
      // OLD bills skip numbering lookup if custom is used, but we can peek for visual
      const res = await peekNextInvoiceNumber(
        fromOutletId,
        billType === "OLD" ? ("OLD_BILL" as any) : (billType as "NO1" | "NO2"),
      );
      if (res.success && res.data) {
        setInvoiceNumber(res.data);
        if (billType !== "OLD") {
          form.setValue("txnNumber", res.data);
        }
      }
    };

    loadNextNumber();
  }, [fromOutletId, billType]);

  // Load attachment count - from temp ref during creation, from invoice ID after posting
  React.useEffect(() => {
    const loadAttachments = async () => {
      try {
        // During creation: load from TEMP:invoiceNumber
        // After posting: load from invoice ID
        const referenceId = invoice?.id || `TEMP:${invoiceNumber}`;

        if (!referenceId || referenceId === "TEMP:") {
          setAttachmentCount(0);
          return;
        }

        const params = new URLSearchParams({
          moduleType: "INVOICE",
          referenceId,
        });
        const response = await fetch(`/api/attachments/by-reference?${params}`);
        const result = await response.json();
        if (result.success && result.data) {
          setAttachmentCount(result.data.length);
        } else {
          setAttachmentCount(0);
        }
      } catch (error) {
        console.error("Failed to load attachments:", error);
        setAttachmentCount(0);
      }
    };

    // Only load if we have a valid reference
    if ((invoice?.id || invoiceNumber) && invoiceNumber !== "") {
      loadAttachments();
    } else {
      setAttachmentCount(0);
    }
  }, [invoice?.id, invoiceNumber]);

  // ─── Calculations (useMemo) ───────────────────────────────────────────────
  const totals = React.useMemo(() => {
    const itemsTotal = (items || []).reduce(
      (sum: number, item: any) =>
        sum + (item?.quantity || 0) * (item?.rate || 0),
      0,
    );

    // OLD bills: calculation with discount support (quantity * rate) - discount% + freight
    if (billType === "OLD") {
      const discountAmount = isGlobalDiscount
        ? (itemsTotal * (headerDiscount || 0)) / 100
        : 0;
      const subtotal = itemsTotal - discountAmount;
      const grandTotal = subtotal + (freightCost || 0);
      return {
        itemsTotal,
        lineDiscounts: 0,
        subtotal,
        totalDiscount: discountAmount,
        totalTax: 0,
        grandTotal,
      };
    }

    // Standard invoices (NO1, NO2): include discounts and tax
    const lineDiscounts = (items || []).reduce(
      (sum: number, item: any) =>
        sum +
        ((item?.quantity || 0) *
          (item?.rate || 0) *
          (item?.discountPercent || 0)) /
          100,
      0,
    );

    const subtotalAfterLineDisc = itemsTotal - lineDiscounts;

    // Global discount applies to subtotal after line discounts
    const globalDiscountAmount = isGlobalDiscount
      ? (subtotalAfterLineDisc * (headerDiscount || 0)) / 100
      : 0;

    const subtotal = subtotalAfterLineDisc - globalDiscountAmount;
    const totalDiscount = lineDiscounts + globalDiscountAmount;

    const totalTax = (items || []).reduce((sum: number, item: any) => {
      const lineBase =
        (item?.quantity || 0) *
        (item?.rate || 0) *
        (1 - (item?.discountPercent || 0) / 100);
      const tax = (lineBase * (item?.gstRate || 0)) / 100;
      return sum + tax;
    }, 0);

    const grandTotal = subtotal + totalTax + (freightCost || 0);

    return {
      itemsTotal,
      lineDiscounts,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  }, [items, headerDiscount, freightCost, isGlobalDiscount, billType]);

  // Update form grandTotal for OLD bills whenever any calculation input changes
  React.useEffect(() => {
    if (billType === "OLD") {
      // Recalculate directly to ensure form is always in sync with calculation
      const itemsTotal = (items || []).reduce(
        (sum, item) => sum + (item?.quantity || 0) * (item?.rate || 0),
        0,
      );
      const discountAmount = isGlobalDiscount
        ? (itemsTotal * (headerDiscount || 0)) / 100
        : 0;
      const subtotal = itemsTotal - discountAmount || 0;
      const calculated = subtotal + (freightCost || 0);

      form.setValue("grandTotal", calculated, {
        shouldDirty: false,
        shouldValidate: false,
        shouldTouch: false,
      });
    }
  }, [billType, items, headerDiscount, freightCost, isGlobalDiscount]);

  // Count items with products
  const filledItemsCount = (items || []).filter(
    (item: any) => item?.variantId,
  ).length;

  const canSubmit =
    billType === "OLD"
      ? ((items?.length ?? 0) > 0 || (form.getValues("grandTotal") ?? 0) > 0) &&
        !!fromOutletId &&
        !!form.watch("buyerName")
      : filledItemsCount > 0 &&
        !!fromOutletId &&
        (billType === "NO2" || !!(form.watch("partyId") as string));

  // ─── Submission ───────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      if (data.billType === "OLD") {
        // Mapping for OLD bill schema
        const oldBillData = {
          ...data,
          items: (data.items || []).map((item: any) => ({
            itemDescription:
              item.itemDescription ||
              item.description ||
              item.productName ||
              "Item",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
          })),
          headerDiscount: data.headerDiscount || 0,
          payments: ((data as any).payments || []).filter(
            (p: any) => p && p.amount && p.amount > 0,
          ),
        };
        const res = await handleCreateOldBill(oldBillData as any);
        if (res.success) {
          // Reset state before navigation
          setAttachmentCount(0);
          toast.success("Historical record saved");
          router.push("/dashboard/sales/invoices");
        } else {
          toast.error(res.error?.message || "Failed to save historical record");
        }
        return;
      }

      if (!onSubmitProp) {
        toast.error(t("toasts.noHandler"));
        return;
      }

      // Filter out empty rows for standard invoices
      const cleanedData = {
        ...data,
        items: (data.items || []).filter((item: any) => item.variantId),
      };

      const res = await onSubmitProp(cleanedData as any);
      if (res.success) {
        // Reset state before navigation
        setAttachmentCount(0);
        toast.success(
          mode === "create" ? t("toasts.posted") : t("toasts.updated"),
        );
        router.push("/dashboard/sales/invoices");
      } else {
        toast.error(res.error?.message || t("toasts.failed"));
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t("toasts.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationClick = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      // Get all field errors
      const errors = form.formState.errors;
      const errorMessages: string[] = [];

      // Collect error messages from all fields
      Object.entries(errors).forEach(([field, error]: any) => {
        if (error?.message) {
          errorMessages.push(`${field}: ${error.message}`);
        }
      });

      if (errorMessages.length > 0) {
        // Show first 3 errors
        toast.error(errorMessages.slice(0, 3).join("\n"));
      } else {
        toast.error(t("toasts.validationError"));
      }
    } else {
      form.handleSubmit(handleFormSubmit)();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm(t("discardConfirm"))) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const toggleDiscountMode = () => {
    if (isGlobalDiscount) {
      // Switching to row-level: clear global discount
      form.setValue("headerDiscount", 0);
    } else {
      // Switching to global: clear all row discounts
      (items || []).forEach((_: any, idx: number) => {
        form.setValue(`items.${idx}.discountPercent`, 0);
      });
    }
    setIsGlobalDiscount(!isGlobalDiscount);
  };

  // ─── Global Keyboard Shortcuts ────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Enter → Post invoice
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleValidationClick();
        return;
      }

      // F2 or Alt+C → Jump to customer search
      if (e.key === "F2" || (e.altKey && e.key === "c")) {
        e.preventDefault();
        customerSearchRef.current?.focus();
        return;
      }

      // F4 or Alt+P → Jump to product search
      if (e.key === "F4" || (e.altKey && e.key === "p")) {
        e.preventDefault();
        productSearchRef.current?.focus();
        return;
      }

      // Alt+D → Toggle discount mode
      if (e.altKey && e.key === "d") {
        e.preventDefault();
        toggleDiscountMode();
        return;
      }

      // Alt+N → Jump to notes
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        notesRef.current?.focus();
        return;
      }

      // Esc → Clear search / blur
      if (e.key === "Escape") {
        const active = document.activeElement as HTMLElement;
        active?.blur();
        return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  const submitButtonText =
    mode === "create"
      ? billType === "NO1"
        ? t("footer.postInvoice")
        : billType === "OLD"
          ? "Save Historical Record"
          : t("footer.postCashBill")
      : t("footer.update");

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        onChange={() => setIsDirty(true)}
      >
        <div
          ref={formContainerRef}
          className="flex flex-col h-[calc(100vh-3.5rem)] -my-6 -mx-6 bg-white"
        >
          {/* Top Bar: Bill type, outlet, date, customer */}
          <POSInvoiceHeader
            form={form}
            outlets={outlets}
            billType={billType}
            isPosted={isPosted}
            hasItems={filledItemsCount > 0}
            invoiceNumber={invoiceNumber}
            onInvoiceNumberChange={(value) => {
              setInvoiceNumber(value);
              form.setValue("txnNumber", value);
            }}
            onCustomerLoad={setSelectedCustomer}
            customerSearchRef={customerSearchRef}
            invoiceId={invoice?.id}
            attachmentCount={attachmentCount}
            onAttachmentCountChange={setAttachmentCount}
          />

          {/* Middle: Product search + items table */}
          <POSInvoiceTable
            form={form}
            fieldArray={fieldArray}
            billType={billType}
            fromOutletId={fromOutletId}
            isPosted={isPosted}
            isGlobalDiscount={isGlobalDiscount}
            productSearchRef={productSearchRef}
          />

          {/* Bottom: Totals + actions */}
          <POSInvoiceFooter
            form={form}
            billType={billType}
            isPosted={isPosted}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onSubmit={handleValidationClick}
            onCancel={handleCancel}
            onSaveDraft={onSaveDraftProp ? () => {} : undefined}
            subtotal={totals.subtotal}
            totalTax={totals.totalTax}
            totalDiscount={totals.totalDiscount}
            freightCost={freightCost || 0}
            grandTotal={totals.grandTotal}
            submitButtonText={submitButtonText}
            isGlobalDiscount={isGlobalDiscount}
            onToggleDiscountMode={toggleDiscountMode}
            notesRef={notesRef}
            paymentFieldArray={paymentFieldArray}
          />
        </div>
      </form>
    </Form>
  );
}
