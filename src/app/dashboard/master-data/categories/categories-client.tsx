"use client";

import { useState } from "react";
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
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CategoryWithCounts = any;

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: CategoryWithCounts[];
}) {
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", parentId: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshData = async () => {
    window.location.reload();
  };

  const handleCreate = async () => {
    if (!session?.user?.id || !currentOutletId) return;
    try {
      await createCategory({
        name: newForm.name,
        parentId: newForm.parentId || undefined,
        userId: session.user.id,
        outletId: currentOutletId,
      });
      toast.success("Category created successfully");
      setIsAdding(false);
      setNewForm({ name: "", parentId: "" });
      refreshData();
    } catch (err) {
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      await updateCategory({
        id,
        name: editForm.name,
        description: editForm.description,
        userId: session.user.id,
      });
      toast.success("Category updated");
      setEditingId(null);
      refreshData();
    } catch (err) {
      toast.error("Failed to update category");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      await deactivateCategory(id, session.user.id);
      toast.success("Category deactivated");
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate category");
    }
  };

  const handleActivate = async (id: string) => {
    if (!session?.user?.id) return;
    try {
      await activateCategory(id, session.user.id);
      toast.success("Category activated");
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to activate category");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId || !session?.user?.id) return;
    try {
      await deleteCategory(deleteConfirmId, session.user.id);
      toast.success("Category deleted");
      setDeleteConfirmId(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description || "" });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Hierarchy / Name",
      cell: ({ row }) => {
        const cat = row.original;
        const isEditing = editingId === cat.id;
        const path = getHierarchyPath(cat);

        if (isEditing) {
          return (
            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="h-8 text-sm"
            />
          );
        }

        return (
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              {path.slice(0, -1).map((segment: string, idx: number) => (
                <span key={idx} className="flex items-center">
                  {segment} <ChevronRight className="w-2.5 h-2.5 mx-0.5" />
                </span>
              ))}
            </div>
            <span
              className={`font-semibold ${cat.isActive ? "text-slate-900" : "text-slate-400 italic"}`}
            >
              {cat.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        if (isEditing) {
          return (
            <Input
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Brief description..."
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
      header: () => <div className="text-center w-24">Subs</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium text-slate-600">
          {row.original._count.children}
        </div>
      ),
    },
    {
      accessorKey: "_count.products",
      header: () => <div className="text-center w-24">Items</div>,
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
      header: () => <div className="text-center w-24">Status</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isActive ? (
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Active
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right w-32">Actions</div>,
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
                    title="Deactivate"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleActivate(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-emerald-600"
                    title="Activate"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                {cat._count.children === 0 && cat._count.products === 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
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

  const getHierarchyPath = (category: any) => {
    const path = [category.name];
    let current = category.parent;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Product Categories
          </h2>
          <p className="text-slate-500 mt-1">
            Manage the multi-level product taxonomy.
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        emptyState={
          <div className="px-6 py-12 text-center text-slate-400 italic bg-white rounded-xl border border-slate-200">
            No categories found. Click "Add Category" to get started.
          </div>
        }
        footerRow={
          isAdding && (
            <tr className="bg-indigo-50/50 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-100">
              <td className="px-6 py-4">
                <Input
                  placeholder="Category Name"
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm({ ...newForm, name: e.target.value })
                  }
                  className="h-9"
                  autoFocus
                />
              </td>
              <td className="px-6 py-4">
                <select
                  className="w-full h-9 px-3 py-1 text-sm border rounded-md bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newForm.parentId}
                  onChange={(e) =>
                    setNewForm({ ...newForm, parentId: e.target.value })
                  }
                >
                  <option value="">-- Parent (Optional) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>
              <td colSpan={3}></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    className="bg-emerald-600 hover:bg-emerald-700 h-8"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAdding(false)}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </td>
            </tr>
          )
        }
      />

      <ReusableConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description="This will permanently delete this category. This action cannot be undone."
        confirmText="Delete Category"
      />
    </div>
  );
}
