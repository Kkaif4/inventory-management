"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { lookupCustomerByPhone } from "@/actions/parties";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Paperclip,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface POSInvoiceHeaderProps {
  form: UseFormReturn<any>;
  outlets: any[];
  billType: string;
  isPosted: boolean;
  hasItems: boolean;
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  onCustomerLoad?: (customer: any) => void;
  customerSearchRef?: React.RefObject<HTMLInputElement | null>;
  invoiceId?: string;
  attachmentCount?: number;
  onAttachmentCountChange?: (count: number) => void;
}

export function POSInvoiceHeader({
  form,
  outlets,
  billType,
  isPosted,
  hasItems,
  invoiceNumber,
  onInvoiceNumberChange,
  onCustomerLoad,
  customerSearchRef,
  invoiceId,
  attachmentCount = 0,
  onAttachmentCountChange,
}: POSInvoiceHeaderProps) {
  const t = useTranslations("billing");
  const { currentOutletId } = useOutletStore();
  const [phone, setPhone] = React.useState<string>("");
  const [billingName, setBillingName] = React.useState<string>("");
  const [lookupState, setLookupState] = React.useState<
    "idle" | "loading" | "found" | "not-found"
  >("idle");
  const [foundCustomer, setFoundCustomer] = React.useState<any>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = React.useState(false);
  const [attachmentUploading, setAttachmentUploading] = React.useState(false);

  const dateValue =
    form.watch("date") instanceof Date
      ? form.watch("date").toISOString().split("T")[0]
      : "";

  // Initialize from form values on mount
  React.useEffect(() => {
    const buyerPhone = form.getValues("buyerPhone");
    const buyerName = form.getValues("buyerName");
    if (buyerPhone) setPhone(String(buyerPhone));
    if (buyerName) setBillingName(String(buyerName));
  }, []);

  const handlePhoneChange = async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);

    if (digits.length === 10 && currentOutletId) {
      setLookupState("loading");
      try {
        const res = await lookupCustomerByPhone(currentOutletId, digits);
        if (res.success && res.data) {
          setLookupState("found");
          setFoundCustomer(res.data);
          setBillingName(res.data.name);
          form.setValue("partyId", res.data.id);
          form.setValue("buyerPhone", digits);
          form.setValue("buyerName", res.data.name);
          if (onCustomerLoad) onCustomerLoad(res.data);
        } else {
          setLookupState("not-found");
          setFoundCustomer(null);
          form.setValue("partyId", "");
          form.setValue("buyerPhone", digits);
        }
      } catch {
        setLookupState("not-found");
        setFoundCustomer(null);
      }
    } else {
      setLookupState("idle");
      setFoundCustomer(null);
      if (digits.length === 0) {
        form.setValue("partyId", "");
        setBillingName("");
      }
    }
  };

  const handleBillingNameChange = (name: string) => {
    setBillingName(name);
    form.setValue("buyerName", name);
  };

  const handleAttachmentUpload = async (file: File) => {
    if (!invoiceNumber) {
      toast.error("Please enter invoice number first");
      return;
    }

    setAttachmentUploading(true);
    try {
      // Use TEMP:invoiceNumber as temporary reference
      const tempReference = `TEMP:${invoiceNumber}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("moduleType", "INVOICE");
      formData.append("referenceId", tempReference);

      const response = await fetch("/api/attachments/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error?.message || "Failed to upload attachment");
        return;
      }

      toast.success("Attachment uploaded successfully");

      // Update attachment count
      const newCount = attachmentCount + 1;
      onAttachmentCountChange?.(newCount);
      setAttachmentUploading(false);
      setAttachmentDialogOpen(false);
    } catch (error) {
      toast.error("Error uploading attachment");
      console.error("Upload error:", error);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAttachmentUpload(file);
    }
  };

  const isNO1 = billType === "NO1";

  return (
    <TooltipProvider>
      <div className="shrink-0 border-b border-slate-200 bg-white">
        {/* Row 1: Bill type + Outlet + Date */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-slate-100">
          {/* Bill Type Toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    disabled={hasItems || isPosted}
                    onClick={() => form.setValue("billType", "NO1")}
                    className={cn(
                      "px-4 h-9 text-sm font-bold transition-colors",
                      billType === "NO1"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50",
                      (hasItems || isPosted) && "opacity-60 cursor-not-allowed",
                    )}
                  />
                }
              >
                {t("header.no1Bill")}
              </TooltipTrigger>
              <TooltipContent>{t("tooltips.no1Bill")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    disabled={hasItems || isPosted}
                    onClick={() => {
                      form.setValue("billType", "NO2");
                      form.setValue("partyId", "");
                    }}
                    className={cn(
                      "px-4 h-9 text-sm font-bold transition-colors border-l border-slate-200",
                      billType === "NO2"
                        ? "bg-amber-500 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50",
                      (hasItems || isPosted) && "opacity-60 cursor-not-allowed",
                    )}
                  />
                }
              >
                {t("header.no2Cash")}
              </TooltipTrigger>
              <TooltipContent>{t("tooltips.no2Cash")}</TooltipContent>
            </Tooltip>
          </div>

          {isPosted && (
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded shrink-0">
              {t("header.posted")}
            </span>
          )}

          <div className="w-px h-7 bg-slate-200 shrink-0" />

          {/* Outlet */}
          <Tooltip>
            <TooltipTrigger
              render={
                <select
                  value={form.watch("fromOutletId") || ""}
                  onChange={(e) =>
                    form.setValue("fromOutletId", e.target.value)
                  }
                  disabled={isPosted}
                  className={cn(
                    "h-9 px-3 text-sm rounded-lg border border-input bg-transparent w-48 shrink-0 outline-none focus:ring-2 focus:ring-blue-500",
                    isPosted && "bg-slate-100 cursor-not-allowed",
                  )}
                />
              }
            >
              <option value="">{t("header.selectOutlet")}</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </TooltipTrigger>
            <TooltipContent>{t("tooltips.selectOutlet")}</TooltipContent>
          </Tooltip>

          {/* Date */}
          <Tooltip>
            <TooltipTrigger
              render={
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) =>
                    form.setValue("date", new Date(e.target.value))
                  }
                  disabled={isPosted}
                  className={cn(
                    "h-9 px-3 text-sm rounded-lg border border-input bg-transparent w-40 shrink-0 outline-none focus:ring-2 focus:ring-blue-500",
                    isPosted && "bg-slate-100 cursor-not-allowed",
                  )}
                />
              }
            />
            <TooltipContent>{t("tooltips.invoiceDate")}</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Invoice type label */}
          <span
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded shrink-0",
              isNO1
                ? "bg-slate-100 text-slate-600"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {isNO1 ? t("header.legalInvoice") : t("header.cashMemo")}
          </span>
        </div>

        {/* Row 2: Customer search */}
        <div className="flex items-center gap-4 px-4 py-2.5">
          {/* Phone input */}
          <div
            className="relative shrink-0"
            title={t("tooltips.customerPhone")}
          >
            <Input
              ref={customerSearchRef}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={isPosted}
              placeholder={t("header.customerPhone")}
              maxLength={10}
              inputMode="numeric"
              className={cn(
                "h-9 w-48 text-sm font-mono pl-8 focus:ring-2 focus:ring-blue-500",
                lookupState === "found" && "border-emerald-400",
                lookupState === "not-found" &&
                  phone.length === 10 &&
                  "border-amber-400",
              )}
            />
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {lookupState === "loading" && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {lookupState === "found" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              {lookupState === "not-found" && phone.length === 10 && (
                <XCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>

          {/* Billing Name */}
          <div title={t("tooltips.billingName")}>
            <Input
              value={billingName}
              onChange={(e) => handleBillingNameChange(e.target.value)}
              disabled={isPosted}
              placeholder={
                lookupState === "found"
                  ? t("header.billingNameAutoFilled")
                  : t("header.billingName")
              }
              className={cn(
                "h-9 text-sm w-64 focus:ring-2 focus:ring-blue-500",
                lookupState === "found" && "bg-emerald-50/50",
              )}
            />
          </div>

          {/* Invoice Number */}
          <div className="flex items-center gap-2" title="Invoice Number">
            <Input
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              disabled={isPosted}
              placeholder="INV/2025-26/0001"
              className="h-9 w-44 text-sm font-mono focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 h-9 px-2 text-xs shrink-0"
              title={invoiceId ? "Manage attachments" : "Add attachments"}
              onClick={() => {
                if (invoiceId) {
                  // Open detail page for attachments if posted
                  window.location.href = `/dashboard/sales/invoices/${invoiceId}`;
                } else {
                  // Open upload dialog for draft
                  setAttachmentDialogOpen(true);
                }
              }}
            >
              <Paperclip className="w-3 h-3" />
              {attachmentCount > 0 && (
                <span className="font-semibold">{attachmentCount}</span>
              )}
            </Button>
          </div>

          {/* Customer info badges */}
          {foundCustomer && (
            <div className="flex items-center gap-2 shrink-0">
              {foundCustomer.gstin && (
                <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-mono">
                  {foundCustomer.gstin}
                </span>
              )}
              {foundCustomer.creditLimit != null && (
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    foundCustomer.outstandingBalance > foundCustomer.creditLimit
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  ₹{foundCustomer.outstandingBalance?.toLocaleString()} / ₹
                  {foundCustomer.creditLimit?.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {lookupState === "not-found" && phone.length === 10 && (
            <span className="text-xs text-amber-600 font-medium">
              {t("header.newCustomerHint")}
            </span>
          )}
        </div>
      </div>

      {/* Attachment Upload Dialog */}
      <Dialog
        open={attachmentDialogOpen}
        onOpenChange={setAttachmentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>
              Upload supporting documents for invoice {invoiceNumber}. (Max 5MB,
              JPG/PNG)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                disabled={attachmentUploading}
                className="hidden"
                id="attachment-input"
              />
              <label htmlFor="attachment-input" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">
                  {attachmentUploading ? "Uploading..." : "Click to upload"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG or PNG, max 5MB
                </p>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
