"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { updateWarehouse } from "@/actions/locations";
import { Building2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  WarehouseFormValues,
  warehouseSchema,
} from "@/validations/warehouse.validation";

export function WarehouseEditClient({ warehouse }: { warehouse: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse.name,
      address: warehouse.address || "",
    },
  });

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await updateWarehouse(warehouse.id, data);

      if (res.success) {
        toast.success("Warehouse updated successfully");
        router.refresh();
        router.push("/dashboard/master-data/locations");
      } else {
        toast.error(
          "Failed to update warehouse: " +
            (res.error?.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Failed to update warehouse:", error);
      toast.error("A technical error occurred while updating the warehouse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-default flex items-center justify-center text-brand">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-text-primary">
              Edit Warehouse
            </h2>
            <p className="text-sm text-text-muted">
              Update details for {warehouse.name}.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/master-data/locations"
          className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 transition-colors"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-surface-base rounded-default shadow-sm border border-border-default overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Godown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Physical location address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
