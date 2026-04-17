"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createMinimalCustomer } from "@/actions/sales/customers";
import { createMinimalVendor } from "@/actions/purchase/vendors";
import { getPartiesWithBalances } from "@/actions/parties";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface PartyComboboxWithCreateProps {
  type: "CUSTOMER" | "VENDOR";
  value?: string;
  onChange: (partyId: string) => void;
  onPartyLoad?: (party: any) => void;
  outletId: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export function PartyComboboxWithCreate({
  type,
  value,
  onChange,
  onPartyLoad,
  outletId,
  disabled = false,
  compact = false,
  className,
}: PartyComboboxWithCreateProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [parties, setParties] = React.useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createFormData, setCreateFormData] = React.useState({
    name: "",
    phone: "",
    state: "",
    gstin: "",
  });
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load parties on mount
  React.useEffect(() => {
    if (!outletId) return;

    const loadParties = async () => {
      setIsLoading(true);
      try {
        const res = await getPartiesWithBalances(outletId, type);
        if (res.success) {
          setParties(res.data || []);
        }
      } catch (error) {
        console.error(`Failed to load ${type.toLowerCase()}s:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParties();
  }, [outletId, type]);

  const filtered = React.useMemo(() => {
    if (!search) return parties;
    const lower = search.toLowerCase();
    return parties.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.gstin?.toLowerCase().includes(lower)
    );
  }, [parties, search]);

  const selectedParty = parties.find((p) => p.id === value);

  const showCreateOption = React.useMemo(() => {
    return (
      search.trim().length >= 2 &&
      !parties.some(
        (p) => p.name.toLowerCase() === search.trim().toLowerCase()
      )
    );
  }, [search, parties]);

  const handleSelect = React.useCallback(
    (partyId: string) => {
      const party = parties.find((p) => p.id === partyId);
      onChange(partyId);
      setSearch("");
      setIsOpen(false);
      if (party && onPartyLoad) {
        onPartyLoad(party);
      }
    },
    [parties, onChange, onPartyLoad]
  );

  const handleCreateOpen = () => {
    setCreateFormData({
      name: search.trim(),
      phone: "",
      state: "",
      gstin: "",
    });
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = async () => {
    if (!createFormData.name.trim() || !createFormData.state) {
      toast.error("Name and State are required");
      return;
    }

    setIsCreating(true);
    try {
      let result;
      if (type === "CUSTOMER") {
        result = await createMinimalCustomer(outletId, {
          name: createFormData.name,
          phone: createFormData.phone || undefined,
          state: createFormData.state,
          gstin: createFormData.gstin || undefined,
        });
      } else {
        result = await createMinimalVendor(outletId, {
          name: createFormData.name,
          phone: createFormData.phone || undefined,
          state: createFormData.state,
          gstin: createFormData.gstin || undefined,
        });
      }

      if (!result.success || !result.data) {
        toast.error(result.error?.message || `Failed to create ${type === "CUSTOMER" ? "customer" : "vendor"}`);
        return;
      }

      const newParty = result.data;
      // Add the new party to local list
      setParties((prev) => [...prev, newParty]);
      handleSelect(newParty.id);
      setShowCreateDialog(false);
      toast.success(
        `${type === "CUSTOMER" ? "Customer" : "Vendor"} "${newParty.name}" created successfully`
      );
    } catch (error) {
      toast.error(
        `Failed to create ${type === "CUSTOMER" ? "customer" : "vendor"}`
      );
      console.error(error);
    } finally {
      setIsCreating(false);
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
      if (highlightedIndex === filtered.length && showCreateOption) {
        handleCreateOpen();
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
    <>
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={isOpen ? search : selectedParty?.name || ""}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={handleFocus}
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              placeholder={`Search ${type === "CUSTOMER" ? "customer" : "vendor"}...`}
              className={cn(
                "w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
                compact ? "h-7 text-xs" : "h-9 text-sm",
                disabled && "bg-slate-100 cursor-not-allowed opacity-60",
                className
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
              {isLoading ? (
                <div className="text-center py-3 text-xs text-slate-500">
                  Loading...
                </div>
              ) : filtered.length === 0 && !showCreateOption ? (
                <div className="text-center py-3 text-xs text-slate-500">
                  No {type === "CUSTOMER" ? "customers" : "vendors"} found
                </div>
              ) : (
                <>
                  {filtered.map((party, idx) => (
                    <button
                      key={party.id}
                      type="button"
                      onClick={() => handleSelect(party.id)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer",
                        value === party.id && "bg-slate-50 font-semibold",
                        highlightedIndex === idx && "bg-slate-100"
                      )}
                    >
                      <div className="font-medium">{party.name}</div>
                      {party.gstin && (
                        <div className="text-xs text-slate-500">
                          {party.gstin}
                        </div>
                      )}
                    </button>
                  ))}
                  {showCreateOption && (
                    <button
                      type="button"
                      onClick={handleCreateOpen}
                      onMouseEnter={() => setHighlightedIndex(filtered.length)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer border-t border-slate-200 flex items-center gap-2",
                        highlightedIndex === filtered.length && "bg-slate-100"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create "{search.trim()}"</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {type === "CUSTOMER" ? "Customer" : "Vendor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter name"
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={createFormData.phone}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="text-sm font-medium">State *</label>
              <select
                value={createFormData.state}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
                disabled={isCreating}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">GSTIN</label>
              <Input
                value={createFormData.gstin}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    gstin: e.target.value,
                  }))
                }
                placeholder="Enter GSTIN (optional)"
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={
                isCreating ||
                !createFormData.name.trim() ||
                !createFormData.state
              }
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
