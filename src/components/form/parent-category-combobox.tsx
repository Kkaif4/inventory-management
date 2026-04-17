"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus, X } from "lucide-react";
import { getOrCreateParentCategory } from "@/actions/categories/index";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParentCategoryComboboxProps {
  categories: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  outletId: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ParentCategoryCombobox({
  categories,
  value,
  onChange,
  outletId,
  placeholder = "Select parent category...",
  disabled = false,
}: ParentCategoryComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [localCategories, setLocalCategories] = React.useState(categories);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return localCategories;
    const lower = search.toLowerCase();
    return localCategories.filter((c) =>
      c.name.toLowerCase().includes(lower)
    );
  }, [localCategories, search]);

  const selectedCategory = localCategories.find((c) => c.id === value);

  const showCreateOption = React.useMemo(() => {
    return (
      search.trim().length > 0 &&
      !localCategories.some(
        (c) => c.name.toLowerCase() === search.trim().toLowerCase()
      )
    );
  }, [search, localCategories]);

  const handleSelect = React.useCallback(
    (categoryId: string) => {
      onChange(categoryId);
      setSearch("");
      setIsOpen(false);
    },
    [onChange]
  );

  const handleCreate = React.useCallback(async () => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;

    setIsCreating(true);
    try {
      const result = await getOrCreateParentCategory(trimmedSearch, outletId);

      if (!result.success) {
        toast.error(result.error?.message || "Failed to create category");
        return;
      }

      if (!result.data) {
        toast.error("Unexpected response from server");
        return;
      }

      const newCategory = result.data;
      setLocalCategories((prev) => [...prev, newCategory]);
      handleSelect(newCategory.id);

      if (newCategory.isNew) {
        toast.success(`Category "${newCategory.name}" created successfully`);
      }
    } catch (error) {
      toast.error("An error occurred while creating the category");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }, [search, outletId, handleSelect]);

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
      if (highlightedIndex === filtered.length && showCreateOption) {
        handleCreate();
      } else if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].id);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setHighlightedIndex(0);
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
              "w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
              "h-9 text-sm",
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
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category.id)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer",
                      value === category.id && "bg-slate-50 font-semibold",
                      highlightedIndex === idx && "bg-slate-100"
                    )}
                  >
                    {category.name}
                  </button>
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
                    <Plus className="h-4 w-4" />
                    <span>
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
  );
}
