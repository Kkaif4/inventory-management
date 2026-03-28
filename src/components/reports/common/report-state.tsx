'use client';

import { ReactNode } from 'react';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReportStateProps {
  state: 'loading' | 'empty' | 'error' | 'data';
  error?: string;
  retryFn?: () => void;
  children: ReactNode;
}

export function ReportState({ state, error, retryFn, children }: ReportStateProps) {
  const t = useTranslations('reports.states');

  if (state === 'loading') {
    return (
      <div className="bg-white rounded-lg border border-border-default p-8">
        <div className="space-y-3">
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="bg-white rounded-lg border border-border-default p-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <BarChart3 className="w-16 h-16 text-text-disabled" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {t('empty')}
            </h3>
            <p className="text-text-secondary text-sm">
              Adjust your filters and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">{t('error')}</h3>
            {error && <p className="text-red-700 text-sm mb-3">{error}</p>}
            {retryFn && (
              <button
                onClick={retryFn}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {t('retry')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
