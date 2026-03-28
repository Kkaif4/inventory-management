'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Receipt,
  DollarSign,
} from 'lucide-react';

interface ReportCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
  reports: {
    name: string;
    href: string;
  }[];
}

export default function ReportsPage() {
  const t = useTranslations('reports');

  const reportCards: ReportCard[] = [
    {
      title: t('navigation.inventory'),
      description: 'Stock levels, valuation & movements',
      icon: <Package className="w-8 h-8" />,
      href: '/dashboard/reports/inventory',
      category: 'inventory',
      reports: [
        { name: t('inventory.currentStock.title'), href: '/dashboard/reports/inventory/current-stock' },
        { name: t('inventory.lowStock.title'), href: '/dashboard/reports/inventory/low-stock-alert' },
        { name: t('inventory.ledger.title'), href: '/dashboard/reports/inventory/stock-ledger' },
        { name: t('inventory.valuation.title'), href: '/dashboard/reports/inventory/stock-valuation' },
        { name: t('inventory.slowMoving.title'), href: '/dashboard/reports/inventory/slow-moving-stock' },
      ],
    },
    {
      title: t('navigation.sales'),
      description: 'Sales invoices & customer collections',
      icon: <TrendingUp className="w-8 h-8" />,
      href: '/dashboard/reports/sales',
      category: 'sales',
      reports: [
        { name: t('sales.register.title'), href: '/dashboard/reports/sales/sales-register' },
        { name: t('sales.outstanding.title'), href: '/dashboard/reports/sales/customer-outstanding' },
      ],
    },
    {
      title: t('navigation.purchase'),
      description: 'Purchase bills & vendor payables',
      icon: <ShoppingCart className="w-8 h-8" />,
      href: '/dashboard/reports/purchase',
      category: 'purchase',
      reports: [
        { name: t('purchase.register.title'), href: '/dashboard/reports/purchase/purchase-register' },
      ],
    },
    {
      title: t('navigation.finance'),
      description: 'Financial statements & analysis',
      icon: <DollarSign className="w-8 h-8" />,
      href: '/dashboard/reports/finance',
      category: 'finance',
      reports: [
        { name: t('finance.trialBalance.title'), href: '/dashboard/reports/financial/trial-balance' },
        { name: t('finance.pl.title'), href: '/dashboard/reports/financial/pnl' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          </div>
          <p className="text-slate-600">{t('subtitle')}</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card) => (
            <Link
              key={card.category}
              href={card.reports[0]?.href || card.href}
              className="group"
            >
              <div className="h-full bg-white rounded-lg border border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <div className="text-blue-600">{card.icon}</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{card.description}</p>
                <div className="space-y-2">
                  {card.reports.map((report) => (
                    <div
                      key={report.href}
                      className="text-sm text-slate-500 flex items-center gap-2 hover:text-blue-600"
                    >
                      <Receipt className="w-4 h-4" />
                      {report.name}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Start Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/reports/inventory/current-stock"
              className="block p-4 bg-white rounded border border-blue-200 hover:border-blue-400 hover:shadow transition-all"
            >
              <div className="font-medium text-slate-900">Current Stock</div>
              <div className="text-sm text-slate-500">Real-time inventory</div>
            </Link>
            <Link
              href="/dashboard/reports/sales/sales-register"
              className="block p-4 bg-white rounded border border-blue-200 hover:border-blue-400 hover:shadow transition-all"
            >
              <div className="font-medium text-slate-900">Sales Register</div>
              <div className="text-sm text-slate-500">All sales invoices</div>
            </Link>
            <Link
              href="/dashboard/reports/sales/customer-outstanding"
              className="block p-4 bg-white rounded border border-blue-200 hover:border-blue-400 hover:shadow transition-all"
            >
              <div className="font-medium text-slate-900">Outstanding</div>
              <div className="text-sm text-slate-500">Customer collections</div>
            </Link>
            <Link
              href="/dashboard/reports/purchase/purchase-register"
              className="block p-4 bg-white rounded border border-blue-200 hover:border-blue-400 hover:shadow transition-all"
            >
              <div className="font-medium text-slate-900">Purchase Register</div>
              <div className="text-sm text-slate-500">All purchase bills</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
