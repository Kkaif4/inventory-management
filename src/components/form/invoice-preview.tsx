"use client";

import * as React from "react";

interface InvoicePreviewProps {
  prefix: string;
  startingNumber: number;
}

export function InvoicePreview({
  prefix,
  startingNumber,
}: InvoicePreviewProps) {
  // Calculate current financial year (April start)
  const now = new Date();
  const currentYear = now.getFullYear();
  const fiscalYearStart = 4; // April (month 0-indexed + 1)

  let fy: string;
  if (now.getMonth() + 1 >= fiscalYearStart) {
    // Current FY is currentYear-04 to (currentYear+1)-03
    fy = `${currentYear.toString().slice(2)}${(currentYear + 1).toString().slice(2)}`;
  } else {
    // Current FY is (currentYear-1)-04 to currentYear-03
    fy = `${(currentYear - 1).toString().slice(2)}${currentYear.toString().slice(2)}`;
  }

  const num = startingNumber || 1;
  const firstInvoice = prefix
    ? `${prefix}/${fy}/${String(num).padStart(4, "0")}`
    : "—";

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
        Preview
      </p>
      <p className="text-sm text-slate-900">
        Your first invoice will be:{" "}
        <span className="font-mono font-bold text-slate-900">{firstInvoice}</span>
      </p>
    </div>
  );
}
