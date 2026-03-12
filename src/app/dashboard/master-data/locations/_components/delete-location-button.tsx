"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteWarehouse, deleteOutlet } from "@/actions/locations";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteLocationButtonProps {
  id: string;
  type: "warehouse" | "outlet";
  name: string;
}

export function DeleteLocationButton({
  id,
  type,
  name,
}: DeleteLocationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (type === "warehouse") {
        await deleteWarehouse(id);
      } else {
        await deleteOutlet(id);
      }
      toast.success(
        `${type === "warehouse" ? "Warehouse" : "Outlet"} deleted successfully`,
      );
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${type}. It might have linked records.`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8 transition-colors"
        title={`Delete ${type}`}
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title={`Delete ${type === "warehouse" ? "Warehouse" : "Outlet"}`}
        description={`Are you sure you want to delete ${type} "${name}"? This action cannot be undone and might fail if there are linked transactions.`}
        confirmText="Delete Now"
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
