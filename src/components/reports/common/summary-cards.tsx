'use client';

import { ReactNode } from 'react';

export interface SummaryCard {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface SummaryCardsProps {
  cards: SummaryCard[];
}

const variantStyles: Record<string, string> = {
  default: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-red-50 border-red-200',
};

const valueStyles: Record<string, string> = {
  default: 'text-blue-900',
  success: 'text-green-900',
  warning: 'text-amber-900',
  danger: 'text-red-900',
};

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-lg border p-4 ${variantStyles[card.variant || 'default']}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-secondary mb-1">
                {card.label}
              </p>
              <p className={`text-2xl font-bold ${valueStyles[card.variant || 'default']}`}>
                {card.value}
              </p>
            </div>
            {card.icon && <div className="ml-2 flex-shrink-0">{card.icon}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
