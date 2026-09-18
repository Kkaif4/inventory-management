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
  Edit,
  QrCode,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  getPurchaseOrderById,
  acceptPurchaseOrder,
  createPurchaseBill,
  updatePurchaseOrder,
  addPurchaseSerialNumbers,
} from "@/actions/procurement";
import { getOutletById } from "@/actions/locations";
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
import { roundToTwo } from "@/lib/utils";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();

  const [po, setPo] = useState<any>(null);
  const [outlet, setOutlet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isBilling, setIsBilling] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [freightCost, setFreightCost] = useState("0");
  const [isRoundOffBill, setIsRoundOffBill] = useState(false);
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [serialNumbersText, setSerialNumbersText] = useState<Record<string, string>>({});

  // Serial Manager State (for adding serials later)
  const [serialManagerOpen, setSerialManagerOpen] = useState(false);
  const [newSerialsText, setNewSerialsText] = useState<Record<string, string>>({});
  const [isSavingSerials, setIsSavingSerials] = useState(false);

  // Edit PO State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editFreightCost, setEditFreightCost] = useState("0");
  const [editCustomBillNo, setEditCustomBillNo] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editItems, setEditItems] = useState<any[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  useEffect(() => {
    if (!currentOutletId) return;
    getOutletById(currentOutletId).then((res) => {
      if (res.success) setOutlet(res.data);
    });
  }, [currentOutletId]);

  const handleAcceptClick = () => {
    if (!po) return;
    const hasSerial = po.items.some((item: any) => item.variant?.product?.hasSerialNumbers);
    if (hasSerial) {
      const init: Record<string, string> = {};
      po.items.forEach((item: any) => {
        if (item.variant?.product?.hasSerialNumbers) {
          init[item.variantId] = "";
        }
      });
      setSerialNumbersText(init);
      setAcceptDialogOpen(true);
    } else {
      handleAccept();
    }
  };

  const handleAccept = async () => {
    if (!po || !currentOutletId || !session?.user?.id) {
      toast.error("Missing required information");
      return;
    }

    const serialNumbersPayload: Record<string, string[]> = {};
    const hasSerial = po.items.some((item: any) => item.variant?.product?.hasSerialNumbers);

    if (hasSerial) {
      for (const item of po.items) {
        if (item.variant?.product?.hasSerialNumbers) {
          const text = serialNumbersText[item.variantId] || "";
          const sns = text
            .split("\n")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

          if (sns.length > item.quantity) {
            toast.error(
              `Product "${item.variant?.product?.name || "Item"}" cannot have more than ${item.quantity} serial number(s). You entered ${sns.length}.`,
            );
            return;
          }
          if (sns.length > 0) {
            serialNumbersPayload[item.variantId] = sns;
          }
        }
      }
    }

    try {
      setIsAccepting(true);
      const res = await acceptPurchaseOrder(
        po.id,
        currentOutletId,
        session.user.id,
        serialNumbersPayload,
      );
      if (res.success) {
        toast.success("Purchase Order accepted and stock updated");
        setAcceptDialogOpen(false);
        await loadPO();
        router.refresh();
      } else {
        toast.error(res.error?.message || "Failed to accept order");
      }
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
      const res = await createPurchaseBill({
        sourceId: po.id,
        billNumber,
        billDate: new Date(billDate),
        freightCost: parseFloat(freightCost) || 0,
        isRoundOff: isRoundOffBill,
        userId: session.user.id,
      });

      if (res.success) {
        toast.success("Purchase Bill generated successfully");
        setBillDialogOpen(false);
        await loadPO();
        router.refresh();
      } else {
        toast.error(res.error?.message || "Failed to create bill");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create bill");
    } finally {
      setIsBilling(false);
    }
  };

  const handleOpenEdit = () => {
    if (!po) return;
    setEditDate(format(new Date(po.date), "yyyy-MM-dd"));
    setEditFreightCost(String(po.freightCost || 0));
    setEditCustomBillNo(po.customBillNo || "");
    setEditRemarks(po.remarks || "");
    setEditItems(
      po.items.map((i: any) => {
        const taxTotal = (i.cgst || 0) + (i.sgst || 0) + (i.igst || 0);
        const gstPercent =
          i.taxableValue > 0
            ? Math.round((taxTotal / i.taxableValue) * 100)
            : 18;

        return {
          id: i.id,
          variantId: i.variantId,
          name: i.variant?.product?.name || "Item",
          sku: i.variant?.sku || "",
          quantity: i.quantity,
          unit: i.unit || "PCS",
          conversionRatio: i.conversionRatio || 1,
          rate: i.rate,
          gstPercent,
        };
      }),
    );
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!po || !currentOutletId || !session?.user?.id) return;
    if (editItems.length === 0) {
      toast.error("Order must contain at least one item");
      return;
    }

    for (const item of editItems) {
      if (!item.quantity || Number(item.quantity) <= 0) {
        toast.error(`Quantity for "${item.name}" must be greater than 0`);
        return;
      }
      if (item.rate === undefined || Number(item.rate) < 0) {
        toast.error(`Rate for "${item.name}" cannot be negative`);
        return;
      }
    }

    try {
      setIsSavingEdit(true);
      const isInterState =
        outlet?.state &&
        po.party?.state &&
        outlet.state.trim().toLowerCase() !==
          po.party.state.trim().toLowerCase();

      const itemsPayload = editItems.map((item) => {
        const taxableValue = roundToTwo(Number(item.quantity) * Number(item.rate));
        const taxTotal = roundToTwo(
          taxableValue * ((Number(item.gstPercent) || 0) / 100),
        );

        return {
          variantId: item.variantId,
          quantity: Number(item.quantity),
          unit: item.unit,
          conversionRatio: item.conversionRatio,
          rate: Number(item.rate),
          taxableValue,
          cgst: isInterState ? 0 : roundToTwo(taxTotal / 2),
          sgst: isInterState ? 0 : roundToTwo(taxTotal / 2),
          igst: isInterState ? taxTotal : 0,
        };
      });

      const res = await updatePurchaseOrder(po.id, currentOutletId, session.user.id, {
        date: editDate,
        freightCost: parseFloat(editFreightCost) || 0,
        customBillNo: editCustomBillNo.trim() || undefined,
        remarks: editRemarks.trim() || undefined,
        items: itemsPayload,
      });

      if (res.success) {
        toast.success("Purchase Order updated successfully");
        setEditDialogOpen(false);
        await loadPO();
      } else {
        toast.error(res.error?.message || "Failed to update order");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenSerialManager = () => {
    if (!po) return;
    const init: Record<string, string> = {};
    po.items.forEach((item: any) => {
      if (item.variant?.product?.hasSerialNumbers) {
        init[item.variantId] = "";
      }
    });
    setNewSerialsText(init);
    setSerialManagerOpen(true);
  };

  const handleSaveNewSerials = async () => {
    if (!po || !currentOutletId || !session?.user?.id) return;

    const payload: Record<string, string[]> = {};
    for (const [variantId, text] of Object.entries(newSerialsText)) {
      const sns = text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (sns.length > 0) {
        payload[variantId] = sns;
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.error("Please enter at least one serial number to add");
      return;
    }

    try {
      setIsSavingSerials(true);
      const res = await addPurchaseSerialNumbers({
        poId: po.id,
        outletId: currentOutletId,
        userId: session.user.id,
        serialNumbers: payload,
      });

      if (res.success) {
        toast.success(
          `Successfully registered ${res.data?.count || 0} serial number(s)`,
        );
        setSerialManagerOpen(false);
        await loadPO();
      } else {
        toast.error(res.error?.message || "Failed to add serial numbers");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add serial numbers");
    } finally {
      setIsSavingSerials(false);
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

  const hasSerialItems = po.items?.some(
    (item: any) => item.variant?.product?.hasSerialNumbers,
  );
  const canAccept =
    po.status !== "ACCEPTED" &&
    po.status !== "COMPLETED" &&
    po.status !== "CANCELLED";
  const canEdit =
    po.status !== "ACCEPTED" &&
    po.status !== "COMPLETED" &&
    po.status !== "CANCELLED";
  const canMakeBill =
    po.status === "ACCEPTED" || po.status === "PARTIALLY_PAID";

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  // Edit modal totals calculation
  const editTaxable = editItems.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
    0,
  );
  const editTax = editItems.reduce(
    (acc, it) =>
      acc +
      ((Number(it.quantity) || 0) *
        (Number(it.rate) || 0) *
        (Number(it.gstPercent) || 0)) /
        100,
    0,
  );
  const editGrandTotal =
    editTaxable + editTax + (parseFloat(editFreightCost) || 0);

  // Bill dialog grand total
  const billGrandTotal =
    (po.totalTaxable || 0) +
    (po.totalTax || 0) +
    (parseFloat(freightCost) || 0);

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
          {canEdit && (
            <Button
              variant="outline"
              onClick={handleOpenEdit}
              className="gap-2 h-9 text-sm font-semibold border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Edit className="w-4 h-4 text-slate-600" />
              Edit Order
            </Button>
          )}

          {hasSerialItems && (
            <Button
              variant="outline"
              onClick={handleOpenSerialManager}
              className="gap-2 h-9 text-sm font-semibold border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              Serial Numbers
            </Button>
          )}

          {canAccept && (
            <Button
              onClick={handleAcceptClick}
              disabled={isAccepting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 h-9 text-sm font-bold shadow shadow-blue-100 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isAccepting ? "Accepting..." : "Accept Order"}
            </Button>
          )}
          {canMakeBill && (
            <Button
              onClick={() => setBillDialogOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700 h-9 text-sm font-bold shadow shadow-green-100 cursor-pointer"
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
            <p className="text-xs text-slate-500 mb-1 font-semibold">PO Total</p>
            <p className="text-2xl font-black text-slate-900">
              {fmt(po.grandTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-semibold">
              Taxable Value
            </p>
            <p className="text-2xl font-black text-slate-900">
              {fmt(po.totalTaxable ?? 0)}
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
                {po.customBillNo || po.txnNumber}
              </p>
            </div>
            {po.freightCost ? (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Freight Charges</p>
                <p className="font-semibold text-slate-900">
                  {fmt(po.freightCost)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setItemsExpanded(!itemsExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
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
                      Taxable
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

                    const isSerialized =
                      item.variant?.product?.hasSerialNumbers;
                    const registeredCount =
                      item.purchaseSerialNumbers?.length || 0;

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
                            {isSerialized && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                  Serials: {registeredCount} / {item.quantity}
                                </span>
                                {item.purchaseSerialNumbers &&
                                  item.purchaseSerialNumbers.length > 0 && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      (
                                      {item.purchaseSerialNumbers
                                        .map((s: any) => s.serialNumber)
                                        .join(", ")}
                                      )
                                    </span>
                                  )}
                              </div>
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

      {/* Accept PO Serial Number Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Check className="w-5 h-5 text-blue-600" />
              Serial Numbers (Optional)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-xs text-slate-500">
              Enter serial numbers (one per line) for warranty tracking. Serial
              numbers are optional at acceptance and can also be added later.
            </p>
            {po.items
              ?.filter((item: any) => item.variant?.product?.hasSerialNumbers)
              .map((item: any) => (
                <div key={item.variantId} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>{item.variant?.product?.name}</span>
                    <span className="text-slate-400 font-normal">
                      Max {item.quantity} serial(s)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter serial numbers (one per line)..."
                    value={serialNumbersText[item.variantId] || ""}
                    onChange={(e) =>
                      setSerialNumbersText((prev) => ({
                        ...prev,
                        [item.variantId]: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setAcceptDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {isAccepting ? "Accepting..." : "Accept & Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Serial Numbers Later Dialog */}
      <Dialog open={serialManagerOpen} onOpenChange={setSerialManagerOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <QrCode className="w-5 h-5 text-blue-600" />
              Manage Serial Numbers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-500">
              Register additional serial numbers for products in this purchase
              order.
            </p>
            {po.items
              ?.filter((item: any) => item.variant?.product?.hasSerialNumbers)
              .map((item: any) => {
                const registered = item.purchaseSerialNumbers || [];
                const remaining = Math.max(0, item.quantity - registered.length);

                return (
                  <div
                    key={item.variantId}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>{item.variant?.product?.name}</span>
                      <span className="text-blue-600">
                        {registered.length} / {item.quantity} registered
                      </span>
                    </div>

                    {registered.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[11px] font-mono text-slate-600">
                        {registered.map((s: any) => (
                          <span
                            key={s.id}
                            className="bg-white px-2 py-0.5 rounded border border-slate-200"
                          >
                            {s.serialNumber}
                          </span>
                        ))}
                      </div>
                    )}

                    {remaining > 0 ? (
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Add remaining {remaining} serial(s) (one per line):
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. SN-98721&#10;SN-98722"
                          value={newSerialsText[item.variantId] || ""}
                          onChange={(e) =>
                            setNewSerialsText((prev) => ({
                              ...prev,
                              [item.variantId]: e.target.value,
                            }))
                          }
                          className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium">
                        ✓ All {item.quantity} serial numbers registered.
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSerialManagerOpen(false)}
              className="rounded-lg"
            >
              Close
            </Button>
            <Button
              onClick={handleSaveNewSerials}
              disabled={isSavingSerials}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {isSavingSerials ? "Saving..." : "Save Serial Numbers"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Purchase Order ({po.txnNumber})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-600">
                  Order Date
                </Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="rounded-lg h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-600">
                  Freight Charges (₹)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFreightCost}
                  onChange={(e) => setEditFreightCost(e.target.value)}
                  className="rounded-lg h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-600">
                  Reference / Bill No
                </Label>
                <Input
                  value={editCustomBillNo}
                  onChange={(e) => setEditCustomBillNo(e.target.value)}
                  placeholder="Optional reference"
                  className="rounded-lg h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-600">
                  Remarks / Notes
                </Label>
                <Input
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="Optional notes"
                  className="rounded-lg h-9"
                />
              </div>
            </div>

            {/* Edit Items List */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold uppercase text-slate-600">
                Order Items
              </Label>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {editItems.map((item, index) => {
                  const lineTaxable =
                    (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                  const lineTotal =
                    lineTaxable +
                    (lineTaxable * (Number(item.gstPercent) || 0)) / 100;

                  return (
                    <div
                      key={item.variantId || index}
                      className="p-3 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-[140px]">
                        <p className="font-bold text-slate-800 truncate">
                          {item.name}
                        </p>
                        {item.sku && (
                          <p className="text-[10px] text-slate-400">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>

                      <div className="w-20">
                        <Label className="text-[10px] text-slate-500">Qty</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditItems((prev) =>
                              prev.map((it, i) =>
                                i === index ? { ...it, quantity: val } : it,
                              ),
                            );
                          }}
                          className="h-8 text-xs font-semibold text-center"
                        />
                      </div>

                      <div className="w-24">
                        <Label className="text-[10px] text-slate-500">Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.rate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditItems((prev) =>
                              prev.map((it, i) =>
                                i === index ? { ...it, rate: val } : it,
                              ),
                            );
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div className="w-16">
                        <Label className="text-[10px] text-slate-500">GST %</Label>
                        <select
                          value={item.gstPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditItems((prev) =>
                              prev.map((it, i) =>
                                i === index ? { ...it, gstPercent: val } : it,
                              ),
                            );
                          }}
                          className="w-full h-8 px-1 border border-slate-200 rounded text-xs bg-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>

                      <div className="w-24 text-right">
                        <Label className="text-[10px] text-slate-500">Total</Label>
                        <p className="font-bold text-slate-900 pt-1">
                          {fmt(lineTotal)}
                        </p>
                      </div>

                      {editItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditItems((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="text-slate-400 hover:text-red-500 p-1 mt-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edit Breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>{fmt(editTaxable)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax</span>
                <span>{fmt(editTax)}</span>
              </div>
              {parseFloat(editFreightCost) > 0 && (
                <div className="flex justify-between">
                  <span>Freight Charges</span>
                  <span>{fmt(parseFloat(editFreightCost) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount</span>
                <span>{fmt(editGrandTotal)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Bill Number *
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
                Bill Date *
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
                Freight / Carriage Charges (₹)
              </Label>
              <Input
                id="freight"
                type="number"
                step="0.01"
                min="0"
                value={freightCost}
                onChange={(e) => setFreightCost(e.target.value)}
                className="rounded-lg h-10"
              />
              <p className="text-[10px] text-slate-400 italic">
                * This amount will be distributed proportionally across all items.
              </p>
            </div>

            {/* Round Off Checkbox */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRoundOffBill}
                  onChange={(e) => setIsRoundOffBill(e.target.checked)}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                />
                <span>Round Off Grand Total</span>
              </label>
              <span className="text-xs font-mono font-bold text-slate-800">
                Total: {fmt(isRoundOffBill ? Math.round(billGrandTotal) : billGrandTotal)}
              </span>
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
              disabled={isBilling || !billNumber.trim()}
              className="bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer"
            >
              {isBilling ? "Generating..." : "Confirm & Create Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
