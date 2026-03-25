"use client";

import * as React from "react";
import { useOutletStore } from "@/store/use-outlet-store";
import { getPartiesWithBalances } from "@/actions/parties";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CustomerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  onCustomerLoad?: (customer: any) => void;
}

export function CustomerSelect({
  value,
  onChange,
  disabled,
  className,
  onCustomerLoad,
}: CustomerSelectProps) {
  const { currentOutletId } = useOutletStore();
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!currentOutletId) return;

    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const res = await getPartiesWithBalances(currentOutletId, "CUSTOMER");
        if (res.success) {
          setCustomers(res.data || []);
        }
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [currentOutletId]);

  const handleChange = (customerId: string | null) => {
    if (!customerId) return;
    onChange(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer && onCustomerLoad) {
      onCustomerLoad(customer);
    }
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin?.includes(search),
  );

  const selectedCustomer = customers.find((c) => c.id === value);

  return (
    <Select value={value || ""} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "w-full",
          selectedCustomer?.currentBalance >
            (selectedCustomer?.creditLimit || 0)
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "",
          className,
        )}
      >
        {selectedCustomer ? (
          <span className="truncate font-medium">{selectedCustomer.name}</span>
        ) : (
          <span className="text-muted-foreground">Select customer...</span>
        )}
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="text-center py-4 text-sm text-slate-500">
            Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-4 text-sm text-slate-500">
            No customers found
          </div>
        ) : (
          filtered.map((customer) => {
            const isOverLimit =
              customer.currentBalance > (customer.creditLimit || 0);
            return (
              <SelectItem key={customer.id} value={customer.id}>
                <div className="flex items-center gap-2">
                  <span>{customer.name}</span>
                  {customer.creditLimit && (
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        isOverLimit
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      ₹{customer.currentBalance.toLocaleString()} / ₹
                      {customer.creditLimit.toLocaleString()}
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  );
}
