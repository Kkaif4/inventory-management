"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Calendar,
  User,
  Truck,
  Hash,
  Package,
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { lookupSerialNumberWarranty } from "@/actions/sales/warranty";

interface WarrantyData {
  id: string;
  serialNumber: string;
  status: "AVAILABLE" | "SOLD" | "DAMAGED" | "RETURNED";
  warrantyMonths: number;
  warrantyExpiry: string | null;
  isWarrantyActive: boolean;
  variant: {
    sku: string;
    name: string;
    brand: string | null;
  };
  purchase: {
    id: string;
    txnNumber: string;
    date: string;
    partyName: string | null;
  } | null;
  sale: {
    id: string;
    txnNumber: string;
    date: string;
    buyerName: string | null;
    buyerPhone: string | null;
  } | null;
}

export function WarrantyClient({ outletId }: { outletId: string }) {
  const common = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [serialInput, setSerialInput] = useState("");
  const [searchedSerial, setSearchedSerial] = useState("");
  const [warrantyData, setWarrantyData] = useState<WarrantyData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if serial is in the URL query params
  useEffect(() => {
    const urlSerial = searchParams.get("serial");
    if (urlSerial) {
      const cleanSerial = urlSerial.trim();
      setSerialInput(cleanSerial);
      setSearchedSerial(cleanSerial);
      handleSearch(cleanSerial);
    }
  }, [searchParams]);

  const handleSearch = async (serial: string) => {
    if (!serial) {
      toast.error("Please enter a serial number");
      return;
    }

    startTransition(async () => {
      try {
        const res = await lookupSerialNumberWarranty(outletId, serial);
        if (res.success) {
          setWarrantyData(res.data as WarrantyData | null);
        } else {
          toast.error(res.error?.message || "Failed to lookup warranty status");
          setWarrantyData(null);
        }
        setHasSearched(true);
      } catch (error) {
        console.error("Error looking up warranty:", error);
        toast.error("An unexpected error occurred");
        setWarrantyData(null);
        setHasSearched(true);
      }
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;

    // Update URL query parameters for shareability
    const params = new URLSearchParams(searchParams.toString());
    params.set("serial", serialInput.trim());
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setSerialInput("");
    setWarrantyData(null);
    setHasSearched(false);
    setSearchedSerial("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("serial");
    router.push(`?${params.toString()}`);
  };

  const getStatusDetails = (data: WarrantyData) => {
    switch (data.status) {
      case "SOLD":
        if (data.isWarrantyActive) {
          return {
            title: "Warranty Active",
            description: `This product is covered under warranty until ${formatDate(data.warrantyExpiry!)}.`,
            badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-900/50",
            icon: ShieldCheck,
            themeColor: "emerald"
          };
        } else {
          return {
            title: "Warranty Expired",
            description: `The warranty coverage expired on ${formatDate(data.warrantyExpiry!)}.`,
            badgeClass: "bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-400 dark:border-rose-900/50",
            icon: ShieldAlert,
            themeColor: "rose"
          };
        }
      case "AVAILABLE":
        return {
          title: "In Stock (Available)",
          description: `This item is available in stock. The default ${data.warrantyMonths}-month warranty will activate upon sale.`,
          badgeClass: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-900/50",
          icon: Package,
          themeColor: "blue"
        };
      case "DAMAGED":
        return {
          title: "Damaged / Defective",
          description: "This item is marked as damaged. It cannot be sold or verified for active warranty.",
          badgeClass: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-900/50",
          icon: AlertCircle,
          themeColor: "amber"
        };
      case "RETURNED":
        return {
          title: "Returned to Inventory",
          description: "This item has been returned. Active warranty status has been reset.",
          badgeClass: "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-400 dark:border-slate-800",
          icon: ShieldQuestion,
          themeColor: "slate"
        };
      default:
        return {
          title: "Unknown Status",
          description: "This item's status cannot be determined.",
          badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
          icon: ShieldQuestion,
          themeColor: "slate"
        };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Warranty Lookup"
        subtitle="Verify warranty coverage status, expiration dates, and transaction history"
        breadcrumbs={[
          { label: common("groups.sales"), href: "/dashboard/sales/transactions" },
          { label: "Warranty Lookup" }
        ]}
      />

      {/* Search Input Card */}
      <Card className="rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-muted" />
              <Input
                type="text"
                placeholder="Scan bar-code or type Serial Number (e.g. SN-1001)..."
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                className="pl-10 h-10 w-full rounded-2xl bg-slate-50 border-slate-200 focus-visible:bg-white text-base focus-visible:ring-emerald-500/20"
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending || !serialInput.trim()}
                className="rounded-2xl h-10 px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100/50 dark:shadow-none transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
              {hasSearched && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="rounded-2xl h-10 px-4 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {isPending && (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-slate-100 rounded-[2.5rem]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-100 rounded-[2rem]" />
            <div className="h-48 bg-slate-100 rounded-[2rem]" />
            <div className="h-48 bg-slate-100 rounded-[2rem]" />
          </div>
        </div>
      )}

      {/* Results View */}
      {!isPending && hasSearched && warrantyData && (
        <div className="space-y-6">
          {/* Main Status Callout Banner */}
          {(() => {
            const details = getStatusDetails(warrantyData);
            const StatusIcon = details.icon;
            return (
              <div className={cn(
                "rounded-[2.5rem] border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm",
                details.themeColor === "emerald" && "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40",
                details.themeColor === "rose" && "bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40",
                details.themeColor === "blue" && "bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40",
                details.themeColor === "amber" && "bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40",
                details.themeColor === "slate" && "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl flex items-center justify-center border shadow-sm shrink-0",
                    details.themeColor === "emerald" && "bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400",
                    details.themeColor === "rose" && "bg-rose-100 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400",
                    details.themeColor === "blue" && "bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400",
                    details.themeColor === "amber" && "bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400",
                    details.themeColor === "slate" && "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                  )}>
                    <StatusIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold uppercase tracking-tight text-slate-950 dark:text-slate-50">
                        {details.title}
                      </h2>
                      <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider", details.badgeClass)}>
                        {warrantyData.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary max-w-2xl">
                      {details.description}
                    </p>
                  </div>
                </div>

                {warrantyData.status === "SOLD" && warrantyData.warrantyExpiry && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4 flex items-center gap-4 shadow-sm md:self-stretch min-w-[240px]">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        {warrantyData.isWarrantyActive ? "Expires In" : "Expired Since"}
                      </span>
                      <span className={cn(
                        "text-base font-black tracking-tight",
                        warrantyData.isWarrantyActive ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {(() => {
                          const expiry = new Date(warrantyData.warrantyExpiry);
                          const today = new Date();
                          const diffTime = expiry.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                          if (diffDays < 0) {
                            const absDays = Math.abs(diffDays);
                            if (absDays < 30) return `${absDays} Days ago`;
                            const months = Math.floor(absDays / 30);
                            return `${months} ${months === 1 ? "Month" : "Months"} ago`;
                          }

                          if (diffDays < 30) return `${diffDays} Days`;
                          const months = Math.floor(diffDays / 30);
                          return `${months} ${months === 1 ? "Month" : "Months"}`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1: Product info */}
            <Card className="rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 font-bold uppercase tracking-tight text-sm text-slate-800">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Product Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Product Name</label>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase">
                    {warrantyData.variant.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">SKU Code</label>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 font-mono text-xs">
                      {warrantyData.variant.sku}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Brand</label>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 uppercase text-xs">
                      {warrantyData.variant.brand || "—"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Warranty Duration</label>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 text-xs">
                      {warrantyData.warrantyMonths} Months
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Serial Number</label>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono text-xs">
                      {warrantyData.serialNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Column 2: Sales Info */}
            <Card className="rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 font-bold uppercase tracking-tight text-sm text-slate-800">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Sales Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                {warrantyData.sale ? (
                  <>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Customer Name</label>
                      <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase">
                        {warrantyData.sale.buyerName || "Walk-in Customer"}
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Customer Phone</label>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 font-mono text-xs">
                        {warrantyData.sale.buyerPhone || "—"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Invoice Number</label>
                        <p className="mt-0.5">
                          <Link
                            href={`/dashboard/sales/invoices/${warrantyData.sale.id}`}
                            className="font-bold text-blue-600 hover:underline text-xs"
                          >
                            {warrantyData.sale.txnNumber}
                          </Link>
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Sale Date</label>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 text-xs">
                          {formatDate(warrantyData.sale.date)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-muted">
                    <FileText className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-xs font-semibold">Not Sold Yet</p>
                    <p className="text-[10px] text-text-disabled max-w-[180px] mt-0.5">
                      Warranty coverage starts automatically upon generation of a sales invoice.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 3: Purchase / Procurement Info */}
            <Card className="rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 font-bold uppercase tracking-tight text-sm text-slate-800">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Procurement Source</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                {warrantyData.purchase ? (
                  <>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Supplier / Vendor</label>
                      <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 uppercase">
                        {warrantyData.purchase.partyName || "Unknown Vendor"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Reference / GRN</label>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 text-xs">
                          {warrantyData.purchase.txnNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Receipt Date</label>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 text-xs">
                          {formatDate(warrantyData.purchase.date)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-muted">
                    <Truck className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-xs font-semibold">No Purchase Record</p>
                    <p className="text-[10px] text-text-disabled max-w-[180px] mt-0.5">
                      This item was registered without a standard purchase document reference.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* Not Found View */}
      {!isPending && hasSearched && !warrantyData && (
        <Card className="rounded-[2.5rem] shadow-sm border border-rose-100 bg-rose-50/20 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-rose-50 rounded-full border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-rose-950">
              Serial Number Not Registered
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-md">
              No warranty record found for serial number <span className="font-bold font-mono text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded">"{searchedSerial}"</span> in this outlet.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-left bg-white border border-slate-200 rounded-2xl p-4 text-xs max-w-sm shadow-sm">
              <p className="font-bold text-slate-800 uppercase tracking-tight">Troubleshooting Tips:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Verify spelling and check for hyphens/extra characters.</li>
                <li>Make sure the serial number was scanned under the active outlet.</li>
                <li>Ensure the purchase GRN or PO has been marked as accepted.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial Welcome / Blank State */}
      {!isPending && !hasSearched && (
        <Card className="rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center text-center p-16">
            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              Lookup Warranty Status
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md">
              Scan or enter a product serial number to check its current warranty validity, expiration countdown, customer details, and transaction history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
