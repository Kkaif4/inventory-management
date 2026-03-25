"use client";

import * as React from "react";
import { AlertCircle, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ToggleWithBannerProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  infoBanner?: string;
  warningBanner?: {
    type: "warning" | "error";
    message: string;
    requireAcknowledgement?: boolean;
  };
  onAcknowledge?: (acknowledged: boolean) => void;
  disabled?: boolean;
}

export function ToggleWithBanner({
  label,
  value,
  onChange,
  infoBanner,
  warningBanner,
  onAcknowledge,
  disabled,
}: ToggleWithBannerProps) {
  const [acknowledged, setAcknowledged] = React.useState(false);

  const handleAcknowledge = (checked: boolean) => {
    setAcknowledged(checked);
    onAcknowledge?.(checked);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        <label className="text-sm font-medium text-slate-900">{label}</label>
      </div>

      {value && infoBanner && (
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900 border border-blue-200">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="whitespace-pre-wrap leading-relaxed">{infoBanner}</div>
        </div>
      )}

      {warningBanner && (
        <div
          className={cn(
            "flex gap-3 rounded-lg p-4 text-sm border",
            warningBanner.type === "warning"
              ? "bg-amber-50 text-amber-900 border-amber-200"
              : "bg-red-50 text-red-900 border-red-200"
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="whitespace-pre-wrap leading-relaxed">
              {warningBanner.message}
            </p>
            {warningBanner.requireAcknowledgement && (
              <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={acknowledged}
                  onCheckedChange={handleAcknowledge}
                />
                <span className="text-sm font-medium">
                  I understand. Disable batch tracking for this outlet.
                </span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
