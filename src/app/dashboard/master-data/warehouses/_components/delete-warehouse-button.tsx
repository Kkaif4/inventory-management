"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteWarehouse } from "@/actions/warehouses";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteWarehouseButtonProps {
  id: string;
  name: string;
}

export function DeleteWarehouseButton({
  id,
  name,
}: DeleteWarehouseButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteWarehouse(id);
      toast.success("Warehouse deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete warehouse. It might have linked records.");
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
        title="Delete warehouse"
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
        title="Delete Warehouse"
        description={`Are you sure you want to delete warehouse "${name}"? This action cannot be undone and might fail if there are linked transactions.`}
        confirmText="Delete Now"
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
