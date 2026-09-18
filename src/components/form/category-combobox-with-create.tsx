"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus, X, Pencil, Check } from "lucide-react";
import { createCategory, updateCategory } from "@/actions/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
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

  const handleStartEdit = (e: React.MouseEvent, cat: { id: string; name: string }) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveEdit = async (categoryId: string) => {
    const trimmed = editingCategoryName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await updateCategory({
        id: categoryId,
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
        setEditingCategoryId(null);
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
      if (highlightedIndex < filtered.length && filtered[highlightedIndex]) {
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
    <div ref={containerRef} className="relative w-full">
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <PopoverPrimitive.Anchor asChild>
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={isOpen ? search : selectedCategory?.name || ""}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => {
                if (!disabled) {
                  setIsOpen(true);
                  setHighlightedIndex(0);
                }
              }}
              onClick={() => {
                if (!disabled && !isOpen) {
                  setIsOpen(true);
                }
              }}
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded cursor-pointer"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="w-[var(--radix-popover-anchor-width,var(--radix-popover-trigger-width,300px))] min-w-[280px] z-[9999] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              if (
                inputRef.current?.contains(e.target as Node) ||
                containerRef.current?.contains(e.target as Node)
              ) {
                e.preventDefault();
              }
            }}
            onFocusOutside={(e) => {
              if (
                inputRef.current?.contains(e.target as Node) ||
                containerRef.current?.contains(e.target as Node)
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100">
              {filtered.length === 0 && !showCreateOption ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  No categories found
                </div>
              ) : (
                <>
                  {filtered.map((category, idx) => {
                    const isEditing = editingCategoryId === category.id;

                    if (isEditing) {
                      return (
                        <div
                          key={category.id}
                          className="p-1.5 bg-blue-50/80 flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveEdit(category.id);
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                setEditingCategoryId(null);
                              }
                            }}
                            className="flex-1 h-7 px-2 text-xs bg-white border border-blue-400 rounded outline-none font-medium focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(category.id)}
                            disabled={isUpdating}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-200 rounded cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={category.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(category.id)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer group select-none transition-colors",
                          value === category.id && "bg-blue-50/50 font-semibold text-blue-900",
                          highlightedIndex === idx && "bg-slate-100"
                        )}
                      >
                        <span className="truncate flex-1">{category.name}</span>
                        <button
                          type="button"
                          title="Rename category"
                          onClick={(e) => handleStartEdit(e, category)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-opacity ml-2 shrink-0 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {showCreateOption && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreate}
                      disabled={isCreating}
                      onMouseEnter={() => setHighlightedIndex(filtered.length)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 cursor-pointer flex items-center gap-2 transition-colors",
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
      </PopoverPrimitive.Root>
    </div>
  );
}
