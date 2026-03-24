"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  vendorSchema,
  VendorFormValues,
} from "@/validations/vendor.validation";
import { createVendor, updateVendor } from "@/actions/purchase/vendors";
import { useOutletStore } from "@/store/use-outlet-store";
import { INDIAN_STATES } from "@/lib/constants";
import { extractStateFromGSTIN } from "@/lib/gstin";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface VendorFormProps {
  initialData?: VendorFormValues & {
    _metadata?: { openingBalanceLocked?: boolean };
  };
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
  isSlideOver?: boolean;
}

export function VendorForm({
  initialData,
  onSuccess,
  onCancel,
  isSlideOver,
}: VendorFormProps) {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstinState, setGstinState] = useState<{
    isValid: boolean;
    message: string;
    state?: string;
  } | null>(null);

  const form = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema) as any,
    defaultValues: initialData || {
      name: "",
      gstin: "",
      pan: "",
      phone: "",
      email: "",
      contactInfo: "",
      address: "",
      state: "",
      creditPeriod: 30,
      openingBalance: 0,
      isActive: true,
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankIfsc: "",
    },
  });

  const gstinValue = form.watch("gstin");

  // GSTIN Validation & State Auto-fill Logic
  useEffect(() => {
    if (!gstinValue) {
      setGstinState(null);
      return;
    }

    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (gstinValue.length === 15 && gstinRegex.test(gstinValue)) {
      const derivedState = extractStateFromGSTIN(gstinValue);
      setGstinState({
        isValid: true,
        message: `Valid GSTIN — ${derivedState || "Unknown State"}`,
        state: derivedState,
      });
      if (derivedState && !form.getValues("state")) {
        form.setValue("state", derivedState, { shouldValidate: true });
      }
    } else if (gstinValue.length > 0) {
      setGstinState({ isValid: false, message: "Invalid GSTIN format" });
    }
  }, [gstinValue, form]);

  const onSubmit = async (data: VendorFormValues) => {
    if (!currentOutletId) {
      toast.error("No outlet selected.");
      return;
    }
    setIsSubmitting(true);
    try {
      let res;
      if (initialData?.id) {
        res = await updateVendor(initialData.id, data);
      } else {
        res = await createVendor(currentOutletId, data);
      }

      if (!res.success) {
        throw new Error(res.error?.message || "An error occurred");
      }

      toast.success(
        initialData?.id
          ? "Vendor updated successfully"
          : "Vendor created successfully",
      );

      if (onSuccess) {
        onSuccess(res.data?.id || "");
      } else {
        router.push("/dashboard/purchase/vendors");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* SECTION 1: IDENTITY */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            1. Identity & Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Vendor Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier Pvt Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="27ABCDE1234F1Z5"
                      className="uppercase font-mono"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  {gstinState && (
                    <div
                      className={`mt-1 flex items-center text-xs font-medium ${gstinState.isValid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {gstinState.isValid ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {gstinState.message}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABCDE1234F"
                      className="uppercase font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Contact Person (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ramesh Shah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECTION 2: ADDRESS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            2. Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Address Line *</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="123 Industrial Area..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECTION 3: BANK DETAILS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            3. Bank Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="HDFC Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier Pvt Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="50200012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankIfsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="HDFC0001234"
                      className="uppercase font-mono"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECTION 4: FINANCIAL TERMS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
            4. Financial Terms
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="creditPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Period (Days) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <p className="text-xs text-slate-500">
                    Expected payment terms
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Balance (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      disabled={initialData?._metadata?.openingBalanceLocked}
                    />
                  </FormControl>
                  {initialData?._metadata?.openingBalanceLocked ? (
                    <p className="text-xs text-amber-600">
                      Locked: Bills/payments exist.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Amount we owe before system go-live
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-slate-50 md:col-span-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <p className="text-xs text-slate-500">
                      Inactive vendors are hidden from standard search.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div
          className={`flex justify-end gap-3 pt-6 border-t ${isSlideOver ? "sticky bottom-0 bg-white p-4 -mx-4 -mb-4 border-t shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]" : ""}`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {initialData ? "Save Changes" : "Create Vendor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
