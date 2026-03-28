import { formatCurrency } from '@/lib/utils';

export interface ExcelExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  columns: {
    header: string;
    key: string;
    width?: number;
    format?: (value: any) => string;
  }[];
  data: Record<string, any>[];
  totalsRow?: Record<string, any>;
  summaryCards?: Array<{
    label: string;
    value: string | number;
  }>;
  generatedBy?: string;
  generatedOn?: Date;
}

/**
 * Export report data to Excel workbook
 * Note: Requires exceljs to be installed for full Excel export
 */
export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  // For now, export as CSV since exceljs is not installed
  // TODO: Install exceljs package and implement full Excel export with formatting
  exportToCsv(options);
}

/**
 * Export report data to JSON
 */
export async function exportToJson(options: ExcelExportOptions): Promise<void> {
  const jsonData = {
    title: options.title,
    subtitle: options.subtitle,
    generatedOn: options.generatedOn,
    generatedBy: options.generatedBy,
    summaryCards: options.summaryCards,
    data: options.data,
    totals: options.totalsRow,
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json',
  });

  downloadBlob(blob, `${options.filename}.json`);
}

/**
 * Export report data to CSV
 */
export function exportToCsv(options: ExcelExportOptions): void {
  // Build CSV content
  const headers = options.columns.map((col) => `"${col.header}"`).join(',');

  const rows = options.data.map((row) =>
    options.columns
      .map((col) => {
        let value = row[col.key];
        if (col.format) {
          value = col.format(value);
        }
        // Escape quotes and wrap in quotes
        return `"${String(value || '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  // Add totals row if provided
  if (options.totalsRow) {
    const totalsRow = options.columns
      .map((col) => {
        let value = options.totalsRow![col.key];
        if (col.format && value !== undefined) {
          value = col.format(value);
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      })
      .join(',');
    rows.push(totalsRow);
  }

  const csvContent = [headers, ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${options.filename}.csv`);
}

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
