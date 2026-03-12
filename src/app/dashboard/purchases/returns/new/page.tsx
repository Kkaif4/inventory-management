"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDebitNote, getBills } from "@/actions/procurement";
import { Undo2, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";

const dnSchema = z.object({
  billId: z.string().min(1, "Select a Bill"),
  reason: z.string().min(3, "Reason is required"),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        sku: z.string(),
        productName: z.string(),
        billedQty: z.number(),
        quantity: z.coerce.number().min(0),
      }),
    )
    .min(1),
});

type DNFormValues = z.infer<typeof dnSchema>;

export default function NewDebitNotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const { currentOutlet } = useOutletStore();
  if (!currentOutlet) {
    return;
  }
  useEffect(() => {
    getBills(currentOutlet.id).then(setBills);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DNFormValues>({
    resolver: zodResolver(dnSchema) as any,
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "items",
  });

  const handleBillSelect = (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (!bill) {
      setSelectedBill(null);
      replace([]);
      return;
    }

    setSelectedBill(bill);
    const returnItems = bill.items.map((item: any) => ({
      variantId: item.variantId,
      sku: item.variant.sku,
      productName: item.variant.product.name,
      billedQty: item.quantity,
      quantity: 0, // Default to 0 for return
    }));

    replace(returnItems);
    setValue("billId", id);
  };

  const onSubmit = async (data: DNFormValues) => {
    try {
      setIsSubmitting(true);
      const itemsToReturn = data.items.filter((i) => i.quantity > 0);

      if (itemsToReturn.length === 0) {
        toast.error("Enter at least one item to return");
        return;
      }

      await createDebitNote({
        billId: data.billId,
        reason: data.reason,
        items: itemsToReturn.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        userId: session?.user?.id!,
      });
      router.push("/dashboard/inventory/current-stock");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process Debit Note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <Undo2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Purchase Return (Debit Note)
            </h2>
            <p className="text-sm text-slate-500">
              Return items to vendor and deduct stock.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/inventory/current-stock"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Purchase Bill *
              </label>
              <select
                {...register("billId")}
                onChange={(e) => handleBillSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
              >
                <option value="">Select Bill...</option>
                {bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.txnNumber} - {b.party?.name}
                  </option>
                ))}
              </select>
              {errors.billId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.billId.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Return *
              </label>
              <input
                {...register("reason")}
                placeholder="e.g. Damaged goods, wrong item..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {selectedBill && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Items
                for Return
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Item / SKU</th>
                      <th className="px-4 py-3 text-center">Billed Qty</th>
                      <th className="px-6 py-3 w-48 text-right text-red-600">
                        Return Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fields.map((field, index) => (
                      <tr key={field.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {field.productName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {field.sku}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-slate-600 font-medium">
                          {field.billedQty}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.quantity` as const)}
                            className="w-32 px-3 py-1.5 text-sm border border-red-200 rounded-md text-right focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-10 py-3 rounded-lg hover:bg-red-700 font-bold text-lg flex items-center shadow-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Processing..." : "Issue Debit Note"}
                </button>
              </div>
            </div>
          )}

          {!selectedBill && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <div className="flex flex-col items-center">
                <Undo2 className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-400">
                  Select a Purchase Bill to begin the return process.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
