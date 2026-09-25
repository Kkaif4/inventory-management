"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, Receipt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { numberToIndianWords } from "@/lib/number-to-words";

interface BillPrintViewProps {
  invoice: any;
  autoPrint?: boolean;
}

type PrintFormat = "BILL_BOOK" | "POS_80MM" | "A4";

function formatTime(date: Date | string | undefined | null) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export function BillPrintView({ invoice, autoPrint = false }: BillPrintViewProps) {
  const router = useRouter();

  if (!invoice) return null;

  const isNo1 = invoice.billType === "NO1";
  const isNo2 = invoice.billType === "NO2";
  const isOld = invoice.billType === "OLD";

  // Default to authentic Indian Bill Book format for NO2 bills, otherwise standard A4
  const [format, setFormat] = useState<PrintFormat>(
    isNo2 ? "BILL_BOOK" : "A4",
  );

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

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

  // Build rows for the Bill Book format (Items + Freight + Extra Charges + Discount + RoundOff)
  const billBookRows: Array<{
    id: string;
    qty: string | number;
    particular: React.ReactNode;
    rate: string;
    amount: string;
  }> = [];

  items.forEach((item: any, idx: number) => {
    const productName =
      item.variant?.product?.name || item.itemDescription || "Product Item";
    const rate = item.rate || 0;
    const qty = item.quantity || 0;
    const taxable =
      item.taxableValue ?? qty * rate - (item.discountAmount || 0);

    const serialList =
      item.saleSerialNumbers && item.saleSerialNumbers.length > 0
        ? item.saleSerialNumbers
        : Array.isArray(item.serialNumbers)
        ? item.serialNumbers.map((s: any) =>
            typeof s === "string" ? { serialNumber: s } : s,
          )
        : [];

    const snWithWarranty = serialList.find(
      (s: any) => s.warrantyExpiry || s.warrantyMonths,
    );
    const months =
      snWithWarranty?.warrantyMonths || item.variant?.product?.warrantyMonths;
    const expiry = snWithWarranty?.warrantyExpiry;

    billBookRows.push({
      id: item.id || `item-${idx}`,
      qty: qty,
      particular: (
        <div>
          <span className="font-semibold text-slate-900">{productName}</span>
          {item.variant?.sku && (
            <span className="text-[10px] text-slate-500 font-mono ml-1.5">
              (SKU: {item.variant.sku})
            </span>
          )}
          {serialList.length > 0 ? (
            <div className="text-[9.5px] text-slate-700 leading-tight mt-0.5">
              <span className="font-semibold">S/N: </span>
              <span className="font-mono">
                {serialList.map((s: any) => s.serialNumber).join(", ")}
              </span>
              {expiry ? (
                <span className="text-slate-600 ml-1">
                  ({months ? `${months}M ` : ""}till {formatDate(expiry)})
                </span>
              ) : months && months > 0 ? (
                <span className="text-slate-600 ml-1">({months}M Warranty)</span>
              ) : null}
            </div>
          ) : item.variant?.product?.warrantyMonths &&
            item.variant.product.warrantyMonths > 0 ? (
            <div className="text-[9.5px] text-slate-600 mt-0.5">
              Warranty: {item.variant.product.warrantyMonths} Months
            </div>
          ) : null}
          {item.discountPercent > 0 && (
            <span className="text-[9.5px] text-slate-500 ml-1.5">
              (Disc: {item.discountPercent}%)
            </span>
          )}
        </div>
      ),
      rate: rate.toFixed(2),
      amount: taxable.toFixed(2),
    });
  });

  // Add Freight row if any
  if ((invoice.freightCost || 0) > 0) {
    billBookRows.push({
      id: "freight-cost",
      qty: "",
      particular: (
        <span className="font-medium text-slate-800 italic">
          Freight Charges
        </span>
      ),
      rate: "",
      amount: invoice.freightCost.toFixed(2),
    });
  }

  // Add Extra Charges rows if any
  customChargesList.forEach((charge: any, idx: number) => {
    const amt = Number(charge?.amount) || 0;
    if (amt > 0) {
      billBookRows.push({
        id: `custom-charge-${idx}`,
        qty: "",
        particular: (
          <span className="font-medium text-slate-800 italic">
            {charge.name || "Extra Charge"}
          </span>
        ),
        rate: "",
        amount: amt.toFixed(2),
      });
    }
  });

  // Add Global Discount row if any
  if ((invoice.globalDiscount || 0) > 0) {
    billBookRows.push({
      id: "global-discount",
      qty: "",
      particular: (
        <span className="font-medium text-slate-800 italic">
          Discount
        </span>
      ),
      rate: "",
      amount: `-${invoice.globalDiscount.toFixed(2)}`,
    });
  }

  // Add Round Off row if any
  if (Math.abs(roundOff) > 0.005) {
    billBookRows.push({
      id: "round-off",
      qty: "",
      particular: (
        <span className="font-medium text-slate-800 italic">
          Round Off
        </span>
      ),
      rate: "",
      amount: `${roundOff > 0 ? "+" : "-"}${Math.abs(roundOff).toFixed(2)}`,
    });
  }

  // Minimum ruled rows in bill book to match standard physical bill pad
  const minBillBookRows = 11;
  const emptyRowsCount = Math.max(0, minBillBookRows - billBookRows.length);

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-slate-900 font-sans antialiased">
      {/* Global Print Isolation Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          /* Hide everything by default to prevent full-page snapshot */
          body * {
            visibility: hidden !important;
          }
          /* Make only the bill printable container and its children visible */
          #printable-bill, #printable-bill * {
            visibility: visible !important;
          }
          #printable-bill {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            border: ${
              format === "BILL_BOOK"
                ? "1.5px solid #0f172a !important"
                : "none !important"
            };
            box-shadow: none !important;
            padding: ${
              format === "POS_80MM"
                ? "1.5mm !important"
                : "0 !important"
            };
            width: ${
              format === "POS_80MM"
                ? "80mm !important"
                : format === "BILL_BOOK"
                ? "145mm !important"
                : "100% !important"
            };
            max-width: ${
              format === "POS_80MM"
                ? "80mm !important"
                : format === "BILL_BOOK"
                ? "145mm !important"
                : "210mm !important"
            };
            margin: ${
              format === "POS_80MM" ? "0 !important" : "0 auto !important"
            };
          }
          @page {
            size: ${
              format === "POS_80MM"
                ? "80mm auto"
                : format === "BILL_BOOK"
                ? "A5 portrait"
                : "A4 portrait"
            };
            margin: ${
              format === "POS_80MM"
                ? "3mm 2mm"
                : format === "BILL_BOOK"
                ? "5mm"
                : "8mm"
            };
          }
        }
      `,
        }}
      />

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

        {/* Format Selector Toggle */}
        <div className="inline-flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg border border-slate-300">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFormat("BILL_BOOK")}
            className={`h-7 px-3 text-xs font-semibold rounded-md transition-all gap-1.5 ${
              format === "BILL_BOOK"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Cash Memo (Bill Book)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFormat("POS_80MM")}
            className={`h-7 px-3 text-xs font-semibold rounded-md transition-all gap-1.5 ${
              format === "POS_80MM"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            POS Slip (80mm)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFormat("A4")}
            className={`h-7 px-3 text-xs font-semibold rounded-md transition-all gap-1.5 ${
              format === "A4"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Standard A4
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {format === "BILL_BOOK"
              ? "Indian Cash/Credit Memo pad format (A5)"
              : format === "POS_80MM"
              ? "Thermal POS slip format (80mm)"
              : "Standard A4 portrait"}
          </span>
          <Button
            onClick={() => window.print()}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print {format === "A4" ? "Bill" : "Cash Memo"}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTHENTIC INDIAN BILL BOOK FORMAT (Cash / Credit Memo Pad)             */}
      {/* ========================================================================= */}
      {format === "BILL_BOOK" ? (
        <div
          id="printable-bill"
          className="w-full max-w-[145mm] mx-auto bg-white shadow-xl border-2 border-slate-900 text-slate-900 leading-tight font-sans text-xs print:shadow-none print:border-[1.5px] print:border-slate-900 my-4"
        >
          {/* Header Bar: CASH / CREDIT MEMO & नगद / पत रसिद */}
          <div className="border-b-2 border-slate-900 bg-slate-100 px-3 py-1.5 flex items-center justify-between">
            <span className="font-black text-sm sm:text-base tracking-wide text-slate-900">
              CASH / CREDIT MEMO
            </span>
            <span className="font-bold text-xs sm:text-sm text-slate-900">
              नगद / पत रसिद
            </span>
          </div>

          {/* Grid: From (Left) & No./Date (Right) */}
          <div className="grid grid-cols-12 border-b border-slate-900 text-xs">
            {/* Left Column: From (Outlet Details) */}
            <div className="col-span-8 p-2 border-r border-slate-900 flex flex-col justify-start">
              <div className="text-[11px] font-bold italic text-slate-800">
                From :
              </div>
              <div className="font-extrabold text-sm uppercase text-slate-900 tracking-tight mt-0.5">
                {outlet.name || "Business Outlet"}
              </div>
              {outlet.address && (
                <div className="text-[10.5px] text-slate-700 whitespace-pre-line leading-snug mt-0.5">
                  {outlet.address}
                </div>
              )}
              {outlet.state && (
                <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                  State: {outlet.state}
                </div>
              )}
            </div>

            {/* Right Column: No. & Date */}
            <div className="col-span-4 flex flex-col">
              {/* Row 1: No. / क्रमांक */}
              <div className="p-1.5 border-b border-slate-900 flex-1 flex flex-col justify-center">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[11px] text-slate-800">No. :</span>
                  <span className="text-[10px] font-semibold text-slate-700">
                    क्रमांक
                  </span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                  {invoice.txnNumber}
                </div>
                {invoice.customBillNo && (
                  <div className="text-[9.5px] text-slate-500 font-mono">
                    Ref: {invoice.customBillNo}
                  </div>
                )}
              </div>

              {/* Row 2: Date / दिनांक */}
              <div className="p-1.5 flex-1 flex flex-col justify-center">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[11px] text-slate-800">Date :</span>
                  <span className="text-[10px] font-semibold text-slate-700">
                    दिनांक
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-900 mt-0.5">
                  {formatDate(invoice.date)}
                </div>
                <div className="text-[9.5px] text-slate-500">
                  {formatTime(invoice.createdAt || invoice.date)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details: M/s. / सर्वश्री */}
          <div className="border-b border-slate-900 p-2 flex items-start text-xs bg-white">
            <div className="shrink-0 flex items-center gap-1.5 mr-2">
              <span className="font-bold text-xs text-slate-800">M/s.</span>
              <span className="text-[11px] font-semibold text-slate-700">सर्वश्री</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 pb-0.5">
              <span className="font-bold text-xs text-slate-900">
                {customerName}
              </span>
              {customerPhone && customerPhone !== "—" && (
                <span className="text-slate-600 text-[11px] ml-2 font-mono">
                  (Mob: {customerPhone})
                </span>
              )}
              {customerAddress && customerAddress !== "—" && (
                <span className="text-slate-600 text-[11px] ml-2">
                  , {customerAddress}
                </span>
              )}
            </div>
          </div>

          {/* Table Header: 4 Columns with English/Hindi dual labels */}
          <div className="grid grid-cols-12 border-b border-slate-900 text-[11px] font-bold text-center bg-slate-100">
            <div className="col-span-2 py-1.5 border-r border-slate-900">
              <div className="text-slate-900">QTY.</div>
              <div className="text-[10px] text-slate-700 font-semibold">संख्या</div>
            </div>
            <div className="col-span-6 py-1.5 border-r border-slate-900 text-left px-2">
              <div className="text-slate-900">PARTICULAR</div>
              <div className="text-[10px] text-slate-700 font-semibold">विवरण</div>
            </div>
            <div className="col-span-2 py-1.5 border-r border-slate-900">
              <div className="text-slate-900">RATE</div>
              <div className="text-[10px] text-slate-700 font-semibold">दर</div>
            </div>
            <div className="col-span-2 py-1.5 text-right px-2">
              <div className="text-slate-900 flex items-center justify-end gap-0.5">
                <span>AMOUNT</span>
                <span className="text-xs">₹</span>
              </div>
              <div className="text-[10px] text-slate-700 font-semibold">रक्कम</div>
            </div>
          </div>

          {/* Table Body: Ruled rows with continuous vertical grid lines */}
          <div className="divide-y divide-slate-300">
            {/* Populated Rows */}
            {billBookRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 text-xs min-h-[30px] items-center"
              >
                <div className="col-span-2 py-1.5 border-r border-slate-900 text-center font-mono font-medium text-slate-900 h-full flex items-center justify-center">
                  {row.qty}
                </div>
                <div className="col-span-6 py-1.5 px-2 border-r border-slate-900 text-slate-900 h-full flex items-center">
                  {row.particular}
                </div>
                <div className="col-span-2 py-1.5 px-1 border-r border-slate-900 text-right font-mono text-slate-800 h-full flex items-center justify-end">
                  {row.rate}
                </div>
                <div className="col-span-2 py-1.5 px-2 text-right font-mono font-bold text-slate-900 h-full flex items-center justify-end">
                  {row.amount}
                </div>
              </div>
            ))}

            {/* Ruled Empty Rows to match classic physical bill pad */}
            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <div
                key={`empty-row-${idx}`}
                className="grid grid-cols-12 text-xs h-7 items-center"
              >
                <div className="col-span-2 border-r border-slate-900 h-full"></div>
                <div className="col-span-6 border-r border-slate-900 h-full"></div>
                <div className="col-span-2 border-r border-slate-900 h-full"></div>
                <div className="col-span-2 h-full"></div>
              </div>
            ))}
          </div>

          {/* Footer Bar: Thank You, धन्यवाद, TOTAL, and Amount */}
          <div className="grid grid-cols-12 border-t border-slate-900 text-xs">
            {/* Left Section: Thank You / धन्यवाद */}
            <div className="col-span-8 p-2 border-r border-slate-900 flex items-center justify-between">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                Thank You
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                Goods once sold will not be returned
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                धन्यवाद
              </span>
            </div>

            {/* Right Section: TOTAL / टोटल & Amount */}
            <div className="col-span-2 p-1.5 border-r border-slate-900 flex flex-col justify-center items-center bg-slate-100">
              <span className="font-black text-[11px] text-slate-900">TOTAL</span>
              <span className="text-[10px] font-bold text-slate-700">टोटल</span>
            </div>
            <div className="col-span-2 p-1.5 flex items-center justify-end font-mono font-black text-xs sm:text-sm text-slate-900 bg-slate-100">
              ₹{invoice.grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      ) : format === "POS_80MM" ? (
        /* ========================================================================= */
        /* 2. POS THERMAL RECEIPT SLIP FORMAT (80mm)                                 */
        /* ========================================================================= */
        <div
          id="printable-bill"
          className="w-[80mm] max-w-[80mm] mx-auto bg-white p-4 shadow-md border border-slate-300 print:border-none print:shadow-none print:p-1 text-slate-900 leading-tight font-sans text-xs"
        >
          {/* Outlet Details */}
          <div className="text-center space-y-0.5">
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900">
              {outlet.name || "Business Outlet"}
            </h1>
            {outlet.address && (
              <p className="text-[10px] text-slate-600 whitespace-pre-line leading-tight">
                {outlet.address}
              </p>
            )}
            {outlet.state && (
              <p className="text-[9.5px] text-slate-500 font-medium">
                State: {outlet.state}
              </p>
            )}
          </div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          {/* Document Title */}
          <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-900">
            Cash Memo
          </div>

          <div className="border-b border-dashed border-slate-400 my-1.5" />

          {/* Time & Memo Details */}
          <div className="text-[10.5px] space-y-0.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Memo No:</span>
              <span className="font-mono font-bold text-slate-900">
                {invoice.txnNumber}
              </span>
            </div>
            {invoice.customBillNo && (
              <div className="flex justify-between">
                <span className="text-slate-500">Book Ref:</span>
                <span className="font-mono font-medium text-slate-900">
                  {invoice.customBillNo}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-900">
                {formatDate(invoice.date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time:</span>
              <span className="font-medium text-slate-900">
                {formatTime(invoice.createdAt || invoice.date) || "—"}
              </span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-400 my-1.5" />

          {/* Customer Details */}
          <div className="text-[10.5px] space-y-0.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-900 text-right">
                {customerName}
              </span>
            </div>
            {customerPhone && customerPhone !== "—" && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-900">{customerPhone}</span>
              </div>
            )}
            {customerAddress && customerAddress !== "—" && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 shrink-0">Address:</span>
                <span className="text-slate-700 text-right truncate">
                  {customerAddress}
                </span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          {/* Line Items Header */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-900 uppercase pb-1 border-b border-slate-800">
            <span className="col-span-6">Item</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Rate</span>
            <span className="col-span-2 text-right">Amt</span>
          </div>

          {/* Line Items List */}
          <div className="divide-y divide-dotted divide-slate-300">
            {items.map((item: any, idx: number) => {
              const productName =
                item.variant?.product?.name || item.itemDescription || "Item";
              const rate = item.rate || 0;
              const qty = item.quantity || 0;
              const taxable =
                item.taxableValue ?? qty * rate - (item.discountAmount || 0);

              const serialList =
                item.saleSerialNumbers && item.saleSerialNumbers.length > 0
                  ? item.saleSerialNumbers
                  : Array.isArray(item.serialNumbers)
                  ? item.serialNumbers.map((s: any) =>
                      typeof s === "string" ? { serialNumber: s } : s,
                    )
                  : [];

              const snWithWarranty = serialList.find(
                (s: any) => s.warrantyExpiry || s.warrantyMonths,
              );
              const months =
                snWithWarranty?.warrantyMonths ||
                item.variant?.product?.warrantyMonths;
              const expiry = snWithWarranty?.warrantyExpiry;

              return (
                <div key={item.id || idx} className="py-1 text-[10.5px]">
                  <div className="grid grid-cols-12 items-baseline">
                    <div className="col-span-6 font-semibold text-slate-900 leading-tight pr-1">
                      {productName}
                    </div>
                    <div className="col-span-2 text-center font-mono text-slate-800">
                      {qty}
                    </div>
                    <div className="col-span-2 text-right font-mono text-slate-700">
                      {rate.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                      {taxable.toFixed(2)}
                    </div>
                  </div>

                  {item.variant?.sku && (
                    <div className="text-[9px] text-slate-500 font-mono">
                      SKU: {item.variant.sku}
                    </div>
                  )}

                  {/* Serial Numbers & Warranty */}
                  {serialList.length > 0 ? (
                    <div className="text-[9px] text-slate-700 mt-0.5 leading-tight">
                      <span className="font-semibold text-slate-800">
                        S/N:{" "}
                      </span>
                      <span className="font-mono text-slate-800">
                        {serialList.map((s: any) => s.serialNumber).join(", ")}
                      </span>
                      {expiry ? (
                        <span className="text-slate-600 ml-1">
                          ({months ? `${months}M ` : ""}till {formatDate(expiry)})
                        </span>
                      ) : months && months > 0 ? (
                        <span className="text-slate-600 ml-1">
                          ({months}M Warranty)
                        </span>
                      ) : null}
                    </div>
                  ) : item.variant?.product?.warrantyMonths &&
                    item.variant.product.warrantyMonths > 0 ? (
                    <div className="text-[9px] text-slate-600 mt-0.5">
                      Warranty: {item.variant.product.warrantyMonths} Months
                    </div>
                  ) : null}

                  {item.discountPercent > 0 && (
                    <div className="text-[9px] text-slate-500">
                      (Disc: {item.discountPercent}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-b border-dashed border-slate-400 my-1.5" />

          {/* Pricing & Totals with Freight and Charges */}
          <div className="text-[10.5px] space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-900">
                ₹{totalTaxable.toFixed(2)}
              </span>
            </div>

            {(invoice.freightCost || 0) > 0 && (
              <div className="flex justify-between">
                <span>Freight Charges:</span>
                <span className="font-mono text-slate-900">
                  ₹{invoice.freightCost.toFixed(2)}
                </span>
              </div>
            )}

            {customChargesList.map((charge: any, idx: number) => {
              const amt = Number(charge?.amount) || 0;
              if (amt <= 0) return null;
              return (
                <div key={idx} className="flex justify-between">
                  <span>{charge.name || "Extra Charge"}:</span>
                  <span className="font-mono text-slate-900">
                    ₹{amt.toFixed(2)}
                  </span>
                </div>
              );
            })}

            {Math.abs(roundOff) > 0.005 && (
              <div className="flex justify-between">
                <span>Round Off:</span>
                <span className="font-mono text-slate-900">
                  {roundOff > 0
                    ? `+₹${roundOff.toFixed(2)}`
                    : `-₹${Math.abs(roundOff).toFixed(2)}`}
                </span>
              </div>
            )}

            {(invoice.globalDiscount || 0) > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-mono text-slate-900">
                  -₹{invoice.globalDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Total Payable */}
            <div className="border-t-2 border-b-2 border-dashed border-slate-900 py-1.5 my-1.5 flex justify-between items-center text-xs font-bold text-slate-900">
              <span className="uppercase tracking-wider">Total Amount:</span>
              <span className="font-mono text-sm">
                ₹{invoice.grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="text-[9.5px] text-slate-500 flex justify-between pt-0.5">
              <span>Total Items: {items.length}</span>
              <span>
                Total Qty:{" "}
                {items.reduce(
                  (s: number, i: any) => s + (Number(i.quantity) || 0),
                  0,
                )}
              </span>
            </div>

            {invoice.remarks && (
              <div className="text-[9.5px] text-slate-600 pt-1">
                <strong>Note:</strong> {invoice.remarks}
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-400 my-2" />

          {/* Footer */}
          <div className="text-center text-[9.5px] text-slate-500 pt-1 space-y-0.5">
            <div className="font-bold text-slate-800 uppercase tracking-wider">
              *** Thank You ***
            </div>
            <div>Goods once sold will not be returned without cash memo.</div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. STANDARD A4 FORMAT (Detailed Tax Invoice / Business Invoice)           */
        /* ========================================================================= */
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
            <div className="text-right">
              <div className="text-lg font-black uppercase tracking-wider text-slate-900">
                {isNo1 ? "Tax Invoice" : "Cash Memo"}
              </div>
              <div className="text-xs text-slate-600">
                {isNo1 ? "Original for Recipient" : "Counter Copy"}
              </div>
            </div>
          </div>

          {/* Invoice & Buyer Information Grid */}
          <div className="grid grid-cols-2 border border-slate-800 text-xs">
            {/* Bill To / Buyer */}
            <div className="p-2.5 border-r border-slate-800 space-y-1">
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1">
                Customer Details
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
                {isNo1 ? "Invoice Details" : "Memo Details"}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-slate-600">
                  {isNo1 ? "Invoice No:" : "Memo No:"}
                </span>
                <span className="font-bold text-slate-900">
                  {invoice.txnNumber}
                </span>

                <span className="text-slate-600">Date:</span>
                <span className="font-medium text-slate-900">
                  {formatDate(invoice.date)}
                </span>

                <span className="text-slate-600">Time:</span>
                <span className="font-medium text-slate-900">
                  {formatTime(invoice.createdAt || invoice.date) || "—"}
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

                  const serialList =
                    item.saleSerialNumbers && item.saleSerialNumbers.length > 0
                      ? item.saleSerialNumbers
                      : Array.isArray(item.serialNumbers)
                      ? item.serialNumbers.map((s: any) =>
                          typeof s === "string" ? { serialNumber: s } : s,
                        )
                      : [];

                  const snWithWarranty = serialList.find(
                    (s: any) => s.warrantyExpiry || s.warrantyMonths,
                  );
                  const months =
                    snWithWarranty?.warrantyMonths ||
                    item.variant?.product?.warrantyMonths;
                  const expiry = snWithWarranty?.warrantyExpiry;

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
                          <div className="text-[9.5px] text-slate-500">
                            SKU: {item.variant.sku}
                          </div>
                        )}
                        {/* Serial Numbers and Warranty */}
                        {serialList.length > 0 ? (
                          <div className="text-[9px] text-slate-700 mt-0.5 leading-snug">
                            <span className="font-semibold text-slate-900">
                              S/N:{" "}
                            </span>
                            <span className="font-mono">
                              {serialList
                                .map((s: any) => s.serialNumber)
                                .join(", ")}
                            </span>
                            {expiry ? (
                              <span className="text-slate-600 font-medium ml-1">
                                (Warranty: {months ? `${months}M ` : ""}till{" "}
                                {formatDate(expiry)})
                              </span>
                            ) : months && months > 0 ? (
                              <span className="text-slate-600 font-medium ml-1">
                                (Warranty: {months}M)
                              </span>
                            ) : null}
                          </div>
                        ) : item.variant?.product?.warrantyMonths &&
                          item.variant.product.warrantyMonths > 0 ? (
                          <div className="text-[9px] text-slate-600 font-medium mt-0.5">
                            Warranty: {item.variant.product.warrantyMonths}{" "}
                            Months
                          </div>
                        ) : null}
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
                    <th className="py-1 px-2 border-r border-slate-300">
                      HSN/SAC
                    </th>
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
                    <tr
                      key={i}
                      className="border-b border-slate-200 last:border-b-0 tabular-nums"
                    >
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
                <p className="font-semibold text-slate-700 mb-0.5">
                  Terms & Conditions:
                </p>
                <ol className="list-decimal pl-3 space-y-0.5">
                  <li>
                    Goods once sold will not be accepted back or exchanged
                    without valid invoice.
                  </li>
                  <li>All disputes are subject to local jurisdiction only.</li>
                </ol>
              </div>
            </div>

            {/* Right Side: Totals Calculation */}
            <div className="col-span-5 flex flex-col justify-between">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 px-2.5 text-slate-600">
                      Subtotal / Taxable:
                    </td>
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
                            <td className="py-1 px-2.5 text-slate-600">
                              CGST:
                            </td>
                            <td className="py-1 px-2.5 text-right font-medium tabular-nums text-slate-900">
                              ₹{totalCgst.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="py-1 px-2.5 text-slate-600">
                              SGST:
                            </td>
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
                      <td className="py-1 px-2.5 text-slate-600">
                        Freight Charges:
                      </td>
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
                        {roundOff > 0
                          ? `+₹${roundOff.toFixed(2)}`
                          : `-₹${Math.abs(roundOff).toFixed(2)}`}
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

                  {/* Final Amount Row */}
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
      )}
    </div>
  );
}
