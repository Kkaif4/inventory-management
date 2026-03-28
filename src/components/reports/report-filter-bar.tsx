import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export interface ReportFilterBarProps {
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
  activeFilterCount?: number;
}

export function ReportFilterBar({
  children,
  onApply,
  onReset,
  isLoading = false,
  activeFilterCount = 0,
}: ReportFilterBarProps) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            {children}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={onApply}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
