"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, ShieldCheck } from "lucide-react";

const REPORTS = [
  {
    id: "GSTR1",
    name: "GSTR-1",
    desc: "Outward supplies (Sales) summary for GST filing.",
    status: "Pending",
  },
  {
    id: "GSTR2B",
    name: "GSTR-2B",
    desc: "Auto-drafted ITC statement for inward supplies.",
    status: "Available",
  },
  {
    id: "GSTR3B",
    name: "GSTR-3B",
    desc: "Monthly self-declaration of GST summary.",
    status: "Pending",
  },
];

export function GSTReportsClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Compliance Reports"
        subtitle="Generate and download data for official GST returns."
        breadcrumbs={[{ label: "Financials" }, { label: "GST Reports" }]}
      />

      <div className="grid grid-cols-3 gap-6">
        {REPORTS.map((r) => (
          <div
            key={r.id}
            className="bg-surface-base border border-border-default rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow"
          >
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">{r.name}</h3>
              <p className="text-sm text-text-secondary">{r.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase py-1 px-2 bg-surface-muted rounded w-fit">
              <ShieldCheck className="w-3 h-3" />
              Status: {r.status}
            </div>
            <Button className="w-full gap-2" variant="outline">
              <FileDown className="w-4 h-4" /> Export Excel
            </Button>
          </div>
        ))}
      </div>

      <div className="p-8 border-2 border-dashed border-border-default rounded-xl bg-surface-muted text-center space-y-3">
        <div className="text-lg font-bold text-text-primary">
          E-Way Bill & E-Invoicing
        </div>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Direct integration with the GST Portal for real-time E-Way bill
          generation and IRN logging.
        </p>
        <Button variant="link" className="text-brand">
          Configure Portal API Key &rarr;
        </Button>
      </div>
    </div>
  );
}
