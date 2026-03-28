'use client';

import { useCallback, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface Outlet {
  id: string;
  name: string;
}

interface OutletSelectorProps {
  outlets: Outlet[];
  value: string;
  onChange: (outletId: string) => void;
  canSelect: boolean;
  label?: string;
}

export function OutletSelector({
  outlets,
  value,
  onChange,
  canSelect,
  label,
}: OutletSelectorProps) {
  const t = useTranslations('reports.filters');

  const displayOutlets = useMemo(() => {
    if (!outlets || outlets.length === 0) {
      return [];
    }

    // If only one outlet and user can't select, show it as readonly
    if (!canSelect && outlets.length === 1) {
      return outlets;
    }

    return outlets;
  }, [outlets, canSelect]);

  const handleChange = useCallback(
    (outletId: string | null) => {
      if (canSelect && outletId) {
        onChange(outletId);
      }
    },
    [canSelect, onChange]
  );

  if (displayOutlets.length === 0) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          No outlets available for your account.
        </div>
      </div>
    );
  }

  if (!canSelect && displayOutlets.length === 1) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-sm">
          <Building2 className="w-4 h-4 text-text-secondary" />
          <span className="text-text-primary">{displayOutlets[0]?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <Select value={value} onValueChange={handleChange} disabled={!canSelect}>
        <SelectTrigger className={!canSelect ? 'opacity-50 cursor-not-allowed' : ''}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-text-secondary" />
            <SelectValue placeholder={t('outlet')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {displayOutlets.map(outlet => (
            <SelectItem key={outlet.id} value={outlet.id}>
              {outlet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!canSelect && (
        <p className="text-xs text-text-secondary">
          Your account is limited to this outlet.
        </p>
      )}
    </div>
  );
}
