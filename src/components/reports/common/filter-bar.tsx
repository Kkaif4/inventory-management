'use client';

import { ReactNode } from 'react';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
}

export function FilterBar({ children, onApply, onReset }: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-border-default shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-text-secondary" />
        <h3 className="font-semibold text-text-primary">Filters</h3>
      </div>

      <div className="space-y-4">{children}</div>

      {(onApply || onReset) && (
        <div className="flex gap-2 pt-2 border-t border-border-default">
          {onApply && (
            <button
              onClick={onApply}
              className="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors"
            >
              Apply Filters
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-surface-elevated text-text-primary rounded-lg font-medium hover:bg-surface-hover transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
