"use client";

import Link from "next/link";
import { Plus, Edit, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

import { useState, useEffect, useTransition } from "react";
import { getProducts, deleteProduct } from "@/actions/products";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { ProductFilter } from "@/actions/products/types";

export function ProductsClient({
  products: initialProducts,
  outletId,
}: {
  products: any[];
  outletId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const [data, setData] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProductFilter>({
    search: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    startTransition(async () => {
      try {
        const result = await getProducts(outletId, filters);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [filters, outletId, isDeleting]);

  const handleDelete = async () => {
    if (!deleteId || !session?.user?.id) return;

    try {
      setIsDeleting(true);
      await deleteProduct(deleteId, session.user.id);
      toast.success("Product deleted successfully");
      await fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
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
      header: "Brand",
      size: 140,
      cell: ({ getValue }) =>
        (getValue() as string) || (
          <span className="text-text-disabled">No Brand</span>
        ),
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 180,
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-text-secondary">
          {(getValue() as any)?.name}
        </span>
      ),
    },
    {
      accessorKey: "gstRate",
      header: () => <div className="text-center">GST %</div>,
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
      header: () => <div className="text-center">Variants</div>,
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
      header: () => <div className="text-right">Status</div>,
      size: 100,
      cell: ({ getValue }) => {
        const isArchived = getValue() as boolean;
        return (
          <div className="flex justify-end">
            <StatusBadge
              status={isArchived ? "cancelled" : "completed"}
              label={isArchived ? "Archived" : "Active"}
            />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right px-4">Actions</div>,
      size: 150,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2 pr-2">
          <Link
            href={`/dashboard/master-data/products/${row.original.id}/edit`}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-brand transition-all border border-border/50 hover:border-brand/30 shadow-sm"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteId(row.original.id)}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-surface-elevated hover:bg-red-50 text-text-secondary hover:text-red-600 transition-all border border-border/50 hover:border-red-200 shadow-sm"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbs = [
    { label: "Master Data" },
    { label: "Products", href: "/dashboard/master-data/products" },
  ];

  const actions = [
    {
      label: "Add Product",
      icon: Plus,
      onClick: () => router.push("/dashboard/master-data/products/new"),
    },
  ];

  return (
    <div className="space-y-4 translate-y-[-8px]">
      <PageHeader
        title="Product Master"
        subtitle="Manage industrial items, brands, and variants across outlets."
        breadcrumbs={breadcrumbs}
      />

      <TableToolbar
        searchPlaceholder="Filter by name, brand or SKU..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={actions}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={isPending || isDeleting}
      />

      <Pagination
        currentPage={1}
        totalPages={1}
        pageSize={10}
        totalResults={data.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />

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
                Delete Product?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-800/70 font-medium text-sm">
                This action cannot be undone. This product will be permanently
                removed from the master catalog.
                <br />
                <br />
                <span className="font-bold text-red-600">
                  Note: Deletion will fail if any stock is still available.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-6 pt-0 bg-white flex items-center justify-center gap-3 sm:justify-center">
            <AlertDialogCancel className="rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold text-xs uppercase px-8 hover:bg-slate-100 transition-all hover:text-slate-900">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-2xl bg-red-600 text-white font-bold text-xs uppercase px-8 hover:bg-red-700 transition-all shadow-xl shadow-red-100"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
