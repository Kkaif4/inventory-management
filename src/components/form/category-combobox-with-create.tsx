import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus, X, Pencil } from "lucide-react";
import { createCategory, updateCategory } from "@/actions/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryComboboxWithCreateProps {
  categories: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  outletId: string;
  placeholder?: string;
  disabled?: boolean;
  userId?: string;
  onCategoryCreated?: (category: { id: string; name: string }) => void;
  onCategoryUpdated?: (category: { id: string; name: string }) => void;
}

export function CategoryComboboxWithCreate({
  categories: initialCategories,
  value,
  onChange,
  outletId,
  placeholder = "Select or create category...",
  disabled = false,
  userId = "system",
  onCategoryCreated,
  onCategoryUpdated,
}: CategoryComboboxWithCreateProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [localCategories, setLocalCategories] = React.useState(initialCategories);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [editingCategory, setEditingCategory] = React.useState<{ id: string; name: string } | null>(null);
  const [editCategoryName, setEditCategoryName] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync local categories with props
  React.useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return localCategories;
    const lower = search.toLowerCase();
    return localCategories.filter((c) =>
      c.name.toLowerCase().includes(lower),
    );
  }, [localCategories, search]);

  const selectedCategory = localCategories.find((c) => c.id === value);

  const showCreateOption = React.useMemo(() => {
    return (
      search.trim().length > 0 &&
      !localCategories.some(
        (c) => c.name.toLowerCase() === search.trim().toLowerCase(),
      )
    );
  }, [search, localCategories]);

  const handleSelect = React.useCallback(
    (categoryId: string) => {
      onChange(categoryId);
      setSearch("");
      setIsOpen(false);
    },
    [onChange],
  );

  const handleCreate = React.useCallback(async () => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;

    setIsCreating(true);
    try {
      const res = await createCategory({
        name: trimmedSearch,
        outletId,
        userId,
      });

      if (res.success && res.data) {
        const newCategory = {
          id: res.data.id,
          name: res.data.name,
        };
        setLocalCategories((prev) => [...prev, newCategory]);
        handleSelect(newCategory.id);
        toast.success(`Category "${newCategory.name}" created successfully`);
        if (onCategoryCreated) {
          onCategoryCreated(newCategory);
        }
      } else {
        toast.error(res.error?.message || "Failed to create category");
      }
    } catch (error) {
      toast.error("An error occurred while creating the category");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }, [search, outletId, userId, handleSelect, onCategoryCreated]);

  const handleOpenEdit = (e: React.MouseEvent, cat: { id: string; name: string }) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCategory) return;
    const trimmed = editCategoryName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await updateCategory({
        id: editingCategory.id,
        name: trimmed,
        userId,
      });
      if (res.success && res.data) {
        const updated = { id: res.data.id, name: res.data.name };
        setLocalCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success(`Category renamed to "${updated.name}"`);
        if (onCategoryUpdated) {
          onCategoryUpdated(updated);
        }
        setEditingCategory(null);
      } else {
        toast.error(res.error?.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("An error occurred while updating category");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const maxIndex = showCreateOption ? filtered.length : filtered.length - 1;
      setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex].id);
      } else if (showCreateOption) {
        handleCreate();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Anchor asChild>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? search : selectedCategory?.name || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={handleFocus}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring",
              disabled && "bg-slate-100 cursor-not-allowed opacity-60"
            )}
            autoComplete="off"
          />
          {value && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[var(--radix-popover-trigger-width)] min-w-[300px] z-50 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95"
          align="start"
          sideOffset={2}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 && !showCreateOption ? (
              <div className="text-center py-3 text-xs text-slate-500">
                No categories found
              </div>
            ) : (
              <>
                {filtered.map((category, idx) => (
                  <div
                    key={category.id}
                    onClick={() => handleSelect(category.id)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer group select-none",
                      value === category.id && "bg-slate-50 font-semibold",
                      highlightedIndex === idx && "bg-slate-100"
                    )}
                  >
                    <span className="truncate flex-1">{category.name}</span>
                    <button
                      type="button"
                      title="Edit category"
                      onClick={(e) => handleOpenEdit(e, category)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-opacity ml-2 shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {showCreateOption && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isCreating}
                    onMouseEnter={() => setHighlightedIndex(filtered.length)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer border-t border-slate-200 flex items-center gap-2",
                      highlightedIndex === filtered.length && "bg-slate-100"
                    )}
                  >
                    <Plus className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">
                      {isCreating
                        ? "Creating..."
                        : `Create "${search.trim()}"`}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Category Name</label>
              <Input
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Enter category name"
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating || !editCategoryName.trim()}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PopoverPrimitive.Root>
  );
}
