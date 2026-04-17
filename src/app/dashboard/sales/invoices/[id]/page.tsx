"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Wallet,
  ChevronDown,
  ChevronUp,
  FileText,
  Receipt,
  Plus,
  Edit3,
  Check,
  X,
  Truck,
  MessageSquare,
  Percent,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { PaymentDrawer } from "@/components/sales/payment-drawer";
import { AppendItemsDrawer } from "@/components/sales/append-items-drawer";
import {
  getSalesInvoice,
  updateSalesInvoiceFreightAndRemarks,
} from "@/actions/sales/sales-invoice";
import { useOutletStore } from "@/store/use-outlet-store";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttachmentSection } from "@/components/attachments";

type Invoice = Awaited<ReturnType<typeof getSalesInvoice>>;

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();

  const [invoice, setInvoice] = useState<Invoice>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const [appendDrawerOpen, setAppendDrawerOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [attachmentCount, setAttachmentCount] = useState(0);

  // Editable fields for freight and remarks
  const [isEditingFreight, setIsEditingFreight] = useState(false);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [freightValue, setFreightValue] = useState("");
  const [remarksValue, setRemarksValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await getSalesInvoice(id);
    setInvoice(data);
    if (data) {
      setFreightValue(data.freightCost?.toString() || "0");
      setRemarksValue(data.remarks || "");
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleSaveFreight = async () => {
    if (!invoice) return;
    setIsSaving(true);
    try {
      const freight = parseFloat(freightValue) || 0;
      await updateSalesInvoiceFreightAndRemarks(invoice.id, {
        freightCost: freight,
        remarks: remarksValue,
      });
      toast.success("Freight cost updated successfully");
      setIsEditingFreight(false);
      loadInvoice();
    } catch (error) {
      toast.error("Failed to update freight cost");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRemarks = async () => {
    if (!invoice) return;
    setIsSaving(true);
    try {
      await updateSalesInvoiceFreightAndRemarks(invoice.id, {
        freightCost: parseFloat(freightValue) || 0,
        remarks: remarksValue,
      });
      toast.success("Remarks updated successfully");
      setIsEditingRemarks(false);
      loadInvoice();
    } catch (error) {
      toast.error("Failed to update remarks");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (invoice) {
      setFreightValue(invoice.freightCost?.toString() || "0");
      setRemarksValue(invoice.remarks || "");
    }
    setIsEditingFreight(false);
    setIsEditingRemarks(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-48" />
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500">Invoice not found.</p>
        <Link
          href="/dashboard/sales/invoices"
          className="text-blue-600 text-sm mt-4 inline-block"
        >
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  const totalPaid =
    invoice.billType === "OLD"
      ? (invoice as any).oldBillPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0
      : invoice.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const outstanding = Math.max(0, invoice.grandTotal - totalPaid);

  // Pay button visibility per FRD Section 2 & 10
  // NO1 always eligible; NO2 eligible only when linked to a party (customer on account)
  const canPay =
    ["NO1", "NO2"].includes(invoice.billType) &&
    invoice.party !== null &&
    ["POSTED", "PARTIALLY_PAID"].includes(invoice.status) &&
    outstanding > 0.005;

  // Add items button visibility
  const canAppend = ["POSTED", "PARTIALLY_PAID"].includes(invoice.status);

  // Edit button visibility for freight and remarks
  const canEdit = ["POSTED", "DRAFT"].includes(invoice.status);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

  // Calculate totals
  const totalLineDiscount = invoice.items.reduce(
    (sum, item) => sum + (item.discountAmount || 0),
    0,
  );
  const globalDiscount = invoice.globalDiscount || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sales/invoices"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {invoice.txnNumber}
              </h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-7 px-2 text-xs"
                onClick={() => {
                  const attachmentSection =
                    document.getElementById("attachment-section");
                  attachmentSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Paperclip className="w-3 h-3" />
                {attachmentCount > 0 && (
                  <span className="font-semibold">{attachmentCount}</span>
                )}
              </Button>
              <StatusBadge status={invoice.status.toLowerCase()} />
              {invoice.billType === "NO2" && (
                <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  Cash Memo
                </span>
              )}
              {invoice.billType === "OLD" && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  Historical Record
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(invoice.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {invoice.party
                ? ` · ${invoice.party.name}`
                : invoice.buyerName
                  ? ` · ${invoice.buyerName}`
                  : ""}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          {canAppend && (
            <Button
              onClick={() => setAppendDrawerOpen(true)}
              variant="outline"
              className="gap-2 h-9 text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Items
            </Button>
          )}
          {canPay && (
            <Button
              onClick={() => setPayDrawerOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9 text-sm font-bold shadow shadow-emerald-100"
            >
              <Wallet className="w-4 h-4" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Summary Block */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Invoice Total</p>
            <p className="text-lg font-black text-slate-900">
              {fmt(invoice.grandTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Taxable</p>
            <p className="text-lg font-bold text-slate-700">
              {fmt(invoice.totalTaxable)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Total Tax</p>
            <p className="text-lg font-bold text-slate-700">
              {fmt(invoice.totalTax)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">
              {invoice.status === "PAID" ? "Paid ✓" : "Outstanding"}
            </p>
            <p
              className={`text-lg font-black ${
                outstanding === 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {fmt(outstanding)}
            </p>
          </div>
        </div>

        {/* Discounts Summary */}
        {(totalLineDiscount > 0 || globalDiscount > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-4">
            {totalLineDiscount > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Line Discount
                </p>
                <p className="text-sm font-bold text-orange-600">
                  -{fmt(totalLineDiscount)}
                </p>
              </div>
            )}
            {globalDiscount > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Global Discount
                </p>
                <p className="text-sm font-bold text-orange-600">
                  -{fmt(globalDiscount)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Freight and Remarks Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
            Additional Details
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Freight Cost */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <Label className="text-xs text-slate-500 uppercase tracking-tight font-semibold">
                Freight Cost
              </Label>
              {canEdit && !isEditingFreight && (
                <button
                  onClick={() => setIsEditingFreight(true)}
                  className="ml-auto p-1 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Edit freight"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
            {isEditingFreight ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={freightValue}
                    onChange={(e) => setFreightValue(e.target.value)}
                    className="pl-7 h-9 font-mono"
                    step="0.01"
                    min="0"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSaveFreight}
                  disabled={isSaving}
                  className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="h-9 px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <p className="text-lg font-bold text-slate-700 font-mono">
                {fmt(invoice.freightCost || 0)}
              </p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <Label className="text-xs text-slate-500 uppercase tracking-tight font-semibold">
                Remarks
              </Label>
              {canEdit && !isEditingRemarks && (
                <button
                  onClick={() => setIsEditingRemarks(true)}
                  className="ml-auto p-1 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Edit remarks"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
            {isEditingRemarks ? (
              <div className="space-y-2">
                <Input
                  value={remarksValue}
                  onChange={(e) => setRemarksValue(e.target.value)}
                  placeholder="Add remarks..."
                  className="h-9"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveRemarks}
                    disabled={isSaving}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-8 px-3"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700">
                {invoice.remarks || (
                  <span className="text-slate-400 italic">No remarks</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
            Line Items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-tight">
                <th className="text-left px-5 py-2.5">Product</th>
                <th className="text-right px-5 py-2.5">Qty</th>
                <th className="text-right px-5 py-2.5">Rate</th>
                {(invoice.items.some(
                  (item) => item.discountPercent && item.discountPercent > 0,
                ) ||
                  totalLineDiscount > 0) && (
                  <th className="text-right px-5 py-2.5">Discount</th>
                )}
                <th className="text-right px-5 py-2.5">Taxable</th>
                <th className="text-right px-5 py-2.5">Tax</th>
                <th className="text-right px-5 py-2.5">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoice.items.map((item) => {
                const tax = item.cgst + item.sgst + item.igst;
                const lineTotal = item.taxableValue + tax;
                const hasLineDiscount =
                  (item.discountPercent && item.discountPercent > 0) ||
                  (item.discountAmount && item.discountAmount > 0);
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-900 uppercase tracking-tight">
                        {item.variant?.product?.name || item.itemDescription || "—"}
                      </p>
                      {item.variant && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.variant.sku}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700">
                      {fmt(item.rate)}
                    </td>
                    {(invoice.items.some(
                      (i) =>
                        (i.discountPercent && i.discountPercent > 0) ||
                        (i.discountAmount && i.discountAmount > 0),
                    ) ||
                      totalLineDiscount > 0) && (
                      <td className="px-5 py-3 text-right">
                        {hasLineDiscount ? (
                          <div className="flex flex-col items-end">
                            {item.discountPercent &&
                              item.discountPercent > 0 && (
                                <span className="text-xs text-orange-500 font-medium">
                                  {item.discountPercent}%
                                </span>
                              )}
                            {item.discountAmount && item.discountAmount > 0 && (
                              <span className="text-xs text-orange-600 font-bold">
                                -{fmt(item.discountAmount)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3 text-right font-mono text-slate-700">
                      {fmt(item.taxableValue)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-500 text-xs">
                      {fmt(tax)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">
                      {fmt(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                Payment History
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {invoice.billType === "OLD" 
                  ? `${(invoice as any).oldBillPayments?.length ?? 0} historical entry`
                  : `${invoice.payments?.length ?? 0} receipt`}
                {(invoice.billType === "OLD" ? ((invoice as any).oldBillPayments?.length ?? 0) : (invoice.payments?.length ?? 0)) > 1 ? "s" : ""}
              </span>
            </div>
            {historyExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {historyExpanded && (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-tight">
                    <th className="text-left px-5 py-2.5">Receipt #</th>
                    <th className="text-left px-5 py-2.5">Date</th>
                    <th className="text-left px-5 py-2.5">Mode</th>
                    <th className="text-left px-5 py-2.5">Reference</th>
                    <th className="text-right px-5 py-2.5">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoice.billType === "OLD" ? (
                    (invoice as any).oldBillPayments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono font-bold text-slate-800 text-xs">
                          {invoice.txnNumber}-PAY
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-xs">
                          {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            Historical Payment
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs font-mono">
                          {p.note || "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-700">
                          {fmt(p.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    invoice.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono font-bold text-slate-800 text-xs">
                          {p.txnNumber}
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-xs">
                          {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {p.paymentMode === "ONLINE_TRANSFER"
                              ? "Bank Transfer"
                              : p.paymentMode}
                            {p.account ? ` · ${p.account.name}` : ""}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs font-mono">
                          {p.referenceNo || "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-700">
                          {fmt(p.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-tight"
                    >
                      Total Paid
                    </td>
                    <td className="px-5 py-2.5 text-right font-black text-emerald-700">
                      {fmt(totalPaid)}
                    </td>
                  </tr>
                  {outstanding > 0.005 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-tight"
                      >
                        Still Outstanding
                      </td>
                      <td className="px-5 py-2.5 text-right font-black text-red-600">
                        {fmt(outstanding)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attachments Section */}
      {invoice && (
        <div
          id="attachment-section"
          className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto"
        >
          <AttachmentSection
            moduleType="INVOICE"
            referenceId={invoice.id}
            className="mt-6"
            onAttachmentCountChange={setAttachmentCount}
          />
        </div>
      )}

      {/* Add Items Drawer */}
      {canAppend && session?.user?.id && (
        <AppendItemsDrawer
          open={appendDrawerOpen}
          onClose={() => setAppendDrawerOpen(false)}
          invoice={{
            id: invoice.id,
            txnNumber: invoice.txnNumber,
            outletId: invoice.outletId,
            billType: invoice.billType,
            status: invoice.status,
            partyId: invoice.partyId,
          }}
          userId={session.user.id}
          onSuccess={loadInvoice}
        />
      )}

      {/* Payment Drawer */}
      {canPay && invoice.party && session?.user?.id && (
        <PaymentDrawer
          open={payDrawerOpen}
          onClose={() => setPayDrawerOpen(false)}
          invoice={{
            id: invoice.id,
            txnNumber: invoice.txnNumber,
            grandTotal: invoice.grandTotal,
            totalPaid,
            partyId: invoice.party.id,
            partyName: invoice.party.name,
            outletId: invoice.outletId,
            date: invoice.date.toISOString().split("T")[0],
          }}
          userId={session.user.id}
          onSuccess={loadInvoice}
        />
      )}
    </div>
  );
}
