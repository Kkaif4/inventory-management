"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, XCircle, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttachmentSection } from "@/components/attachments/attachment-section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOutletStore } from "@/store/use-outlet-store";
import { getExpenseDetail, cancelExpense, deleteExpense, postExpense } from "@/actions/expenses";
import type { ExpenseDetail } from "@/types/expense.types";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;
  const outletId = useOutletStore((state) => state.currentOutlet?.id);

  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"post" | "cancel" | "delete" | null>(null);

  const loadExpense = useCallback(async () => {
    if (!outletId) return;

    try {
      setLoading(true);
      const res = await getExpenseDetail(expenseId, outletId);

      if (!res.success || !res.data) {
        toast.error(res.error?.message || "Failed to load expense");
        return;
      }

      setExpense(res.data);
    } catch (error) {
      toast.error("Failed to load expense details");
    } finally {
      setLoading(false);
    }
  }, [expenseId, outletId]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const handleAction = async () => {
    if (!expense || !outletId) return;

    try {
      setIsSubmitting(true);

      let result;
      if (actionType === "post") {
        result = await postExpense(expense.id, outletId);
      } else if (actionType === "cancel") {
        result = await cancelExpense(expense.id, outletId);
      } else {
        result = await deleteExpense(expense.id, outletId);
      }

      if (!result.success) {
        toast.error(result.error?.message ?? "Action failed");
        return;
      }

      toast.success(
        actionType === "post"
          ? "Expense posted successfully"
          : actionType === "cancel"
            ? "Expense cancelled successfully"
            : "Expense deleted successfully"
      );

      if (actionType === "delete") {
        router.push("/dashboard/expenses");
      } else {
        setActionDialogOpen(false);
        setActionType(null);
        await loadExpense();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">Expense not found</p>
        <Link href="/dashboard/expenses">
          <Button variant="outline">Back to Expenses</Button>
        </Link>
      </div>
    );
  }

  const canPost = expense.status === "DRAFT";
  const canCancel = expense.status === "POSTED" || expense.status === "DRAFT";
  const canDelete = expense.status === "CANCELLED";

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/expenses">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              {expense.txnNumber}
            </h1>
          </div>
          <StatusBadge status={expense.status.toLowerCase()} />
        </div>

        <div className="flex gap-2">
          {canPost && (
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setActionType("post");
                setActionDialogOpen(true);
              }}
            >
              Post Expense
            </Button>
          )}
          {canCancel && !canPost && (
            <Button
              variant="outline"
              className="gap-2 text-amber-600 border-amber-200"
              onClick={() => {
                setActionType("cancel");
                setActionDialogOpen(true);
              }}
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200"
              onClick={() => {
                setActionType("delete");
                setActionDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Taxable Amount</p>
            <p className="text-lg font-bold text-slate-900">
              ₹{Number(expense.taxableAmount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">GST Amount</p>
            <p className="text-lg font-bold text-slate-900">
              ₹{Number(expense.inputGst).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
            <p className="text-lg font-bold text-blue-600">
              ₹{Number(expense.totalAmount).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Payment Mode</p>
            <p className="text-sm font-semibold text-slate-900">
              {expense.paymentMode}
            </p>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-4">
            Expense Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(expense.date), "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <p className="text-sm font-semibold text-slate-900">
                {expense.category.name} ({expense.category.code})
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Vendor</p>
              <p className="text-sm font-semibold text-slate-900">
                {expense.vendor?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Account</p>
              <p className="text-sm font-semibold text-slate-900">
                {expense.account.name}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Description</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {expense.description}
          </p>
        </div>

        {expense.gstRate && (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">GST Rate</p>
            <p className="text-sm font-semibold text-slate-900">
              {expense.gstRate}%
            </p>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <AttachmentSection
        moduleType="EXPENSE"
        referenceId={expense.id}
        className="mt-6"
      />

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "post"
                ? "Post Expense?"
                : actionType === "cancel"
                  ? "Cancel Expense?"
                  : "Delete Expense?"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "post"
                ? "This will post the expense and deduct the amount from the account balance."
                : actionType === "cancel"
                  ? "This action cannot be undone. The expense status will change to Cancelled."
                  : "This action cannot be undone. The expense will be permanently deleted."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isSubmitting}
              className={
                actionType === "post"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
