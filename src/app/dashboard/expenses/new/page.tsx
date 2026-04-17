"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createExpenseSchema } from "@/validations/expense.validation";
import type { CreateExpenseInput, ExpenseCategoryDetail } from "@/types/expense.types";
import type { Party } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useOutletStore } from "@/store/use-outlet-store";
import { getExpenseCategories } from "@/actions/expenses/categories";
import { getOutletAccounts } from "@/actions/accounts";
import { getParties } from "@/actions/parties";
import { createExpense } from "@/actions/expenses";

export default function NewExpensePage() {
  const router = useRouter();
  const currentOutletId = useOutletStore((state) => state.currentOutlet?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategoryDetail[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<"DRAFT" | "POSTED">("POSTED");

  const form = useForm<z.infer<typeof createExpenseSchema>>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      outletId: currentOutletId,
      date: new Date(),
      categoryId: "",
      accountId: "",
      description: "",
      paymentMode: "CASH",
      taxableAmount: 0,
      gstRate: undefined,
      inputGst: 0,
      vendorId: undefined,
    } as any,
  });

  // Load dropdown options
  useEffect(() => {
    if (!currentOutletId) return;

    const loadData = async () => {
      try {
        const [categoriesRes, accountsRes, partiesRes] = await Promise.all([
          getExpenseCategories(currentOutletId),
          getOutletAccounts(currentOutletId),
          getParties(currentOutletId),
        ]);

        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        if (accountsRes.success) setAccounts(accountsRes.data || []);
        if (partiesRes.success) {
          const vendorList = (partiesRes.data || []).filter(
            (p) => p.type === "VENDOR"
          );
          setVendors(vendorList);
        }
      } catch (error) {
        toast.error("Failed to load form options");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentOutletId]);

  const onSubmit = async (data: z.infer<typeof createExpenseSchema>) => {
    if (!currentOutletId) {
      toast.error("No outlet selected");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData: CreateExpenseInput = {
        ...data,
        outletId: currentOutletId,
        status: submitStatus,
        vendorId: data.vendorId || undefined, // Convert empty string to undefined
      };

      const res = await createExpense(submitData);

      if (!res.success) {
        toast.error(res.error?.message || "Failed to create expense");
        return;
      }

      toast.success(
        submitStatus === "DRAFT"
          ? "Expense saved as draft"
          : "Expense created successfully"
      );
      router.push(`/dashboard/expenses/${res.data?.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const taxableAmount = form.watch("taxableAmount") || 0;
  const gstRate = form.watch("gstRate") || 0;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const totalAmount = taxableAmount + gstAmount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Create Expense</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a new expense to track your business spending
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Date & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => {
                  const selectedCat = categories.find((c) => c.id === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category">
                              {selectedCat ? `${selectedCat.name}` : "Select category"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the expense..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vendor & Payment Mode Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => {
                  const selectedVendor = vendors.find((v) => v.id === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Vendor (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value || undefined)
                        }
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor">
                              {selectedVendor ? selectedVendor.name : "Select vendor"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="ONLINE_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => {
                const selectedAccount = accounts.find((a) => a.id === field.value);
                return (
                  <FormItem>
                    <FormLabel>Account *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account">
                            {selectedAccount
                              ? `${selectedAccount.name} (${selectedAccount.type})`
                              : "Select account"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Amount & GST Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="taxableAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxable Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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

              <FormField
                control={form.control}
                name="gstRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Rate (%)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(
                          value ? parseFloat(value) : undefined
                        )
                      }
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select GST rate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No GST</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Display computed amounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  GST Amount
                </p>
                <p className="text-lg font-bold text-slate-900">
                  ₹{gstAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  Taxable Amount
                </p>
                <p className="text-lg font-bold text-slate-900">
                  ₹{taxableAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  Total Amount
                </p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                className="flex-1 bg-gray-600 hover:bg-gray-700"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitStatus("DRAFT");
                  form.handleSubmit(onSubmit)();
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitStatus("POSTED");
                  form.handleSubmit(onSubmit)();
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Post Expense"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
