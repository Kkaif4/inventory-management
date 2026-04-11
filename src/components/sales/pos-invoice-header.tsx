"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { searchCustomersByPhone, searchCustomersByName } from "@/actions/parties";
import { createMinimalCustomer } from "@/actions/sales/customers";
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
import { AttachmentList } from "@/components/attachments/attachment-list";
import { AttachmentPreviewDialog } from "@/components/attachments/attachment-preview-dialog";
import type { AttachmentMetadata } from "@/types/expense.types";

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
  const [foundCustomers, setFoundCustomers] = React.useState<any[]>([]);
  const [showCustomerPicker, setShowCustomerPicker] = React.useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = React.useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = React.useState(false);
  const [attachmentUploading, setAttachmentUploading] = React.useState(false);
  const [attachmentsList, setAttachmentsList] = React.useState<AttachmentMetadata[]>([]);
  const [previewAttachmentId, setPreviewAttachmentId] = React.useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = React.useState<string>("");
  const [nameSearchResults, setNameSearchResults] = React.useState<any[]>([]);
  const [showNameDropdown, setShowNameDropdown] = React.useState(false);
  const [nameSearchLoading, setNameSearchLoading] = React.useState(false);
  const nameSearchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

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

  // Load attachments when invoice number changes
  React.useEffect(() => {
    loadAttachmentsList();
  }, [invoiceNumber]);

  const handlePhoneChange = async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);

    if (digits.length === 10 && currentOutletId) {
      setLookupState("loading");
      try {
        const res = await searchCustomersByPhone(currentOutletId, digits);
        if (res && res.success && res.data && res.data.length > 0) {
          setFoundCustomers(res.data);
          if (res.data.length === 1) {
            const customer = res.data[0];
            setLookupState("found");
            setBillingName(customer.name);
            form.setValue("partyId", customer.id);
            form.setValue("buyerPhone", digits);
            form.setValue("buyerName", customer.name);
            if (onCustomerLoad) onCustomerLoad(customer);
          } else {
            setLookupState("found");
            setShowCustomerPicker(true);
          }
        } else {
          setLookupState("not-found");
          setFoundCustomers([]);
          form.setValue("partyId", "");
          form.setValue("buyerPhone", digits);
          setShowCreateCustomer(true);
        }
      } catch (err) {
        console.error("Phone search error:", err);
        setLookupState("not-found");
        setFoundCustomers([]);
      }
    } else {
      setLookupState("idle");
      setFoundCustomers([]);
      if (digits.length === 0) {
        form.setValue("partyId", "");
        setBillingName("");
      }
    }
  };

  const handleCreateCustomer = async () => {
    if (!billingName || !phone || !currentOutletId) return;
    setLookupState("loading");
    try {
      const res = await createMinimalCustomer(currentOutletId, {
        name: billingName,
        phone: phone,
      });
      if (res.success && res.data) {
        const customer = res.data;
        setLookupState("found");
        setFoundCustomers([customer]);
        form.setValue("partyId", customer.id);
        form.setValue("buyerPhone", phone);
        form.setValue("buyerName", customer.name);
        if (onCustomerLoad) onCustomerLoad(customer);
        setShowCreateCustomer(false);
        toast.success("Customer created");
      }
    } catch {
      toast.error("Failed to create customer");
      setLookupState("not-found");
    }
  };

  const selectCustomer = (customer: any) => {
    setLookupState("found");
    setBillingName(customer.name);
    form.setValue("partyId", customer.id);
    form.setValue("buyerPhone", customer.phone);
    form.setValue("buyerName", customer.name);
    if (onCustomerLoad) onCustomerLoad(customer);
    setShowCustomerPicker(false);
    setShowNameDropdown(false);
    setNameSearchResults([]);
  };

  const selectCustomerFromName = (customer: any) => {
    setLookupState("found");
    setBillingName(customer.name);
    setPhone(customer.phone || "");
    form.setValue("partyId", customer.id);
    form.setValue("buyerPhone", customer.phone || "");
    form.setValue("buyerName", customer.name);
    if (onCustomerLoad) onCustomerLoad(customer);
    setFoundCustomers([customer]);
    setShowNameDropdown(false);
    setNameSearchResults([]);
  };

  const handleBillingNameChange = (name: string) => {
    setBillingName(name);
    form.setValue("buyerName", name);

    if (nameSearchTimerRef.current) clearTimeout(nameSearchTimerRef.current);

    if (name.length >= 2 && currentOutletId) {
      setNameSearchLoading(true);
      nameSearchTimerRef.current = setTimeout(async () => {
        try {
          const res = await searchCustomersByName(currentOutletId, name);
          if (res.success && res.data && res.data.length > 0) {
            setNameSearchResults(res.data);
            setShowNameDropdown(true);
          } else {
            setNameSearchResults([]);
            setShowNameDropdown(false);
          }
        } finally {
          setNameSearchLoading(false);
        }
      }, 300);
    } else {
      setNameSearchResults([]);
      setShowNameDropdown(false);
      setNameSearchLoading(false);
    }
  };

  const handleNameInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && showNameDropdown && nameSearchResults.length > 0) {
      e.preventDefault();
      selectCustomerFromName(nameSearchResults[0]);
    }
  };

  const loadAttachmentsList = async () => {
    if (!invoiceNumber) {
      setAttachmentsList([]);
      return;
    }

    try {
      const tempReference = `TEMP:${invoiceNumber}`;
      const params = new URLSearchParams({
        moduleType: "INVOICE",
        referenceId: tempReference,
      });
      const response = await fetch(`/api/attachments/by-reference?${params}`);
      const result = await response.json();
      if (result.success && result.data) {
        setAttachmentsList(result.data);
      } else {
        setAttachmentsList([]);
      }
    } catch (error) {
      console.error("Failed to load attachments:", error);
      setAttachmentsList([]);
    }
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

      // Reload attachments list
      await loadAttachmentsList();

      // Update attachment count
      const newCount = attachmentCount + 1;
      onAttachmentCountChange?.(newCount);
      setAttachmentDialogOpen(false);
    } catch (error) {
      toast.error("Error uploading attachment");
      console.error("Upload error:", error);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleAttachmentDelete = (deletedId: string) => {
    setAttachmentsList((prev) => prev.filter((a) => a.id !== deletedId));
    const newCount = Math.max(0, attachmentCount - 1);
    onAttachmentCountChange?.(newCount);
  };

  const handlePreviewAttachment = (id: string, fileName: string) => {
    setPreviewAttachmentId(id);
    setPreviewFileName(fileName);
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
            {/* OLD Bill Type */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    disabled={hasItems || isPosted}
                    onClick={() => {
                      form.setValue("billType", "OLD");
                      form.setValue("partyId", "");
                      form.setValue("isInformal", true);
                    }}
                    className={cn(
                      "px-4 h-9 text-sm font-bold transition-colors border-l border-slate-200",
                      billType === "OLD"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50",
                      (hasItems || isPosted) && "opacity-60 cursor-not-allowed",
                    )}
                  />
                }
              >
                OLD
              </TooltipTrigger>
              <TooltipContent>Historical Record (No Stock/Ledger)</TooltipContent>
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
                : billType === "OLD"
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-amber-50 text-amber-700",
            )}
          >
            {isNO1 ? t("header.legalInvoice") : billType === "OLD" ? "Historical Record" : t("header.cashMemo")}
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
          <div className="relative" title={t("tooltips.billingName")}>
            <Input
              ref={nameInputRef}
              value={billingName}
              onChange={(e) => handleBillingNameChange(e.target.value)}
              onKeyDown={handleNameInputKeyDown}
              onBlur={() => setTimeout(() => setShowNameDropdown(false), 150)}
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
            {nameSearchLoading && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
            )}
            {showNameDropdown && nameSearchResults.length > 0 && (
              <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {nameSearchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => selectCustomerFromName(c)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 text-left transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.phone || "No phone"}</div>
                    </div>
                    {c.state && (
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500">
                        {c.state}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Invoice/Bill Number */}
          <div className="flex items-center gap-2" title="Invoice Number">
            {billType === "OLD" ? (
              <div className="flex items-center gap-1 group relative">
                <span className="text-xs font-bold text-slate-400 absolute left-2 pointer-events-none group-focus-within:hidden">
                  OLD/
                </span>
                <Input
                  value={form.watch("customBillNo") || ""}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    form.setValue("customBillNo", val);
                    onInvoiceNumberChange(`OLD/${val}`);
                  }}
                  disabled={isPosted}
                  placeholder="BOOK-REF"
                  className="h-9 w-44 text-sm font-bold pl-12 uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <Input
                value={invoiceNumber}
                onChange={(e) => onInvoiceNumberChange(e.target.value)}
                disabled={isPosted}
                placeholder="INV/2025-26/0001"
                className="h-9 w-44 text-sm font-mono focus:ring-2 focus:ring-blue-500"
              />
            )}
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
          {foundCustomers.length === 1 && (
            <div className="flex items-center gap-2 shrink-0">
              {foundCustomers[0].gstin && (
                <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-mono">
                  {foundCustomers[0].gstin}
                </span>
              )}
              {foundCustomers[0].creditLimit != null && (
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    foundCustomers[0].outstandingBalance > foundCustomers[0].creditLimit
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  ₹{foundCustomers[0].outstandingBalance?.toLocaleString()} / ₹
                  {foundCustomers[0].creditLimit?.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {lookupState === "not-found" && phone.length === 10 && (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-amber-600 font-bold hover:text-amber-700"
              onClick={() => setShowCreateCustomer(true)}
            >
              + Create New Customer
            </Button>
          )}
        </div>
      </div>

      {/* Multiple Customer Picker Dialog */}
      <Dialog open={showCustomerPicker} onOpenChange={setShowCustomerPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Multiple Customers Found</DialogTitle>
            <DialogDescription>
              Select the correct customer for phone number {phone}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
            {foundCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCustomer(c)}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div>
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.phone}</div>
                </div>
                {c.state && (
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-600">
                    {c.state}
                  </span>
                )}
              </button>
            ))}
            <Button
              variant="outline"
              className="mt-2 border-dashed"
              onClick={() => {
                setShowCustomerPicker(false);
                setShowCreateCustomer(true);
              }}
            >
              + Add Another with same Phone
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Minimal Customer Dialog */}
      <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Quickly add customer details for {phone}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <Input
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                autoFocus
              />
            </div>
            <Button 
              className="w-full bg-slate-900" 
              onClick={handleCreateCustomer}
              disabled={!billingName || lookupState === "loading"}
            >
              {lookupState === "loading" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save & Select
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachment Upload Dialog */}
      <Dialog
        open={attachmentDialogOpen}
        onOpenChange={setAttachmentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Attachments</DialogTitle>
            <DialogDescription>
              Upload or remove documents for invoice {invoiceNumber}. (Max 5MB,
              JPG/PNG)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Attachments List */}
            {attachmentsList.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">
                  Uploaded Attachments ({attachmentsList.length})
                </p>
                <AttachmentList
                  attachments={attachmentsList}
                  moduleType="INVOICE"
                  referenceId={`TEMP:${invoiceNumber}`}
                  onDelete={handleAttachmentDelete}
                  onPreview={handlePreviewAttachment}
                />
              </div>
            )}

            {/* Upload Zone */}
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

      {/* Attachment Preview Dialog */}
      <AttachmentPreviewDialog
        attachmentId={previewAttachmentId}
        fileName={previewFileName}
        open={!!previewAttachmentId}
        onClose={() => {
          setPreviewAttachmentId(null);
          setPreviewFileName("");
        }}
      />
    </TooltipProvider>
  );
}
