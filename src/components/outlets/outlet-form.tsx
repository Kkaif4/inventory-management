"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  OutletFormValues,
  outletSchema,
} from "@/validations/outlet.validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSection, FormGrid } from "@/components/ui/form-layout";
import { GSTINInput } from "@/components/form/gstin-input";
import { SegmentedPolicyControl } from "@/components/form/segmented-policy-control";
import { ToggleWithBanner } from "@/components/form/toggle-with-banner";
import { InvoicePreview } from "@/components/form/invoice-preview";
import { ReadOnlyBadge } from "@/components/form/read-only-badge";
import { INDIAN_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface OutletFormProps {
  outlet?: {
    id: string;
    name: string;
    address?: string | null;
    state?: string | null;
    gstin?: string | null;
    invoicePrefix: string;
    invoiceStartingNumber: number;
    bankDetails?: string | null;
    negativeStockPolicy: string;
    batchTrackingEnabled: boolean;
    inventoryValuationMethod: string;
    allowRawCashBills?: boolean;
  };
  onSubmit: (
    data: OutletFormValues
  ) => Promise<{ success: boolean; error?: any }>;
  redirectUrl?: string;
}

export function OutletForm({
  outlet,
  onSubmit,
  redirectUrl = "/dashboard/master-data/locations",
}: OutletFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasPostedInvoices, setHasPostedInvoices] = React.useState(false);
  const [hasExistingBatches, setHasExistingBatches] = React.useState(false);
  const [batchTrackingEnabled, setBatchTrackingEnabled] = React.useState(
    outlet?.batchTrackingEnabled ?? false
  );
  const [batchDisableAcknowledged, setBatchDisableAcknowledged] =
    React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Check for posted invoices and existing batches on mount (edit mode)
  React.useEffect(() => {
    if (outlet?.id) {
      // In a real implementation, you'd call server actions to check these
      // For now, we'll leave placeholders
      // await checkPostedInvoices(outlet.id).then(setHasPostedInvoices);
      // await checkExistingBatches(outlet.id).then(setHasExistingBatches);
    }
  }, [outlet?.id]);

  const form = useForm<OutletFormValues>({
    resolver: zodResolver(outletSchema),
    defaultValues: outlet
      ? {
          name: outlet.name,
          address: outlet.address || "",
          state: outlet.state || "",
          gstin: outlet.gstin || "",
          invoicePrefix: outlet.invoicePrefix,
          invoiceStartingNumber: outlet.invoiceStartingNumber || 1,
          bankDetails: outlet.bankDetails || "",
          negativeStockPolicy: (outlet.negativeStockPolicy as any) || "WARN",
          batchTrackingEnabled: outlet.batchTrackingEnabled || false,
          inventoryValuationMethod: outlet.inventoryValuationMethod || "NONE",
          allowRawCashBills: outlet.allowRawCashBills || false,
        }
      : {
          name: "",
          address: "",
          state: "",
          gstin: "",
          invoicePrefix: "INV",
          invoiceStartingNumber: 1,
          bankDetails: "",
          negativeStockPolicy: "WARN",
          batchTrackingEnabled: false,
          inventoryValuationMethod: "NONE",
          allowRawCashBills: false,
        },
  });

  const watchBatchTracking = form.watch("batchTrackingEnabled");

  const handleCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Discard and leave?"
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleFormSubmit = async (data: OutletFormValues) => {
    // Validate batch disable acknowledgement
    if (
      !batchTrackingEnabled &&
      outlet?.batchTrackingEnabled &&
      hasExistingBatches &&
      !batchDisableAcknowledged
    ) {
      toast.error("Please acknowledge before disabling batch tracking");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSubmit(data);
      if (res.success) {
        toast.success(
          outlet
            ? "Outlet details updated successfully"
            : "Sales outlet created successfully"
        );
        router.push(redirectUrl);
      } else {
        toast.error("Failed: " + res.error?.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        onChange={() => setIsDirty(true)}
        className="space-y-8"
      >
        {/* Section 1: Basic Information */}
        <FormSection
          title="Basic Information"
          description="Identity of the outlet. Printed on every invoice this outlet generates."
        >
          <FormGrid cols={1}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outlet Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Downtown Flagship Store"
                      maxLength={80}
                    />
                  </FormControl>
                  <FormDescription>Max 80 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Full address including street, area"
                      rows={3}
                      maxLength={300}
                      className="w-full h-auto px-6 py-3 rounded-lg border border-input bg-slate-50 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <FormDescription>Max 300 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-14 px-6 rounded-lg border border-input bg-slate-50 text-base appearance-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="">Select state...</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Used for GST type detection on invoices
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <GSTINInput
                        {...field}
                        selectedState={form.watch("state")}
                      />
                    </FormControl>
                    <FormDescription>15-character alphanumeric</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormGrid>
        </FormSection>

        {/* Section 2: Invoice Settings */}
        <FormSection
          title="Invoice Settings"
          description="Controls how invoice numbers are generated for this outlet. Every outlet has its own independent numbering series."
        >
          <FormGrid cols={2}>
            <FormField
              control={form.control}
              name="invoicePrefix"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Invoice Prefix</FormLabel>
                    {hasPostedInvoices && (
                      <ReadOnlyBadge reason="Cannot change after invoices posted" />
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={hasPostedInvoices}
                      placeholder="e.g., INV"
                      maxLength={8}
                      className="font-mono uppercase"
                    />
                  </FormControl>
                  <FormDescription>Max 8 chars. Alphanumeric only.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceStartingNumber"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Starting Number</FormLabel>
                    {hasPostedInvoices && (
                      <ReadOnlyBadge reason="Cannot change after invoices posted" />
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      disabled={hasPostedInvoices}
                      min={1}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>Default: 1</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>

          <InvoicePreview
            prefix={form.watch("invoicePrefix")}
            startingNumber={form.watch("invoiceStartingNumber")}
          />
        </FormSection>

        {/* Section 3: Bank Details */}
        <FormSection
          title="Bank Details"
          description="Bank account information printed at the bottom of invoices for customer payment reference."
        >
          <FormGrid cols={1}>
            <FormField
              control={form.control}
              name="bankDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Details</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder={`HDFC Bank — Current Account\nAccount No: 1234567890\nIFSC: HDFC0001234\nAccount Holder: ABC Hardware Pvt. Ltd.`}
                      rows={4}
                      maxLength={300}
                      className="w-full h-auto px-6 py-3 rounded-lg border border-input bg-slate-50 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    This text is printed on every invoice from this outlet.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        {/* Section 4: Inventory & Stock Settings */}
        <FormSection
          title="Inventory & Stock Settings"
          description="Controls how stock is managed, valued, and protected at this outlet."
        >
          <FormGrid cols={1}>
            <FormField
              control={form.control}
              name="negativeStockPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Negative Stock Policy</FormLabel>
                  <FormControl>
                    <SegmentedPolicyControl
                      value={field.value as any}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batchTrackingEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ToggleWithBanner
                      label="Enable Batch-wise Inventory"
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setBatchTrackingEnabled(val);
                        if (val) {
                          // Auto-set inventory valuation to FIFO
                          form.setValue("inventoryValuationMethod", "FIFO");
                        }
                      }}
                      infoBanner={
                        field.value
                          ? `Batch tracking assigns a unique batch number to each purchase receipt.
Stock is consumed in FIFO order (oldest batch first) on every sale.

If this outlet already has existing stock, you will need to complete
an Opening Batch Entry before new transactions can proceed.`
                          : undefined
                      }
                      warningBanner={
                        !field.value &&
                        outlet?.batchTrackingEnabled &&
                        hasExistingBatches
                          ? {
                              type: "error",
                              message: `Disabling batch tracking is irreversible for existing records.
All existing batch history will be preserved as read-only.
New transactions will not use batch tracking.`,
                              requireAcknowledgement: true,
                            }
                          : undefined
                      }
                      onAcknowledge={setBatchDisableAcknowledged}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventoryValuationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inventory Valuation Method</FormLabel>
                  {watchBatchTracking ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-sm font-medium text-emerald-900">
                        FIFO (auto-set by batch tracking)
                      </span>
                    </div>
                  ) : (
                    <FormControl>
                      <select
                        {...field}
                        disabled
                        className="w-full h-14 px-6 rounded-lg border border-input bg-slate-50 text-base appearance-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:opacity-50 cursor-not-allowed"
                      >
                        <option value="NONE">Not Set</option>
                      </select>
                    </FormControl>
                  )}
                  {!watchBatchTracking && (
                    <FormDescription>
                      Enable batch tracking to use FIFO valuation
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        {/* Section 5: Billing Settings */}
        <FormSection
          title="Billing Settings"
          description="Controls billing behaviour specific to this outlet."
        >
          <FormGrid cols={1}>
            <FormField
              control={form.control}
              name="allowRawCashBills"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ToggleWithBanner
                      label="Allow Raw Cash Bills (No.2 Bills)"
                      value={field.value}
                      onChange={field.onChange}
                      infoBanner={
                        field.value
                          ? `Enables a second billing mode (No.2 / Cash Memo) for quick counter sales.

No.2 bills:
• Reduce stock
• Create a journal entry to Cash Sales — Informal account
• Do NOT appear in GST reports
• Do NOT update customer ledger

Use this for walk-in cash buyers where a legal invoice is not required.`
                          : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>


        {/* Form Footer */}
        <div className="flex justify-between gap-4 pt-8 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {outlet ? "Update Outlet" : "Create Outlet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
