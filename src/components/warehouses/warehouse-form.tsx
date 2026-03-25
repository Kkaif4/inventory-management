"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  WarehouseFormValues,
  warehouseSchema,
} from "@/validations/warehouse.validation";
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
import { INDIAN_STATES } from "@/lib/constants";

interface WarehouseFormProps {
  warehouse?: {
    id: string;
    name: string;
    address?: string | null;
    state: string;
    contactName?: string | null;
    contactPhone?: string | null;
  };
  onSubmit: (
    data: WarehouseFormValues
  ) => Promise<{ success: boolean; error?: any }>;
  redirectUrl?: string;
}

export function WarehouseForm({
  warehouse,
  onSubmit,
  redirectUrl = "/dashboard/master-data/locations",
}: WarehouseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouse
      ? {
          name: warehouse.name,
          address: warehouse.address || "",
          state: warehouse.state || "",
          contactName: warehouse.contactName || "",
          contactPhone: warehouse.contactPhone || "",
        }
      : {
          name: "",
          address: "",
          state: "",
          contactName: "",
          contactPhone: "",
        },
  });

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

  const handleFormSubmit = async (data: WarehouseFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await onSubmit(data);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        // toast handled by page component
      }
    } catch (error) {
      console.error("Form submission error:", error);
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
          description="Core details of the warehouse."
        >
          <FormGrid cols={1}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Northeast Logistics Hub"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>Max 100 characters</FormDescription>
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
                      placeholder="Full warehouse address"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        {/* Section 2: Contact Information */}
        <FormSection
          title="Contact Information"
          description="Primary warehouse manager and contact details."
        >
          <FormGrid cols={2}>
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. John Smith"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direct Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="10-digit phone number"
                      maxLength={15}
                    />
                  </FormControl>
                  <FormDescription>Include country code if international</FormDescription>
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
            {warehouse ? "Update Warehouse" : "Create Warehouse"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
