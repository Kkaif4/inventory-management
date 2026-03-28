'use client';

import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ReportActionsProps {
  onExport?: () => void;
  onPrint?: () => void;
  isExporting?: boolean;
}

export function ReportActions({ onExport, onPrint, isExporting = false }: ReportActionsProps) {
  const t = useTranslations('reports');
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExport = async () => {
    try {
      if (onExport) {
        onExport();
        toast.success(t('export.success'));
      }
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="print:hidden flex gap-2">
      {onExport && (
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? t('export.exporting') : t('export.excel')}
        </Button>
      )}

      {onPrint && (
        <Button
          onClick={handlePrint}
          disabled={isPrinting}
          variant="outline"
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          {isPrinting ? t('print.printing') : t('print.print')}
        </Button>
      )}
    </div>
  );
}
