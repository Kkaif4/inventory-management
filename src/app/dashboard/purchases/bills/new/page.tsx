"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createPurchaseBill, getGRNs } from "@/actions/procurement";
import { Receipt, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const billSchema = z.object({
  grnId: z.string().min(1, "Select a GRN"),
  billNumber: z.string().min(1, "Vendor Bill No. is required"),
  billDate: z.string().min(1, "Bill Date is required"),
  freightCost: z.coerce.number().min(0).optional(),
});

type BillFormValues = z.infer<typeof billSchema>;

export default function NewPurchaseBillPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grns, setGRNs] = useState<any[]>([]);
  const [selectedGRN, setSelectedGRN] = useState<any>(null);

  useEffect(() => {
    getGRNs().then(setGRNs);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema) as any,
    defaultValues: {
      billDate: new Date().toISOString().split("T")[0],
      freightCost: 0,
    },
  });

  const handleGRNSelect = (id: string) => {
    const grn = grns.find((g) => g.id === id);
    setSelectedGRN(grn || null);
    setValue("grnId", id);
  };

  const onSubmit = async (data: BillFormValues) => {
    try {
      setIsSubmitting(true);
      await createPurchaseBill({
        grnId: data.grnId,
        billNumber: data.billNumber,
        billDate: new Date(data.billDate),
        freightCost: data.freightCost,
      });
      router.push("/dashboard/purchases/bills");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Purchase Bill</h2>
            <p className="text-sm text-slate-500">
              Record vendor invoice and finalize costs.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select GRN *
              </label>
              <select
                {...register("grnId")}
                onChange={(e) => handleGRNSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Pending GRN...</option>
                {grns.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.txnNumber} - {g.party?.name}
                  </option>
                ))}
              </select>
              {errors.grnId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.grnId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor Bill No. *
                </label>
                <input
                  {...register("billNumber")}
                  placeholder="Invoice #"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.billNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.billNumber.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bill Date *
                </label>
                <input
                  type="date"
                  {...register("billDate")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {selectedGRN && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Billed Item</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-6 py-3 text-right">Rate</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedGRN.items.map((item: any) => (
                      <tr key={item.id} className="text-sm">
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-900">
                            {item.variant.product.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.variant.sku}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-3 text-right">
                          ₹{item.rate.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-right font-medium">
                          ₹{item.taxableValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start pt-4">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Freight / Octroi Charges
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      {...register("freightCost")}
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Distributed across items for landed cost.
                  </p>
                </div>

                <div className="w-80 bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-100">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Sub-Total</span>
                    <span>
                      ₹
                      {selectedGRN.items
                        .reduce((a: any, b: any) => a + b.taxableValue, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Total Tax</span>
                    <span>
                      ₹
                      {selectedGRN.items
                        .reduce(
                          (a: any, b: any) => a + b.cgst + b.sgst + b.igst,
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Payable Amount</span>
                    <span>
                      ₹
                      {selectedGRN.items
                        .reduce(
                          (a: any, b: any) =>
                            a + (b.taxableValue + b.cgst + b.sgst + b.igst),
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg flex items-center shadow-lg disabled:opacity-50 transition-all"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Processing..." : "Issue Purchase Bill"}
                </button>
              </div>
            </div>
          )}

          {!selectedGRN && (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <div className="flex flex-col items-center">
                <Receipt className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-400">
                  Select a GRN to convert into a Purchase Bill.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
