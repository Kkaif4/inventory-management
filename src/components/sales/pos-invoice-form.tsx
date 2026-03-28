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
          fromOutletId: currentOutletId || "",
          partyId: "",
          buyerName: "",
          buyerPhone: "",
          items: [],
          headerDiscount: 0,
          freightCost: 0,
          remarks: "",
        }) as any,
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  const billType = form.watch("billType");
  const fromOutletId = form.watch("fromOutletId");
  const items = form.watch("items");
  const headerDiscount = form.watch("headerDiscount");
  const freightCost = form.watch("freightCost");
  const isPosted = invoice?.status === "POSTED";

  // ─── Calculations (useMemo) ───────────────────────────────────────────────
  const totals = React.useMemo(() => {
    const itemsTotal = (items || []).reduce(
      (sum: number, item: any) =>
        sum + (item?.quantity || 0) * (item?.rate || 0),
      0,
    );

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
  }, [items, headerDiscount, freightCost, isGlobalDiscount]);

  // Count items with products
  const filledItemsCount = (items || []).filter(
    (item: any) => item?.variantId,
  ).length;

  const canSubmit =
    filledItemsCount > 0 &&
    !!fromOutletId &&
    (billType === "NO2" || !!(form.watch("partyId") as string));

  // ─── Submission ───────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      if (!onSubmitProp) {
        toast.error(t("toasts.noHandler"));
        return;
      }

      // Filter out empty rows
      const cleanedData = {
        ...data,
        items: (data.items || []).filter((item: any) => item.variantId),
      };

      const res = await onSubmitProp(cleanedData as any);
      if (res.success) {
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
      toast.error(t("toasts.validationError"));
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
            onCustomerLoad={setSelectedCustomer}
            customerSearchRef={customerSearchRef}
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
          />
        </div>
      </form>
    </Form>
  );
}
