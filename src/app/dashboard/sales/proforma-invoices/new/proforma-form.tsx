"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { createProformaInvoice } from "@/actions/sales/proforma-invoices";

const formSchema = z.object({
  partyId: z.string().min(1, "Select a customer"),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Select a product"),
        quantity: z.coerce.number().min(1, "Minimum quantity: 1"),
        rate: z.coerce.number().min(0, "Invalid rate"),
      }),
    )
    .min(1, "Add at least one item"),
});

export function ProformaInvoiceForm({
  customers,
  variants,
}: {
  customers: any[];
  variants: any[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      partyId: "",
      items: [{ variantId: "", quantity: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  async function onSubmit(data: any) {
    try {
      setIsSubmitting(true);
      setError(null);
      await createProformaInvoice(data);
      router.push("/dashboard/sales/proforma-invoices");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to create proforma invoice");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <PageHeader
        title="Create Proforma Invoice"
        subtitle="Issue a temporary invoice for advance payments or custom clearance."
        breadcrumbs={[
          { label: "Sales" },
          {
            label: "Proforma Invoices",
            href: "/dashboard/sales/proforma-invoices",
          },
          { label: "New" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-8"
        >
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-surface-base border border-border-default rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-bold text-text-primary">Customer</h3>
            <FormField
              control={form.control as any}
              name="partyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Customer</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-surface-base border border-border-default rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                Invoice Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ variantId: "", quantity: 1, rate: 0 })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 py-2 bg-surface-muted rounded text-xs font-bold text-text-secondary uppercase">
                <div className="col-span-6">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-3">Unit Rate (₹)</div>
                <div className="col-span-1 text-center">Del</div>
              </div>

              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  <FormField
                    control={form.control as any}
                    name={`items.${idx}.variantId`}
                    render={({ field }) => (
                      <FormItem className="col-span-6">
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="">-- Select Product --</option>
                            {variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.product.name} ({v.sku})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name={`items.${idx}.quantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name={`items.${idx}.rate`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-1 pt-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(idx)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-border-default pt-6">
            <Link href="/dashboard/sales/proforma-invoices">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Creating..." : "Create Proforma"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
