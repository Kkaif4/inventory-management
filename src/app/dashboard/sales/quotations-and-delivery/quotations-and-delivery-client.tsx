"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ClipboardList, Truck } from "lucide-react";
import { useState } from "react";

// Sub-clients
import { QuotationsClient } from "../quotations/quotations-client";
import { ProformaInvoicesClient } from "../proforma-invoices/proforma-invoices-client";
import { DeliveryChallansClient } from "../challans/challans-client";

interface QuotationsAndDeliveryClientProps {
  quotations: any[];
  proformaInvoices: any[];
  challans: any[];
}

export function QuotationsAndDeliveryClient({
  quotations,
  proformaInvoices,
  challans,
}: QuotationsAndDeliveryClientProps) {
  const [activeTab, setActiveTab] = useState("quotations");

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="quotations"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-surface-elevated p-1 rounded-xl border border-border-default h-11">
            <TabsTrigger
              value="quotations"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              Quotations
            </TabsTrigger>
            <TabsTrigger
              value="proforma"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <ClipboardList className="w-4 h-4 text-orange-500" />
              Proforma
            </TabsTrigger>
            <TabsTrigger
              value="challans"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Truck className="w-4 h-4 text-green-500" />
              Challans
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-6 min-h-[500px]">
          <TabsContent value="quotations" className="mt-0">
            <QuotationsClient quotations={quotations} />
          </TabsContent>
          <TabsContent value="proforma" className="mt-0">
            <ProformaInvoicesClient invoices={proformaInvoices} />
          </TabsContent>
          <TabsContent value="challans" className="mt-0">
            <DeliveryChallansClient challans={challans} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
