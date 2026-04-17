"use client";

import { useOutletStore } from "@/store/use-outlet-store";
import { PartyComboboxWithCreate } from "./party-combobox-with-create";

interface CustomerSelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  onCustomerLoad?: (customer: any) => void;
}

export function CustomerSelect({
  value,
  onChange,
  disabled,
  compact = false,
  className,
  onCustomerLoad,
}: CustomerSelectProps) {
  const { currentOutletId } = useOutletStore();

  return (
    <PartyComboboxWithCreate
      type="CUSTOMER"
      value={value}
      onChange={onChange}
      onPartyLoad={onCustomerLoad}
      outletId={currentOutletId || ""}
      disabled={disabled}
      compact={compact}
      className={className}
    />
  );
}
