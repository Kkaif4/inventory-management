"use client";

import { useEffect, useState } from "react";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPaymentModesForAccount } from "@/actions/accounts/payment-modes";
import { PaymentMode } from "@/generated/prisma";

interface PaymentModeSelectorProps {
  accountId: string;
  value?: PaymentMode;
  onChange?: (mode: PaymentMode) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  required?: boolean;
}

const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI Transfer",
  CHEQUE: "Cheque",
  ONLINE_TRANSFER: "Online Transfer (NEFT/RTGS/IMPS)",
  CARD: "Card",
};

export function PaymentModeSelector({
  accountId,
  value,
  onChange,
  disabled = false,
  label = "Payment Mode",
  description,
  required = false,
}: PaymentModeSelectorProps) {
  const [modes, setModes] = useState<PaymentMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;

    async function loadModes() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPaymentModesForAccount(accountId);
        if (result.success && Array.isArray(result.data)) {
          setModes(result.data);
        } else {
          setError(result.error?.message || "Failed to load payment modes");
        }
      } catch (err) {
        setError("An error occurred while loading payment modes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadModes();
  }, [accountId]);

  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <Select
          value={value}
          onValueChange={(val) => onChange?.(val as PaymentMode)}
          disabled={disabled || isLoading || modes.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {PAYMENT_MODE_LABELS[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
      {isLoading && <FormDescription>Loading payment modes...</FormDescription>}
    </FormItem>
  );
}
