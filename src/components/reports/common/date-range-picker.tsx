'use client';

import { useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getDateRangeForPreset,
  PRESET_LABELS,
  formatReportDate,
} from '@/lib/reports/date-utils';
import type { DatePreset, DateRange as DateRangeType } from '@/types/reports/common';
import { useTranslations } from 'next-intl';

interface DateRangePickerProps {
  value: DateRangeType;
  onChange: (dates: DateRangeType) => void;
  label?: string;
}

export function DateRangePicker({ value, onChange, label }: DateRangePickerProps) {
  const t = useTranslations('reports.filters.presets');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [customRange, setCustomRange] = useState<DateRangeType>(value);

  const presets: DatePreset[] = ['today', 'week', 'month', 'lastMonth', 'quarter', 'fy', 'lastFy'];

  const handlePresetClick = useCallback(
    (preset: DatePreset) => {
      const range = getDateRangeForPreset(preset);
      onChange(range);
      setOpen(false);
    },
    [onChange]
  );

  const handleCustomApply = useCallback(() => {
    if (customRange.from && customRange.to) {
      onChange(customRange);
      setOpen(false);
    }
  }, [customRange, onChange]);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}

      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setOpen(!open)}
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatReportDate(value.from)} — {formatReportDate(value.to)}
        </Button>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-border-default rounded-lg shadow-lg z-50 p-4">
            {/* Tab Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab('presets')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  tab === 'presets'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-surface-elevated text-text-primary border border-border-default hover:bg-surface-elevated'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setTab('custom')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  tab === 'custom'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-surface-elevated text-text-primary border border-border-default hover:bg-surface-elevated'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Presets */}
            {tab === 'presets' && (
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-2 text-sm rounded-lg border border-border-default hover:bg-surface-elevated transition-colors text-left font-medium"
                  >
                    {PRESET_LABELS[preset]}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Range */}
            {tab === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">From</label>
                  <input
                    type="date"
                    value={customRange.from.toISOString().split('T')[0]}
                    onChange={(e) =>
                      setCustomRange((prev) => ({
                        ...prev,
                        from: new Date(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-border-default rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">To</label>
                  <input
                    type="date"
                    value={customRange.to.toISOString().split('T')[0]}
                    onChange={(e) =>
                      setCustomRange((prev) => ({
                        ...prev,
                        to: new Date(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-border-default rounded-lg text-sm"
                  />
                </div>

                <Button onClick={handleCustomApply} className="w-full">
                  Apply
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Close when clicking outside */}
        {open && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
