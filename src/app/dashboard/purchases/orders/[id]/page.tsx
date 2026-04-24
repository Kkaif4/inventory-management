"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Receipt,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  getPurchaseOrderById,
  acceptPurchaseOrder,
  createPurchaseBill,
} from "@/actions/procurement";
import { useOutletStore } from "@/store/use-outlet-store";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();

  const [po, setPo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isBilling, setIsBilling] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [freightCost, setFreightCost] = useState("0");
  const [itemsExpanded, setItemsExpanded] = useState(true);

  const loadPO = useCallback(async () => {
    if (!id || !currentOutletId) return;
    setIsLoading(true);
    try {
      const result = await getPurchaseOrderById(id, currentOutletId);
      if (result.success && result.data) {
        setPo(result.data);
      } else {
        toast.error(result.error?.message || "Failed to load purchase order");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load purchase order");
    } finally {
      setIsLoading(false);
    }
  }, [id, currentOutletId]);

  useEffect(() => {
    loadPO();
  }, [loadPO]);

  const handleAccept = async () => {
    if (!po || !currentOutletId || !session?.user?.id) {
      toast.error("Missing required information");
      return;
    }

    try {
      setIsAccepting(true);
      await acceptPurchaseOrder(po.id, currentOutletId, session.user.id);
      toast.success("Purchase Order accepted and stock updated");
      await loadPO();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept order");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCreateBill = async () => {
    if (!po || !session?.user?.id) {
      toast.error("Missing required information");
      return;
    }

    try {
      setIsBilling(true);
      await createPurchaseBill({
        sourceId: po.id,
        billNumber,
        billDate: new Date(billDate),
        freightCost: parseFloat(freightCost) || 0,
        userId: session.user.id,
      });

      toast.success("Purchase Bill generated successfully");
      setBillDialogOpen(false);
      await loadPO();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create bill");
    } finally {
      setIsBilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-48" />
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-slate-500">Purchase Order not found.</p>
        <Link
          href="/dashboard/purchases"
          className="text-blue-600 text-sm mt-4 inline-block"
        >
          ← Back to Purchase Orders
        </Link>
      </div>
    );
  }

  const totalPaid =
    po.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
  const outstanding = Math.max(0, po.grandTotal - totalPaid);

  const canAccept = po.status === "DRAFT" || po.status === "PENDING";
  const canCreateBill = po.status === "ACCEPTED" && po.billType !== "BILL";
  const canMakeBill =
    po.status === "ACCEPTED" || po.status === "PARTIALLY_PAID";

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/purchases"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {po.txnNumber}
              </h1>
              <StatusBadge status={po.status.toLowerCase()} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {format(new Date(po.date), "dd MMM yyyy")}
              {po.party ? ` · ${po.party.name}` : ""}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          {canAccept && (
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 h-9 text-sm font-bold shadow shadow-blue-100"
            >
              <Check className="w-4 h-4" />
              {isAccepting ? "Accepting..." : "Accept Order"}
            </Button>
          )}
          {canMakeBill && (
            <Button
              onClick={() => setBillDialogOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700 h-9 text-sm font-bold shadow shadow-green-100"
            >
              <Receipt className="w-4 h-4" />
              Generate Bill
            </Button>
          )}
        </div>
      </div>

      {/* Summary Block */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold">
              PO Total
            </p>
            <p className="text-2xl font-black text-slate-900">
              {fmt(po.grandTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold">
              Taxable Value
            </p>
            <p className="text-2xl font-black text-slate-900">
              {fmt(po.taxableValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold">
              Total Tax
            </p>
            <p className="text-2xl font-black text-slate-900">
              {fmt(po.totalTax || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold">Status</p>
            <p className="text-lg font-bold capitalize text-slate-900">
              {po.status}
            </p>
          </div>
        </div>
      </div>

      {/* Vendor & Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vendor Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
            Vendor Details
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Vendor Name</p>
              <p className="font-semibold text-slate-900">
                {po.party?.name || "N/A"}
              </p>
            </div>
            {po.party?.gstin && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">GSTIN</p>
                <p className="font-semibold text-slate-900">{po.party.gstin}</p>
              </div>
            )}
            {po.party?.state && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">State</p>
                <p className="font-semibold text-slate-900">{po.party.state}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
            Order Details
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Order Date</p>
              <p className="font-semibold text-slate-900">
                {format(new Date(po.date), "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Items Count</p>
              <p className="font-semibold text-slate-900">
                {po.items?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Reference</p>
              <p className="font-semibold text-slate-900 font-mono text-xs">
                {po.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setItemsExpanded(!itemsExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        >
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Order Items ({po.items?.length || 0})
          </h3>
          {itemsExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {itemsExpanded && (
          <div className="border-t border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                      Item
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                      Unit
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                      Rate
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                      Tax %
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {po.items?.map((item: any, idx: number) => {
                    const itemTotal =
                      (item.taxableValue || 0) +
                      (item.cgst || 0) +
                      (item.sgst || 0) +
                      (item.igst || 0);
                    const taxTotal =
                      (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
                    const taxRate = item.taxableValue
                      ? ((taxTotal / item.taxableValue) * 100).toFixed(0)
                      : "0";

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-5 py-3 text-sm font-medium text-slate-900">
                          <div>
                            <p className="font-semibold">
                              {item.variant?.product?.name || "N/A"}
                            </p>
                            {item.variant?.sku && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                SKU: {item.variant.sku}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-900 text-right">
                          {item.unit || "PCS"}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">
                          {fmt(item.rate || 0)}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">
                          {fmt(item.taxableValue || 0)}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">
                          {taxRate}%
                        </td>
                        <td className="px-5 py-3 text-sm font-black text-slate-900 text-right">
                          {fmt(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bill Dialog */}
      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Receipt className="w-5 h-5 text-green-600" />
              Generate Purchase Bill
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="billNumber"
                className="text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Bill Number
              </Label>
              <Input
                id="billNumber"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g., INV-001"
                className="rounded-lg h-10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="billDate"
                className="text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Bill Date
              </Label>
              <Input
                id="billDate"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="rounded-lg h-10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="freight"
                className="text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Freight / Carriage (₹)
              </Label>
              <Input
                id="freight"
                type="number"
                value={freightCost}
                onChange={(e) => setFreightCost(e.target.value)}
                className="rounded-lg h-10"
              />
              <p className="text-[10px] text-slate-400 italic">
                * This amount will be distributed proportionally across all
                items.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setBillDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBill}
              disabled={isBilling || !billNumber}
              className="bg-green-600 hover:bg-green-700 rounded-lg"
            >
              {isBilling ? "Creating..." : "Create Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
