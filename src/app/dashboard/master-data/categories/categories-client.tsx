"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Plus,
  Edit2,
  Check,
  Trash2,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";
import {
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
  deleteCategory,
} from "@/actions/categories";
import { ReusableConfirmDialog } from "@/components/ui/reusable-confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ParentCategoryCombobox } from "@/components/form/parent-category-combobox";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { PaginationMeta } from "@/types/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { TableToolbar } from "@/components/ui/table-toolbar";

type CategoryWithCounts = any;

interface CategoriesClientProps {
  categories: CategoryWithCounts[];
  pagination?: PaginationMeta;
  outletId: string;
}

export function CategoriesClient({
  categories: initialCategories,
  pagination: initialPagination,
  outletId,
}: CategoriesClientProps) {
  const t = useTranslations("categories");
  const common = useTranslations("common");
  const dashboardTable = useTranslations("dashboard.table");
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", parentId: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", parentId: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync data state with props when categories or pagination changes
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories, initialPagination]);

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

  const refreshData = () => {
    router.refresh();
  };

  const handleCreate = async () => {
    if (!session?.user?.id || !currentOutletId) return;
    try {
      const res = await createCategory({
        name: newForm.name,
        parentId: newForm.parentId || undefined,
        userId: session.user.id,
        outletId: currentOutletId,
      });

      if (res.success) {
        toast.success(t("toasts.created"));
        setIsAdding(false);
        setNewForm({ name: "", parentId: "" });
        refreshData();
      } else {
        toast.error(`${t("toasts.createFailed")}: ${res.error?.message}`);
      }
    } catch (err) {
      toast.error(t("toasts.createFailed"));
    }
  };

  const handleUpdate = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await updateCategory({
        id,
        name: editForm.name,
        description: editForm.description,
        parentId: editForm.parentId || null,
        userId: session.user.id,
      });

      if (res.success) {
        toast.success(t("toasts.updated"));
        setEditingId(null);
        refreshData();
      } else {
        toast.error(`${t("toasts.updateFailed")}: ${res.error?.message}`);
      }
    } catch (err) {
      toast.error(t("toasts.updateFailed"));
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await deactivateCategory(id, session.user.id);
      if (res.success) {
        toast.success(t("toasts.deactivated"));
        refreshData();
      } else {
        toast.error(`${t("toasts.deactivateFailed")}: ${res.error?.message}`);
      }
    } catch (err) {
      toast.error(t("toasts.deactivateFailed"));
    }
  };

  const handleActivate = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await activateCategory(id, session.user.id);
      if (res.success) {
        toast.success(t("toasts.activated"));
        refreshData();
      } else {
        toast.error(`${t("toasts.activateFailed")}: ${res.error?.message}`);
      }
    } catch (err) {
      toast.error(t("toasts.activateFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId || !session?.user?.id) return;
    try {
      const res = await deleteCategory(deleteConfirmId, session.user.id);
      if (res.success) {
        toast.success(t("toasts.deleted"));
        setDeleteConfirmId(null);
        refreshData();
      } else {
        toast.error(`${t("toasts.deleteFailed")}: ${res.error?.message}`);
      }
    } catch (err) {
      toast.error(t("toasts.deleteFailed"));
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId || "",
    });
  };

  const getParentChain = (cat: any): React.ReactNode => {
    if (!cat.parent) return "—";
    const parent = cat.parent;
    if (parent.parent) {
      return (
        <span className="flex items-center gap-1">
          {parent.parent.name}
          <ChevronRight className="h-3 w-3 shrink-0" />
          {parent.name}
        </span>
      );
    }
    return parent.name;
  };

  const columns: ColumnDef<CategoryWithCounts>[] = [
    {
      id: "name",
      header: () => <div className="min-w-[200px]">{t("categoryName")}</div>,
      cell: ({ row }) => {
        const cat = row.original;
        const isEditing = editingId === cat.id;

        if (isEditing) {
          return (
            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="h-8 text-sm"
              autoFocus
            />
          );
        }

        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{cat.name}</span>
            <span className="text-xs text-slate-400">
              {getParentChain(cat)}
            </span>
          </div>
        );
      },
    },
    {
      id: "parent",
      header: () => <div className="min-w-[180px]">{t("parentCategory")}</div>,
      cell: ({ row }) => {
        const cat = row.original;
        const isEditing = editingId === cat.id;

        if (isEditing) {
          // Filter out the current category to prevent self-parent
          const availableCategories = categories.filter((c) => c.id !== cat.id);
          return (
            <ParentCategoryCombobox
              categories={availableCategories}
              value={editForm.parentId}
              onChange={(id) =>
                setEditForm((prev) => ({ ...prev, parentId: id }))
              }
              outletId={currentOutletId || ""}
              placeholder={t("noParent")}
            />
          );
        }

        return (
          <span className="text-slate-500 text-sm">
            {getParentChain(cat)}
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: () => <div className="min-w-[200px]">{t("description")}</div>,
      cell: ({ row }) => {
        const cat = row.original;
        const isEditing = editingId === cat.id;

        if (isEditing) {
          return (
            <Input
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("descPlaceholder")}
              className="h-8 text-sm"
            />
          );
        }
        return (
          <span className="text-slate-500 line-clamp-1">
            {row.original.description || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "_count.children",
      header: () => <div className="text-center w-24">{t("subsCount")}</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium text-slate-600">
          {row.original._count.children}
        </div>
      ),
    },
    {
      accessorKey: "_count.products",
      header: () => <div className="text-center w-24">{t("itemsCount")}</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge
            variant="secondary"
            className="bg-indigo-50 text-indigo-700 border-none"
          >
            {row.original._count.products}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: () => (
        <div className="text-center w-24">{dashboardTable("status")}</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isActive ? (
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {common("active")}
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {common("inactive")}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right w-32">{common("actionsHeader")}</div>
      ),
      cell: ({ row }) => {
        const cat = row.original;
        const isEditing = editingId === cat.id;

        return (
          <div className="flex justify-end items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleUpdate(cat.id)}
                  className="h-8 w-8 text-emerald-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  className="h-8 w-8 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(cat)}
                  className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {cat.isActive ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeactivate(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-amber-600"
                    title={t("deactivate")}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleActivate(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-emerald-600"
                    title={t("activate")}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                {cat._count.products === 0 && cat._count.children === 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                    title={t("delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  const breadcrumbs = [
    { label: common("groups.masterData") },
    {
      label: t("title"),
      href: "/dashboard/master-data/categories",
    },
  ];

  const actions = [
    {
      label: t("addCategory"),
      icon: Plus,
      onClick: () => setIsAdding(true),
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
        searchValue={searchParams.get("search") || ""}
        onSearchChange={(val) => {
          const params = new URLSearchParams(searchParams.toString());
          if (val) {
            params.set("search", val);
          } else {
            params.delete("search");
          }
          params.set("page", "1");
          router.push(`?${params.toString()}`);
        }}
        actions={actions}
      />

      <DataTable
        columns={columns}
        data={categories}
        loading={isPending}
        manualPagination
      />

      {initialPagination && (
        <PaginationControls
          page={initialPagination.page}
          totalPages={initialPagination.totalPages}
          limit={initialPagination.limit}
          total={initialPagination.total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isPending={isPending}
        />
      )}

      {isAdding && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">
            {t("addNewCategory")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={newForm.name}
              onChange={(e) =>
                setNewForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("namePlaceholder")}
              className="h-10"
            />
            <ParentCategoryCombobox
              categories={categories}
              value={newForm.parentId}
              onChange={(id) =>
                setNewForm((prev) => ({ ...prev, parentId: id }))
              }
              outletId={currentOutletId || ""}
              placeholder={t("noParent")}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              size="sm"
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 h-8"
            >
              {common("save")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAdding(false)}
              className="h-8"
            >
              {common("cancel")}
            </Button>
          </div>
        </div>
      )}

      <ReusableConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmText={t("deleteConfirm")}
      />
    </div>
  );
}
