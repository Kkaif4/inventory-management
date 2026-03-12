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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { createPurchaseRequest } from "@/actions/purchases/requests";
import { useOutletStore } from "@/store/use-outlet-store";
import { AlertTriangle } from "lucide-react";

const formSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Please select a variant."),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "Add at least one item to request."),
});

export function PRForm({ variants }: { variants: any[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      items: [{ variantId: "", quantity: 1 }],
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
      await createPurchaseRequest({
        items: data.items,
        outletId: currentOutletId,
        userId: session.user.id,
      });
      router.push("/dashboard/purchases/requests");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <PageHeader
        title="Create Purchase Request"
        subtitle="Raise a PR for management approval"
        breadcrumbs={[
          { label: "Purchases", href: "/dashboard/purchases" },
          { label: "Requests", href: "/dashboard/purchases/requests" },
          { label: "New Array" },
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                Requested Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ variantId: "", quantity: 1 })}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 py-2 bg-surface-muted rounded text-xs font-bold text-text-secondary uppercase tracking-wider">
                <div className="col-span-8">Product / Variant</div>
                <div className="col-span-3">Quantity</div>
                <div className="col-span-1 text-center">Delete</div>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  <FormField
                    control={form.control as any}
                    name={`items.${index}.variantId`}
                    render={({ field }) => (
                      <FormItem className="col-span-8">
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
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
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input type="number" min="1" {...field} />
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
                  No items added to request.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-border-default pt-6">
            <Link href="/dashboard/purchases/requests">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Submitting..." : "Submit PR"}
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
                navigation bar before raising a purchase request.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/purchases/requests")}
              variant="outline"
              className="w-full py-6 rounded-2xl font-bold"
            >
              Go Back to Requests
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
