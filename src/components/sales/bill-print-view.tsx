"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { numberToIndianWords } from "@/lib/number-to-words";

interface BillPrintViewProps {
  invoice: any;
  autoPrint?: boolean;
}

export function BillPrintView({ invoice, autoPrint = false }: BillPrintViewProps) {
  const router = useRouter();

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  if (!invoice) return null;

  const isNo1 = invoice.billType === "NO1";
  const isNo2 = invoice.billType === "NO2";
  const isOld = invoice.billType === "OLD";

  const outlet = invoice.outlet || {};
  const party = invoice.party || null;
  const items = invoice.items || [];

  // Calculate taxes summary
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalTaxable = invoice.totalTaxable || 0;

  // HSN Breakdown
  const hsnMap: Record<
    string,
    {
      hsn: string;
      taxable: number;
      gstRate: number;
      cgst: number;
      sgst: number;
      igst: number;
      totalTax: number;
    }
  > = {};

  items.forEach((item: any) => {
    totalCgst += item.cgst || 0;
    totalSgst += item.sgst || 0;
    totalIgst += item.igst || 0;

    const hsn = item.variant?.product?.hsnCode || "N/A";
    const gstRate = item.variant?.product?.gstRate || 0;
    const taxable = item.taxableValue || 0;
    const cgst = item.cgst || 0;
    const sgst = item.sgst || 0;
    const igst = item.igst || 0;

    if (!hsnMap[hsn]) {
      hsnMap[hsn] = {
        hsn,
        taxable: 0,
        gstRate,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      };
    }
    hsnMap[hsn].taxable += taxable;
    hsnMap[hsn].cgst += cgst;
    hsnMap[hsn].sgst += sgst;
    hsnMap[hsn].igst += igst;
    hsnMap[hsn].totalTax += cgst + sgst + igst;
  });

  const hsnList = Object.values(hsnMap);
  const totalTaxCalculated = totalCgst + totalSgst + totalIgst;

  const customChargesList = Array.isArray(invoice.customCharges)
    ? invoice.customCharges
    : [];
  const totalCustomCharges = customChargesList.reduce(
    (sum: number, c: any) => sum + (Number(c?.amount) || 0),
    0,
  );

  // Unrounded sum calculation to derive roundOff
  const unroundedSum =
    totalTaxable +
    (isNo1 ? totalTaxCalculated : 0) +
    (invoice.freightCost || 0) +
    totalCustomCharges -
    (invoice.globalDiscount || 0);

  const roundOff = Math.round((invoice.grandTotal - unroundedSum) * 100) / 100;

  // Customer display details
  const customerName = party?.name || invoice.buyerName || "Cash Customer";
  const customerPhone = party?.phone || invoice.buyerPhone || "—";
  const customerAddress = party?.address || "—";
  const customerGstin = party?.gstin || "—";
  const customerState = party?.state || outlet.state || "—";

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-slate-900 font-sans antialiased">
      {/* Global Print Isolation Styles */}
      <style jsx global>{`
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          /* Hide everything by default to prevent full-page snapshot of layout */
          body * {
            visibility: hidden;
          }
          /* Make only the bill printable container and its children visible */
          #printable-bill, #printable-bill * {
            visibility: visible;
          }
          #printable-bill {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      {/* Screen-Only Action Bar */}
      <div className="max-w-[210mm] mx-auto mb-4 px-4 sm:px-0 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/sales/transactions")}
            className="gap-2 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Transactions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/sales/invoices/${invoice.id}`)}
            className="gap-2 bg-white"
          >
            View Details
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Print layout is optimized for standard A4 paper
          </span>
          <Button
            onClick={() => window.print()}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </Button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 width 210mm) */}
      <div
        id="printable-bill"
        className="w-full max-w-[210mm] mx-auto bg-white p-6 sm:p-8 print:p-0 shadow-md print:shadow-none border border-slate-200 print:border-none text-slate-900 leading-snug"
      >
        {/* Document Header */}
        <div className="border border-slate-800 border-b-0 p-3 flex justify-between items-start">
          <div className="space-y-0.5 max-w-[60%]">
            <h1 className="text-base font-bold uppercase tracking-tight text-slate-900">
              {outlet.name || "Business Outlet"}
            </h1>
            {outlet.address && (
              <p className="text-xs text-slate-700 whitespace-pre-line">
                {outlet.address}
              </p>
            )}
            <div className="text-xs text-slate-700 pt-0.5 space-x-3">
              {outlet.state && (
                <span>
                  <strong>State:</strong> {outlet.state}
                </span>
              )}
              {outlet.gstin && (
                <span>
                  <strong>GSTIN:</strong> {outlet.gstin}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Invoice & Buyer Information Grid */}
        <div className="grid grid-cols-2 border border-slate-800 text-xs">
          {/* Bill To / Buyer */}
          <div className="p-2.5 border-r border-slate-800 space-y-1">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1">
              Billed To / Customer Details
            </div>
            <div className="font-semibold text-slate-900 text-xs">
              {customerName}
            </div>
            {customerAddress !== "—" && (
              <div className="text-slate-700 text-[11px] whitespace-pre-line">
                {customerAddress}
              </div>
            )}
            <div className="text-slate-700 text-[11px] pt-0.5">
              <span>
                <strong>Mobile:</strong> {customerPhone}
              </span>
            </div>
            {isNo1 && (
              <div className="text-slate-700 text-[11px] space-y-0.5 pt-0.5">
                <div>
                  <strong>GSTIN:</strong> {customerGstin}
                </div>
                <div>
                  <strong>State:</strong> {customerState}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="p-2.5 space-y-1">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1">
              Invoice Details
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className="text-slate-600">Invoice No:</span>
              <span className="font-bold text-slate-900">
                {invoice.txnNumber}
              </span>

              <span className="text-slate-600">Date:</span>
              <span className="font-medium text-slate-900">
                {formatDate(invoice.date)}
              </span>

              {invoice.customBillNo && (
                <>
                  <span className="text-slate-600">Ref / Book No:</span>
                  <span className="font-medium text-slate-900">
                    {invoice.customBillNo}
                  </span>
                </>
              )}

              <span className="text-slate-600">Place of Supply:</span>
              <span className="font-medium text-slate-900">
                {customerState}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-800 border-t-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-800 text-[11px] font-bold text-slate-900 uppercase">
                <th className="py-1.5 px-2 border-r border-slate-800 text-center w-8">
                  #
                </th>
                <th className="py-1.5 px-2 border-r border-slate-800">
                  Item
                </th>
                {isNo1 && (
                  <th className="py-1.5 px-2 border-r border-slate-800 text-center w-20">
                    HSN/SAC
                  </th>
                )}
                <th className="py-1.5 px-2 border-r border-slate-800 text-right w-14">
                  Qty
                </th>
                <th className="py-1.5 px-2 border-r border-slate-800 text-center w-14">
                  Unit
                </th>
                <th className="py-1.5 px-2 border-r border-slate-800 text-right w-20">
                  Rate (₹)
                </th>
                <th className="py-1.5 px-2 border-r border-slate-800 text-right w-14">
                  Disc %
                </th>
                {isNo1 && (
                  <>
                    <th className="py-1.5 px-2 border-r border-slate-800 text-right w-20">
                      Taxable
                    </th>
                    <th className="py-1.5 px-2 border-r border-slate-800 text-right w-14">
                      GST %
                    </th>
                  </>
                )}
                <th className="py-1.5 px-2 text-right w-24">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const productName =
                  item.variant?.product?.name ||
                  item.itemDescription ||
                  "Product Item";
                const hsn = item.variant?.product?.hsnCode || "—";
                const unit =
                  item.unit || item.variant?.product?.baseUnit || "PCS";
                const rate = item.rate || 0;
                const discPercent = item.discountPercent || 0;
                const taxable = item.taxableValue || 0;
                const gstRate = item.variant?.product?.gstRate || 0;
                const lineTotal = isNo1
                  ? taxable +
                  (item.cgst || 0) +
                  (item.sgst || 0) +
                  (item.igst || 0)
                  : taxable;

                return (
                  <tr
                    key={item.id || idx}
                    className="border-b border-slate-300 last:border-b-0 text-[11px] align-top"
                  >
                    <td className="py-1.5 px-2 border-r border-slate-800 text-center text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-800">
                      <div className="font-medium text-slate-900">
                        {productName}
                      </div>
                      {item.variant?.sku && (
                        <div className="text-[10px] text-slate-500">
                          SKU: {item.variant.sku}
                        </div>
                      )}
                    </td>
                    {isNo1 && (
                      <td className="py-1.5 px-2 border-r border-slate-800 text-center text-slate-700">
                        {hsn}
                      </td>
                    )}
                    <td className="py-1.5 px-2 border-r border-slate-800 text-right font-medium text-slate-900 tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-800 text-center text-slate-700 uppercase">
                      {unit}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-800 text-right tabular-nums text-slate-800">
                      {rate.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-800 text-right tabular-nums text-slate-600">
                      {discPercent > 0 ? `${discPercent}%` : "—"}
                    </td>
                    {isNo1 && (
                      <>
                        <td className="py-1.5 px-2 border-r border-slate-800 text-right tabular-nums text-slate-800">
                          {taxable.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-800 text-right tabular-nums text-slate-600">
                          {gstRate > 0 ? `${gstRate}%` : "0%"}
                        </td>
                      </>
                    )}
                    <td className="py-1.5 px-2 text-right font-semibold tabular-nums text-slate-900">
                      {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GST Tax Summary (Only for NO1 Invoices with taxes) */}
        {isNo1 && hsnList.length > 0 && (
          <div className="border border-slate-800 border-t-0">
            <div className="bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-800 border-b border-slate-300">
              Tax Summary Breakdown
            </div>
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-700 font-semibold bg-slate-50">
                  <th className="py-1 px-2 border-r border-slate-300">HSN/SAC</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right">
                    Taxable Value (₹)
                  </th>
                  {totalIgst > 0 ? (
                    <>
                      <th className="py-1 px-2 border-r border-slate-300 text-right">
                        IGST %
                      </th>
                      <th className="py-1 px-2 border-r border-slate-300 text-right">
                        IGST Amt (₹)
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="py-1 px-2 border-r border-slate-300 text-right">
                        CGST Amt (₹)
                      </th>
                      <th className="py-1 px-2 border-r border-slate-300 text-right">
                        SGST Amt (₹)
                      </th>
                    </>
                  )}
                  <th className="py-1 px-2 text-right">Total Tax (₹)</th>
                </tr>
              </thead>
              <tbody>
                {hsnList.map((h, i) => (
                  <tr key={i} className="border-b border-slate-200 last:border-b-0 tabular-nums">
                    <td className="py-1 px-2 border-r border-slate-300 text-slate-800">
                      {h.hsn}
                    </td>
                    <td className="py-1 px-2 border-r border-slate-300 text-right text-slate-800">
                      {h.taxable.toFixed(2)}
                    </td>
                    {totalIgst > 0 ? (
                      <>
                        <td className="py-1 px-2 border-r border-slate-300 text-right text-slate-800">
                          {h.gstRate}%
                        </td>
                        <td className="py-1 px-2 border-r border-slate-300 text-right text-slate-800">
                          {h.igst.toFixed(2)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-1 px-2 border-r border-slate-300 text-right text-slate-800">
                          {h.cgst.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-300 text-right text-slate-800">
                          {h.sgst.toFixed(2)}
                        </td>
                      </>
                    )}
                    <td className="py-1 px-2 text-right font-medium text-slate-900">
                      {h.totalTax.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Section: Words, Bank Details, and Totals */}
        <div className="grid grid-cols-12 border border-slate-800 border-t-0 text-xs">
          {/* Left Side: Amount in Words, Bank Details & Notes */}
          <div className="col-span-7 p-2.5 border-r border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Invoice Amount in Words:
                </span>
                <span className="font-bold text-slate-900 text-xs italic">
                  {numberToIndianWords(invoice.grandTotal)}
                </span>
              </div>

              {outlet.bankDetails && (
                <div className="border border-slate-300 bg-slate-50 p-2 rounded-sm text-[10px]">
                  <div className="font-bold uppercase tracking-wider text-slate-800 mb-0.5">
                    Bank Account Details:
                  </div>
                  <div className="text-slate-700 whitespace-pre-line">
                    {outlet.bankDetails}
                  </div>
                </div>
              )}

              {invoice.remarks && (
                <div className="text-[11px] text-slate-700">
                  <strong>Notes:</strong> {invoice.remarks}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="text-[9px] text-slate-500 pt-2 border-t border-slate-200">
              <p className="font-semibold text-slate-700 mb-0.5">Terms & Conditions:</p>
              <ol className="list-decimal pl-3 space-y-0.5">
                <li>Goods once sold will not be accepted back or exchanged without valid invoice.</li>
                <li>All disputes are subject to local jurisdiction only.</li>
              </ol>
            </div>
          </div>

          {/* Right Side: Totals Calculation (Minimal & Efficient, No Oversized Styling) */}
          <div className="col-span-5 flex flex-col justify-between">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1 px-2.5 text-slate-600">Subtotal / Taxable:</td>
                  <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900 w-28">
                    ₹{totalTaxable.toFixed(2)}
                  </td>
                </tr>

                {isNo1 && (
                  <>
                    {totalIgst > 0 ? (
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2.5 text-slate-600">IGST:</td>
                        <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                          ₹{totalIgst.toFixed(2)}
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 px-2.5 text-slate-600">CGST:</td>
                          <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                            ₹{totalCgst.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 px-2.5 text-slate-600">SGST:</td>
                          <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                            ₹{totalSgst.toFixed(2)}
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                )}

                {(invoice.freightCost || 0) > 0 && (
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 text-slate-600">Freight Charges:</td>
                    <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                      ₹{invoice.freightCost.toFixed(2)}
                    </td>
                  </tr>
                )}

                {customChargesList.map((charge: any, idx: number) => {
                  const amt = Number(charge?.amount) || 0;
                  if (amt <= 0) return null;
                  return (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-1 px-2.5 text-slate-600">
                        {charge.name || "Extra Charge"}:
                      </td>
                      <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                        ₹{amt.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {Math.abs(roundOff) > 0.005 && (
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 text-slate-600">Round Off:</td>
                    <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                      {roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}
                    </td>
                  </tr>
                )}

                {(invoice.globalDiscount || 0) > 0 && (
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 text-slate-600">Discount:</td>
                    <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                      -₹{invoice.globalDiscount.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Minimal Final Amount Row as requested */}
                <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-50 font-bold text-slate-900">
                  <td className="py-1.5 px-2.5 text-xs uppercase tracking-wide">
                    Grand Total:
                  </td>
                  <td className="py-1.5 px-2.5 text-right text-xs tabular-nums whitespace-nowrap">
                    ₹{invoice.grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Signature Box */}
            <div className="p-3 text-right mt-4">
              <span className="text-[10px] text-slate-600 block">
                For <strong>{outlet.name || "Company"}</strong>
              </span>
              <div className="h-10"></div>
              <span className="text-[10px] font-semibold text-slate-800 border-t border-slate-400 pt-1 px-3 inline-block">
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
