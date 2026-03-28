'use client';

import { useTranslations } from 'next-intl';

interface ReportFooterProps {
  data: Record<string, number | string>;
  columns: Array<{
    key: string;
    label: string;
    format?: (value: any) => string;
  }>;
}

export function ReportFooter({ data, columns }: ReportFooterProps) {
  const t = useTranslations('reports.footer');

  return (
    <div className="mt-6 bg-surface-elevated rounded-lg border border-border-default overflow-hidden">
      <table className="w-full">
        <tbody>
          <tr className="border-t border-border-default bg-surface-elevated font-semibold">
            {columns.map(col => (
              <td
                key={col.key}
                className={`px-4 py-3 text-sm ${
                  typeof data[col.key] === 'number' ? 'text-right' : 'text-left'
                }`}
              >
                {col.key === columns[0].key ? t('total') : ''}
                {col.format ? col.format(data[col.key]) : data[col.key]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
