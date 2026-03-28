"use client";

import Link from "next/link";
import { Plus, Edit, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { useRouter, useSearchParams } from "next/navigation";

import { useState, useEffect, useTransition, useCallback } from "react";
import { deleteProduct } from "@/actions/products";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImportProductsDialog } from "./import-products-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { PaginationMeta } from "@/types/pagination";

export function ProductsClient({
  products: initialProducts,
  pagination: initialPagination,
  outletId,
}: {
  products: any[];
  pagination?: PaginationMeta;
  outletId: string;
}) {
  const t = useTranslations("products");
  const common = useTranslations("common");
  const dashboardTable = useTranslations("dashboard.table");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const [data, setData] = useState(initialProducts);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Sync data state with props when products or pagination changes
  useEffect(() => {
    setData(initialProducts);
  }, [initialProducts, initialPagination]);

  // Use initialPagination for current page/limit
  const currentPage = initialPagination?.page || 1;
  const currentLimit = initialPagination?.limit || 10;

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      if (currentLimit !== 10) {
        params.set("limit", String(currentLimit));
      } else {
        params.delete("limit");
      }
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, startTransition, currentLimit, searchParams],
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      if (limit !== 10) {
        params.set("limit", String(limit));
      } else {
        params.delete("limit");
      }
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, startTransition, searchParams],
  );

  const handleDelete = async () => {
    if (!deleteId || !session?.user?.id) return;

    try {
      setIsDeleting(true);
      const res = await deleteProduct(deleteId, session.user.id);
      if (res.success) {
        toast.success(t("toasts.deleted"));
        router.refresh();
      } else {
        toast.error(`${t("toasts.deleteFailed")}: ${res.error?.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.deleteError"));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: t("productName"),
      cell: ({ getValue, row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary uppercase tracking-tight">
            {getValue() as string}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded uppercase">
              HSN: {row.original.hsnCode}
            </span>
            <span className="text-2xs font-medium text-text-muted">
              Unit: {row.original.baseUnit}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: t("brand"),
      size: 140,
      cell: ({ getValue }) =>
        (getValue() as string) || (
          <span className="text-text-disabled">{t("noBrand")}</span>
        ),
    },
    {
      accessorKey: "category",
      header: dashboardTable("category"),
      size: 180,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-text-secondary">
          {(getValue() as any)?.name}
        </span>
      ),
    },
    {
      accessorKey: "gstRate",
      header: () => <div className="text-center">{t("gstPercentage")}</div>,
      size: 80,
      cell: ({ getValue }) => (
        <div className="flex justify-center">
          <span className="bg-brand/5 text-brand px-2 py-0.5 rounded font-bold text-xs ring-1 ring-brand/10">
            {getValue() as number}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: "_count",
      header: () => <div className="text-center">{t("variants")}</div>,
      size: 100,
      cell: ({ getValue, row }) => (
        <div className="flex justify-center">
          <Link
            href={`/dashboard/master-data/products/${row.original.id}/variants`}
            className="text-brand font-bold hover:underline decoration-brand/30 underline-offset-4"
          >
            {(getValue() as any).variants}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "isArchived",
      header: () => (
        <div className="text-right">{dashboardTable("status")}</div>
      ),
      size: 100,
      cell: ({ getValue }) => {
        const isArchived = getValue() as boolean;
        return (
          <div className="flex justify-end">
            <StatusBadge
              status={isArchived ? "cancelled" : "completed"}
              label={isArchived ? common("archived") : common("active")}
            />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right px-4">{common("actionsHeader")}</div>
      ),
      size: 150,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2 pr-2">
          <Link
            href={`/dashboard/master-data/products/${row.original.id}/edit`}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-brand transition-all border border-border/50 hover:border-brand/30 shadow-sm"
            title={t("editProduct")}
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteId(row.original.id)}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-elevated hover:bg-red-50 text-text-secondary hover:text-red-600 transition-all border border-border/50 hover:border-red-200 shadow-sm"
            title={t("deleteProduct")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbs = [
    { label: common("groups.masterData") },
    {
      label: t("addProduct").replace("Add ", ""),
      href: "/dashboard/master-data/products",
    },
  ];

  const actions = [
    {
      label: t("importProducts"),
      icon: FileSpreadsheet,
      variant: "outline" as const,
      onClick: () => setImportDialogOpen(true),
    },
    {
      label: t("addProduct"),
      icon: Plus,
      onClick: () => router.push("/dashboard/master-data/products/new"),
    },
  ];

  return (
    <div className="space-y-4 translate-y-[-8px]">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder={t("searchPlaceholder")}
        searchValue=""
        onSearchChange={() => {}}
        actions={actions}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={isPending || isDeleting}
        manualPagination
      />

      {initialPagination && (
        <PaginationControls
          page={currentPage}
          totalPages={initialPagination.totalPages}
          limit={currentLimit}
          total={initialPagination.total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isPending={isPending}
        />
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-sm">
          <div className="bg-red-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black text-red-900 uppercase tracking-tight">
                {t("deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-800/70 font-medium text-sm">
                {t("deleteDialog.description")}
                <br />
                <br />
                <span className="font-bold text-red-600">
                  {t("deleteDialog.note")}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-6 pt-0 bg-white flex items-center justify-center gap-3 sm:justify-center">
            <AlertDialogCancel className="rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold text-xs uppercase px-8 hover:bg-slate-100 transition-all hover:text-slate-900">
              {common("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-2xl bg-red-600 text-white font-bold text-xs uppercase px-8 hover:bg-red-700 transition-all shadow-xl shadow-red-100"
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportProductsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        outletId={outletId}
      />
    </div>
  );
}
