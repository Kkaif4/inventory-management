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
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Sub-clients
import { PurchaseRequestsClient } from "./requests/requests-client";
import { PurchaseOrdersClient } from "./orders/orders-client";
import { PurchaseReturnsClient } from "./returns/returns-client";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PaginationMeta } from "@/types/pagination";

interface PurchasesClientProps {
  initialData: any[];
  initialPagination: PaginationMeta;
  tab: string;
}

export function PurchasesClient({
  initialData,
  initialPagination,
  tab: initialTab,
}: PurchasesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const currentTab = initialTab || "orders";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentLimit = parseInt(searchParams.get("limit") || "10", 10);

  // Sync data when pagination changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleTabChange = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams();
      params.set("tab", newTab);
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("tab", currentTab);
      params.set("page", String(page));
      if (currentLimit !== 10) params.set("limit", String(currentLimit));
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, currentTab, currentLimit],
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      const params = new URLSearchParams();
      params.set("tab", currentTab);
      params.set("page", "1");
      if (limit !== 10) params.set("limit", String(limit));
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, currentTab],
  );

  // Dynamic header based on tab
  const getHeaderInfo = () => {
    switch (currentTab) {
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
          { label: currentTab.charAt(0).toUpperCase() + currentTab.slice(1) },
        ]}
        actions={header.actions}
      />

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
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

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
          <TabsContent value="requests" className="mt-0">
            <PurchaseRequestsClient
              initialData={currentTab === "requests" ? data : []}
              initialPagination={
                currentTab === "requests" ? initialPagination : undefined
              }
              hideHeader
            />
          </TabsContent>
          <TabsContent value="orders" className="mt-0">
            <PurchaseOrdersClient
              initialData={currentTab === "orders" ? data : []}
              hideHeader
            />
          </TabsContent>
          <TabsContent value="bills" className="mt-0">
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Displaying {data.length} bills
              </p>
            </div>
          </TabsContent>
          <TabsContent value="returns" className="mt-0">
            <PurchaseReturnsClient
              initialData={currentTab === "returns" ? data : []}
              initialPagination={
                currentTab === "returns" ? initialPagination : undefined
              }
              hideHeader
            />
          </TabsContent>

          {initialPagination && (
            <PaginationControls
              page={initialPagination.page}
              totalPages={initialPagination.totalPages}
              limit={initialPagination.limit}
              total={initialPagination.total}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              isPending={isPending}
            />
          )}
        </div>
      </Tabs>
    </div>
  );
}
