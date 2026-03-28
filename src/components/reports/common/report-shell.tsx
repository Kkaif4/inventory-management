'use client';

import { ReactNode } from 'react';
import { ReportHeader } from './report-header';
import { FilterBar } from './filter-bar';
import { ReportState } from './report-state';
import { ReportActions } from './report-actions';
import { ReportFooter } from './report-footer';
import { SummaryCards } from './summary-cards';
import type { ReportShellProps } from '@/types/reports/common';

interface ExtendedReportShellProps extends ReportShellProps {
  summaryCards?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }>;
  columns?: Array<{
    key: string;
    label: string;
    format?: (value: any) => string;
  }>;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
  isExporting?: boolean;
}

export function ReportShell({
  title,
  subtitle,
  filters,
  state,
  errorMessage,
  retryFn,
  children,
  footerData,
  onExport,
  onPrint,
  summaryCards,
  columns,
  onApplyFilters,
  onResetFilters,
  isExporting,
}: ExtendedReportShellProps) {
  return (
    <div className="report-container space-y-6 pb-12">
      {/* Header */}
      <ReportHeader title={title} subtitle={subtitle} />

      {/* Filter Bar */}
      <FilterBar onApply={onApplyFilters} onReset={onResetFilters}>
        {filters}
      </FilterBar>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <ReportActions
          onExport={onExport}
          onPrint={onPrint}
          isExporting={isExporting}
        />
      </div>

      {/* Report State */}
      <ReportState state={state} error={errorMessage} retryFn={retryFn}>
        {/* Summary Cards */}
        {summaryCards && summaryCards.length > 0 && (
          <SummaryCards cards={summaryCards} />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-border-default overflow-hidden">
          {children}
        </div>

        {/* Footer / Totals */}
        {state === 'data' && footerData && columns && (
          <ReportFooter data={footerData} columns={columns} />
        )}
      </ReportState>

      {/* Print-only footer */}
      <div className="hidden print:block text-center text-xs text-gray-600 mt-8 pt-8 border-t border-gray-300">
        <p>
          {title} — Generated on {new Date().toLocaleDateString('en-IN')} at{' '}
          {new Date().toLocaleTimeString('en-IN')}
        </p>
      </div>
    </div>
  );
}
