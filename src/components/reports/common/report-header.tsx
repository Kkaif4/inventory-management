'use client';

import { ChevronRight } from 'lucide-react';

interface ReportHeaderProps {
  title: string;
  subtitle: string;
}

export function ReportHeader({ title, subtitle }: ReportHeaderProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span>Reports</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-primary font-medium">{title}</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="text-text-secondary mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
