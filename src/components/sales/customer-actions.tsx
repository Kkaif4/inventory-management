"use client";

import { Button } from "@/components/ui/button";
import { Pencil, FileText, CreditCard, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CustomerEditDrawer } from "./customer-edit-drawer";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/actions/sales/customers";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";
import { toast } from "sonner";

interface CustomerActionsProps {
  customerId: string;
  name: string;
  onRecordPayment?: () => void;
}

export function CustomerActions({
  customerId,
  name,
  onRecordPayment,
}: CustomerActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
        <Pencil className="w-4 h-4 mr-2 text-slate-500" />
        Edit
      </Button>

      {onRecordPayment ? (
        <Button variant="outline" size="sm" onClick={onRecordPayment}>
          <CreditCard className="w-4 h-4 mr-2 text-slate-500" />
          Record Payment
        </Button>
      ) : (
        <Link
          href={`/dashboard/accounts/payments/receipts/new?partyId=${customerId}&source=customer&sourceId=${customerId}&sourceName=${encodeURIComponent(name)}`}
        >
          <Button variant="outline" size="sm">
            <CreditCard className="w-4 h-4 mr-2 text-slate-500" />
            Record Payment
          </Button>
        </Link>
      )}

      <Link href={`/dashboard/sales/customers/${customerId}/ledger`}>
        <Button variant="outline" size="sm">
          <BookOpen className="w-4 h-4 mr-2 text-slate-500" />
          Statement
        </Button>
      </Link>

      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>

      <CustomerEditDrawer
        customerId={customerId}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      <ReusableConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          const res = await deleteCustomer(customerId);
          setIsDeleting(false);
          if (res.success) {
            toast.success("Customer deleted");
            router.push("/dashboard/sales/customers");
          } else {
            toast.error(res.error?.message || "Failed to delete");
            setIsDeleteOpen(false);
          }
        }}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Customer"}
        isLoading={isDeleting}
      />
    </div>
  );
}
