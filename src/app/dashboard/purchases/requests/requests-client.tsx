"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { updatePurchaseRequestStatus } from "@/actions/purchases/requests";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PurchaseRequestsClient({ requests }: { requests: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleStatus(id: string, status: "APPROVED" | "REJECTED") {
    try {
      setLoadingId(id);
      await updatePurchaseRequestStatus(id, status);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "PR Number",
      cell: ({ getValue }) => (
        <span className="font-bold text-brand">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-text-secondary text-sm">
          {format(new Date(getValue() as string), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "items",
      header: "Requested Items",
      cell: ({ row }) => {
        const items = row.original.items;
        if (!items || items.length === 0) return <span>-</span>;
        return (
          <div className="flex flex-col text-xs text-text-secondary gap-1 max-w-[250px]">
            {items.slice(0, 2).map((it: any) => (
              <span key={it.id} className="truncate">
                {it.quantity} x {it.variant?.product?.name} ({it.variant?.sku})
              </span>
            ))}
            {items.length > 2 && (
              <span className="text-brand font-medium">
                +{items.length - 2} more...
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "grandTotal",
      header: "Est. Total (₹)",
      cell: ({ getValue }) => {
        const amount = getValue() as number;
        return <span className="font-bold">₹{amount.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-primary text-secondary";
        if (status === "APPROVED") style = "bg-green-100 text-green-700";
        if (status === "REJECTED") style = "bg-red-100 text-red-700";
        if (status === "DRAFT" || status === "PENDING_APPROVAL")
          style = "bg-yellow-100 text-yellow-700";

        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${style}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Approvals",
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original.id;
        if (status === "APPROVED" || status === "REJECTED") {
          return <span className="text-xs text-text-disabled">Settled</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
              disabled={loadingId === id}
              onClick={() => handleStatus(id, "APPROVED")}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
              disabled={loadingId === id}
              onClick={() => handleStatus(id, "REJECTED")}
            >
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Requests"
        subtitle="Review and approve internal purchase requests (L1/L2 matrix applied)"
        breadcrumbs={[
          { label: "Purchases", href: "/dashboard/purchases" },
          { label: "Requests" },
        ]}
      />

      <TableToolbar searchPlaceholder="Search PR number..." />

      <DataTable columns={columns} data={requests} />
    </div>
  );
}
