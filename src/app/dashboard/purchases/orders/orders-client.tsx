"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { useRouter } from "next/navigation";
import { Plus, Check, Receipt } from "lucide-react";
import { acceptPurchaseOrder } from "@/actions/procurement";
import { useOutletStore } from "@/store/use-outlet-store";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPurchaseBill } from "@/actions/procurement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PurchaseOrdersClient({
  orders,
  hideHeader = false,
}: {
  orders: any[];
  hideHeader?: boolean;
}) {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const { data: session } = useSession();
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isBilling, setIsBilling] = useState<string | null>(null);
  const [selectedPoForBill, setSelectedPoForBill] = useState<any | null>(null);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [freightCost, setFreightCost] = useState("0");

  const handleAccept = async (poId: string) => {
    if (!currentOutletId || !session?.user?.id) {
      toast.error("Authentication or Outlet context missing");
      return;
    }

    try {
      setIsAccepting(poId);
      await acceptPurchaseOrder(poId, currentOutletId, session.user.id);
      toast.success("Purchase Order accepted and stock updated");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept order");
    } finally {
      setIsAccepting(null);
    }
  };

  const handleCreateBill = async () => {
    if (!selectedPoForBill || !session?.user?.id) return;

    try {
      setIsBilling(selectedPoForBill.id);
      await createPurchaseBill({
        sourceId: selectedPoForBill.id,
        billNumber,
        billDate: new Date(billDate),
        freightCost: parseFloat(freightCost) || 0,
        userId: session.user.id,
      });

      toast.success("Purchase Bill generated successfully");
      setSelectedPoForBill(null);
      setBillNumber("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create bill");
    } finally {
      setIsBilling(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "txnNumber",
      header: "PO #",
      cell: ({ getValue }) => (
        <span className="font-bold text-blue-600">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => (
        <span>{format(new Date(getValue() as string), "dd MMM yyyy")}</span>
      ),
    },
    {
      accessorKey: "party.name",
      header: "Vendor",
      cell: ({ row }) => <span>{row.original.party?.name || "N/A"}</span>,
    },
    {
      accessorKey: "grandTotal",
      header: "Total Amount (₹)",
      cell: ({ getValue }) => (
        <span className="font-bold">₹{Number(getValue()).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let style = "bg-blue-100 text-blue-700";
        if (status === "ACCEPTED") style = "bg-green-100 text-green-700";
        return (
          <span
            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${style}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original.id;

        if (status === "ACCEPTED" || status === "COMPLETED") {
          return <span className="text-xs text-text-disabled">Processed</span>;
        }

        if (status === "ACCEPTED") {
          return (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => setSelectedPoForBill(row.original)}
            >
              <Receipt className="w-3.5 h-3.5 mr-1" />
              Convert to Bill
            </Button>
          );
        }

        if (status === "COMPLETED") {
          return (
            <span className="text-xs text-text-disabled italic font-medium">
              Billed
            </span>
          );
        }

        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            disabled={isAccepting === id}
            onClick={() => handleAccept(id)}
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Accept
          </Button>
        );
      },
    },
  ];

  const actions = [
    {
      label: "New Purchase Order",
      icon: Plus,
      onClick: () => router.push("/dashboard/purchases/orders/new"),
    },
  ];

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <PageHeader
          title="Purchase Orders"
          subtitle="Manage procurement requests sent to vendors."
          breadcrumbs={[{ label: "Purchases" }, { label: "Orders" }]}
          actions={actions}
        />
      )}
      <div
        className={`${!hideHeader ? "bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-2" : ""}`}
      >
        <TableToolbar searchPlaceholder="Search PO #..." />
        <DataTable columns={columns} data={orders} />
      </div>

      <Dialog
        open={!!selectedPoForBill}
        onOpenChange={(open) => !open && setSelectedPoForBill(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Receipt className="w-5 h-5 text-green-600" />
              Generate Purchase Bill
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="billNumber"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Vendor Bill Number
              </Label>
              <Input
                id="billNumber"
                placeholder="e.g. INV/2023/001"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="billDate"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Bill Date
              </Label>
              <Input
                id="billDate"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="freight"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Freight / Carriage (₹)
              </Label>
              <Input
                id="freight"
                type="number"
                value={freightCost}
                onChange={(e) => setFreightCost(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-[10px] text-slate-400 italic">
                * This amount will be distributed proportionally across all
                items.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSelectedPoForBill(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBill}
              disabled={!billNumber || !billDate || !!isBilling}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8"
            >
              {isBilling ? "Generating..." : "Generate Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
