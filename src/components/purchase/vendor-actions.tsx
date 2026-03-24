"use client";

import { Button } from "@/components/ui/button";
import { Pencil, FileText, CreditCard, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VendorEditDrawer } from "./vendor-edit-drawer";
import { deleteVendor } from "@/actions/purchase/vendors";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";
import { toast } from "sonner";

interface VendorActionsProps {
  vendorId: string;
  name: string;
  onMakePayment?: () => void;
}

export function VendorActions({ vendorId, name, onMakePayment }: VendorActionsProps) {
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

      <Link href={`/dashboard/purchases/bills/new?vendor=${vendorId}`}>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2 text-slate-500" />
          New Bill
        </Button>
      </Link>

      {onMakePayment ? (
        <Button variant="outline" size="sm" onClick={onMakePayment}>
          <CreditCard className="w-4 h-4 mr-2 text-slate-500" />
          Make Payment
        </Button>
      ) : (
        <Link href={`/dashboard/accounts/payments/made/new?partyId=${vendorId}&source=vendor&sourceId=${vendorId}&sourceName=${encodeURIComponent(name)}`}>
          <Button variant="outline" size="sm">
            <CreditCard className="w-4 h-4 mr-2 text-slate-500" />
            Make Payment
          </Button>
        </Link>
      )}

      <Link href={`/dashboard/purchase/vendors/${vendorId}/ledger`}>
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

      <VendorEditDrawer
        vendorId={vendorId}
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
          const res = await deleteVendor(vendorId);
          setIsDeleting(false);
          if (res.success) {
            toast.success("Vendor deleted");
            router.push("/dashboard/purchase/vendors");
          } else {
            toast.error(res.error?.message || "Failed to delete");
            setIsDeleteOpen(false);
          }
        }}
        title="Delete Vendor"
        description="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Vendor"}
        isLoading={isDeleting}
      />
    </div>
  );
}
