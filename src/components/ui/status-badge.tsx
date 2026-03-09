import * as React from "react";
import { cn } from "@/lib/utils";

const statusVariants = {
  draft: "bg-status-draft-bg text-status-draft-text border-status-draft-border",
  pending:
    "bg-status-pending-bg text-status-pending-text border-status-pending-border",
  sent: "bg-status-approved-bg text-status-approved-text border-status-approved-border", // reusing blue
  approved:
    "bg-status-approved-bg text-status-approved-text border-status-approved-border",
  partially_received:
    "bg-status-partial-bg text-status-partial-text border-status-partial-border",
  received:
    "bg-status-received-bg text-status-received-text border-status-received-border",
  posted:
    "bg-status-approved-bg text-status-approved-text border-status-approved-border", // indigo placeholder
  completed:
    "bg-status-completed-bg text-status-completed-text border-status-completed-border",
  paid: "bg-status-completed-bg text-status-completed-text border-status-completed-border",
  cancelled:
    "bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border",
  overdue:
    "bg-status-overdue-bg text-status-overdue-text border-status-overdue-border",
  in_transit:
    "bg-status-intransit-bg text-status-intransit-text border-status-intransit-border",
  write_off:
    "bg-status-draft-bg text-status-draft-text border-status-draft-border",
};

export interface StatusBadgeProps {
  status: keyof typeof statusVariants | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variantClass =
    statusVariants[status as keyof typeof statusVariants] ||
    statusVariants.draft;
  const displayLabel =
    label ||
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider",
        variantClass,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}
