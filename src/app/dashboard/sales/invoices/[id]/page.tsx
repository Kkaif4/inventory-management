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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { PaymentDrawer } from "@/components/sales/payment-drawer";
import { getSalesInvoice } from "@/actions/sales/sales-invoice";
import { useOutletStore } from "@/store/use-outlet-store";
import { useSession } from "next-auth/react";

type Invoice = Awaited<ReturnType<typeof getSalesInvoice>>;

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();

  const [invoice, setInvoice] = useState<Invoice>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await getSalesInvoice(id);
    setInvoice(data);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

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
    invoice.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const outstanding = Math.max(0, invoice.grandTotal - totalPaid);

  // Pay button visibility per FRD Section 2 & 10
  const canPay =
    invoice.billType === "NO1" &&
    ["POSTED", "PARTIALLY_PAID"].includes(invoice.status) &&
    outstanding > 0.005;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n);

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
              <StatusBadge status={invoice.status.toLowerCase()} />
              {invoice.billType === "NO2" && (
                <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  Cash Memo
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
                <th className="text-right px-5 py-2.5">Taxable</th>
                <th className="text-right px-5 py-2.5">Tax</th>
                <th className="text-right px-5 py-2.5">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoice.items.map((item) => {
                const tax = item.cgst + item.sgst + item.igst;
                const lineTotal = item.taxableValue + tax;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-900 uppercase tracking-tight">
                        {item.variant.product.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.variant.sku}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700">
                      {fmt(item.rate)}
                    </td>
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
                {invoice.payments.length} receipt
                {invoice.payments.length > 1 ? "s" : ""}
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
                  {invoice.payments.map((p) => (
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
                          {p.paymentMode === "BankTransfer"
                            ? "Bank Transfer"
                            : p.paymentMode}
                          {p.bankAccount ? ` · ${p.bankAccount.name}` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs font-mono">
                        {p.referenceNo || "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-700">
                        {fmt(p.amount)}
                      </td>
                    </tr>
                  ))}
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
