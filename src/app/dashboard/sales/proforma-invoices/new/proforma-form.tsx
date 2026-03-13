"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { createProformaInvoice } from "@/actions/sales/proforma-invoices";
import { useOutletStore } from "@/store/use-outlet-store";
import { AlertTriangle } from "lucide-react";

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
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
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
      if (!currentOutletId) throw new Error("Please select an outlet");
      if (!session?.user?.id) throw new Error("Unauthorized");

      setIsSubmitting(true);
      setError(null);
      await createProformaInvoice({
        ...data,
        outletId: currentOutletId,
        userId: session.user.id,
      });
      router.push("/dashboard/sales/proforma-invoices");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to create proforma invoice");
      setIsSubmitting(false);
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="min-w-[300px]">
          <FormField
            control={form.control as any}
            name={`items.${row.index}.variantId`}
            render={({ field }) => (
              <FormItem>
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
        </div>
      ),
    },
    {
      id: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <div className="w-24">
          <FormField
            control={form.control as any}
            name={`items.${row.index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: "rate",
      header: "Unit Rate (₹)",
      cell: ({ row }) => (
        <div className="w-32">
          <FormField
            control={form.control as any}
            name={`items.${row.index}.rate`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="w-10 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(row.index)}
            className="text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

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
              <DataTable columns={columns} data={fields} />
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
      {!currentOutletId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Selection Required
              </h3>
              <p className="text-slate-500">
                Please select an active outlet from the switcher in the top
                navigation bar before generating a proforma invoice.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/sales/proforma-invoices")}
              variant="outline"
              className="w-full py-6 rounded-2xl font-bold"
            >
              Go Back to Proforma Invoices
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
