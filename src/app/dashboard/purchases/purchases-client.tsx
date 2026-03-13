"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  ClipboardList,
  Receipt,
  RotateCcw,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Sub-clients
import { PurchaseRequestsClient } from "./requests/requests-client";
import { PurchaseOrdersClient } from "./orders/orders-client";
import { PurchaseBillsClient } from "./bills/bills-client";
import { PurchaseReturnsClient } from "./returns/returns-client";

interface PurchasesClientProps {
  requests: any[];
  orders: any[];
  bills: any[];
  returns: any[];
}

export function PurchasesClient({
  requests,
  orders,
  bills,
  returns,
}: PurchasesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");

  // Dynamic header based on tab
  const getHeaderInfo = () => {
    switch (activeTab) {
      case "requests":
        return {
          title: "Purchase Requests",
          subtitle:
            "Review and approve internal purchase requests (L1/L2 matrix applied)",
          actions: [
            {
              label: "New Request",
              icon: Plus,
              onClick: () => router.push("/dashboard/purchases/requests/new"),
            },
          ],
        };
      case "orders":
        return {
          title: "Purchase Orders",
          subtitle: "Manage procurement requests sent to vendors.",
          actions: [
            {
              label: "New Order",
              icon: Plus,
              onClick: () => router.push("/dashboard/purchases/orders/new"),
            },
          ],
        };
      case "bills":
        return {
          title: "Purchase Bills",
          subtitle: "Manage vendor invoices and procurement billing.",
          actions: [],
        };
      case "returns":
        return {
          title: "Purchase Returns",
          subtitle: "Track goods returned back to vendors (Debit Notes).",
          actions: [],
        };
      default:
        return {
          title: "Procurement",
          subtitle: "Manage your supply chain",
          actions: [],
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="space-y-6">
      <PageHeader
        title={header.title}
        subtitle={header.subtitle}
        breadcrumbs={[
          { label: "Purchases", href: "/dashboard/purchases" },
          { label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1) },
        ]}
        actions={header.actions}
      />

      <Tabs
        defaultValue="orders"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-surface-elevated p-1 rounded-xl border border-border-default h-11">
            <TabsTrigger
              value="requests"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <ClipboardList className="w-4 h-4 text-blue-500" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-orange-500" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="bills"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Receipt className="w-4 h-4 text-green-500" />
              Bills
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="rounded-lg px-4 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-red-500" />
              Returns
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-6 min-h-[500px]">
          <TabsContent value="requests" className="mt-0">
            <PurchaseRequestsClient requests={requests} hideHeader />
          </TabsContent>
          <TabsContent value="orders" className="mt-0">
            <PurchaseOrdersClient orders={orders} hideHeader />
          </TabsContent>
          <TabsContent value="bills" className="mt-0">
            <PurchaseBillsClient bills={bills} hideHeader />
          </TabsContent>
          <TabsContent value="returns" className="mt-0">
            <PurchaseReturnsClient returns={returns} hideHeader />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
