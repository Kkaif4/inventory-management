"use client";

import { toggleUserStatus } from "@/actions/users";
import { Power, PowerOff } from "lucide-react";
import { useState, useTransition } from "react";

export function ToggleUserButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useState(isActive);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticState(!optimisticState);
      await toggleUserStatus(userId, isActive);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-1.5 rounded-md transition-colors ${
        optimisticState
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-green-50 text-green-600 hover:bg-green-100"
      }`}
      title={optimisticState ? "Deactivate User" : "Activate User"}
    >
      {optimisticState ? (
        <PowerOff className="w-4 h-4" />
      ) : (
        <Power className="w-4 h-4" />
      )}
    </button>
  );
}
