// Shared types for all reports

export interface ReportFilter {
  dateFrom: Date;
  dateTo: Date;
  outletId: string;
  [key: string]: any;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type DatePreset = 'today' | 'week' | 'month' | 'lastMonth' | 'quarter' | 'fy' | 'lastFy' | 'custom';

export interface ReportPageProps {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totals?: Record<string, number | string>;
}

export interface ReportState {
  type: 'loading' | 'empty' | 'error' | 'data';
  error?: string;
}

export interface ExportOptions {
  filename: string;
  format: 'excel' | 'json' | 'csv';
}

export interface ReportFooterData {
  [key: string]: number | string;
}

export interface ReportColumn {
  id: string;
  label: string;
  key: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'badge';
  format?: (value: any) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  totalsIncluded?: boolean;
}

export interface ReportShellProps {
  title: string;
  subtitle: string;
  filters: React.ReactNode;
  state: ReportState['type'];
  errorMessage?: string;
  retryFn?: () => void;
  children: React.ReactNode;
  footerData?: ReportFooterData;
  onExport?: () => void;
  onPrint?: () => void;
  summaryCards?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

export interface FilterBarProps {
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
}
