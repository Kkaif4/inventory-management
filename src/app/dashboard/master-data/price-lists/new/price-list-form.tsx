"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { createPriceList } from "@/actions/price-lists";
import { getParties } from "@/actions/parties";
import { Checkbox } from "@/components/ui/checkbox";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  PriceListFormValues,
  priceListFormSchema,
} from "@/validations/price-list.validation";

export function PriceListForm({ variants }: { variants: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const { currentOutletId } = useOutletStore();
  if (!currentOutletId) return;

  useEffect(() => {
    getParties(currentOutletId).then((data) =>
      setCustomers(data.filter((p) => p.type === "CUSTOMER")),
    );
  }, []);

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      entries: [{ variantId: "", price: 0 }],
      partyIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "entries",
    control: form.control,
  });

  async function onSubmit(data: PriceListFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);
      await createPriceList({
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
        entries: data.entries,
        partyIds: data.partyIds,
      });
      router.push("/dashboard/master-data/price-lists");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  }

  const breadcrumbs = [
    { label: "Master Data" },
    { label: "Price Lists", href: "/dashboard/master-data/price-lists" },
    { label: "New Array" },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <PageHeader
        title="Create Price List"
        subtitle="Define custom pricing for special customers or contractors"
        breadcrumbs={breadcrumbs}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-surface-base border border-border-default rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-bold text-text-primary">
              Basic Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Price List Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Contractor VIP Rates"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Internal notes about who gets this pricing"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-surface-base border border-border-default rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-bold text-text-primary">
              Assign to Customers
            </h3>
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-600">
                Select customers who will receive this special pricing:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-xl p-4 max-h-60 overflow-y-auto bg-slate-50/50 shadow-inner">
                <FormField
                  control={form.control}
                  name="partyIds"
                  render={({ field }) => (
                    <>
                      {customers.map((c) => (
                        <div
                          key={c.id}
                          className={`flex items-center space-x-3 text-sm p-3 rounded-xl border transition-all cursor-pointer ${
                            field.value?.includes(c.id)
                              ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/10"
                              : "bg-white border-slate-200 hover:border-blue-300"
                          }`}
                          onClick={() => {
                            const current = field.value || [];
                            const newValue = current.includes(c.id)
                              ? current.filter((id: string) => id !== c.id)
                              : [...current, c.id];
                            field.onChange(newValue);
                          }}
                        >
                          <Checkbox
                            id={c.id}
                            checked={field.value?.includes(c.id)}
                            onCheckedChange={() => {}} // Handled by div click for better hit area
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                              {c.state}
                            </p>
                          </div>
                        </div>
                      ))}
                      {customers.length === 0 && (
                        <p className="col-span-full text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">
                          No Customers Found
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                * Customers linked to this list will automatically see these
                rates in their sales invoices.
              </p>
            </div>
          </div>

          <div className="bg-surface-base border border-border-default rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                Product Prices
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ variantId: "", price: 0 })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 py-2 bg-surface-muted rounded text-xs font-bold text-text-secondary uppercase tracking-wider">
                <div className="col-span-8">Product / Variant</div>
                <div className="col-span-3">Custom Price (₹)</div>
                <div className="col-span-1 text-center">Delete</div>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  <FormField
                    control={form.control}
                    name={`entries.${index}.variantId`}
                    render={({ field }) => (
                      <FormItem className="col-span-8">
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">
                              -- Select Product Variant --
                            </option>
                            {variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.product.name} ({v.sku}) - Base: ₹
                                {v.sellingPrice}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`entries.${index}.price`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
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
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="text-center p-6 text-text-muted border border-dashed rounded">
                  No prices added. Click &quot;Add Item&quot; to set pricing
                  rules.
                </div>
              )}
            </div>
            {form.formState.errors.entries?.root && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.entries.root.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 border-t border-border-default pt-6">
            <Link href="/dashboard/master-data/price-lists">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Saving..." : "Save Price List"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
