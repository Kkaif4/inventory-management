# Reports Module - Component Guide

## Overview

The Reports Module provides a modular, production-grade component system for building data-driven reports with an **editorial design aesthetic**. Each component is self-contained, composable, and designed for accessibility and responsiveness.

---

## Design Philosophy

### Data-First Editorial
- **Intentional Typography**: Clear visual hierarchy using font weight, size, and case
- **Minimal but Purposeful**: No decoration without intent
- **Asymmetrical Layouts**: Break rigid grids for visual interest
- **Publication-Style**: Think financial dashboards, not generic admin panels

### Key Characteristics
✅ Non-generic fonts (IBM Plex Sans + IBM Plex Mono)
✅ Custom color palette (sage green, amber accents)
✅ Smooth interactions (cubic-bezier easing, intentional motion)
✅ Accessible by default (semantic HTML, focus states, contrast)
✅ Mobile-first responsive design

---

## Components

### 1. ReportsLayout

**Purpose**: Main container for all reports. Provides consistent header and spacing.

```tsx
import { ReportsLayout } from '@/components/reports';

export default function MyReportPage() {
  return (
    <ReportsLayout
      title="Sales Performance"
      description="Q1 2024 sales metrics and trends"
    >
      {/* Report content goes here */}
    </ReportsLayout>
  );
}
```

**Props**:
- `title` (string, required): Report heading
- `description` (string, optional): Subtitle/description
- `children` (ReactNode, required): Report content

---

### 2. FilterPanel

**Purpose**: Collapsible filter interface with multiple field types.

```tsx
import { FilterPanel, FilterOption } from '@/components/reports';
import { useState } from 'react';

export function MyReport() {
  const [filters, setFilters] = useState({
    dateRange: ['2024-01-01', '2024-03-31'],
    category: '',
    status: [],
    search: '',
  });

  const filterDefinitions = [
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'date-range' as const,
      value: filters.dateRange,
      onChange: (value) => setFilters({ ...filters, dateRange: value }),
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select' as const,
      placeholder: 'All categories',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
      ],
      value: filters.category,
      onChange: (value) => setFilters({ ...filters, category: value }),
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
    },
    {
      id: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search products...',
      value: filters.search,
      onChange: (value) => setFilters({ ...filters, search: value }),
    },
  ];

  return (
    <FilterPanel
      filters={filterDefinitions}
      onApply={() => console.log('Apply filters:', filters)}
      onReset={() => setFilters({ dateRange: [], category: '', status: [], search: '' })}
    />
  );
}
```

**Field Types**:
- `select`: Dropdown selection
- `search`: Text input for search
- `date-range`: Date range picker with from/to
- `checkbox-group`: Multiple checkbox options

**Props**:
- `filters` (FilterDef[], required): Array of filter definitions
- `onApply` (function, optional): Called when "Apply" button clicked
- `onReset` (function, optional): Called when "Reset All" clicked
- `isLoading` (boolean, optional): Disable buttons during loading

---

### 3. ReportCard & ReportGrid

**Purpose**: Discovery interface for available reports. Minimal, type-driven cards.

```tsx
import { ReportCard, ReportGrid } from '@/components/reports';
import { TrendingUp, AlertCircle, Package, DollarSign } from 'lucide-react';

export function ReportDiscovery() {
  return (
    <ReportGrid featuredIndex={0}>
      <ReportCard
        id="sales-register"
        title="Sales Register"
        description="Complete list of all posted sales invoices with details"
        icon={<TrendingUp size={24} />}
        metric="₹2.4M"
        metricLabel="Total Sales"
        variant="featured"
        href="/reports/sales/register"
      />
      <ReportCard
        id="low-stock"
        title="Low Stock Alert"
        description="Items below minimum stock thresholds"
        icon={<AlertCircle size={24} />}
        metric="23"
        metricLabel="Items"
        variant="alert"
        href="/reports/inventory/low-stock"
      />
      <ReportCard
        id="current-stock"
        title="Current Stock"
        description="Real-time inventory balance across warehouses"
        icon={<Package size={24} />}
        metric="1,240"
        metricLabel="Items in Stock"
        variant="default"
        href="/reports/inventory/current-stock"
      />
      <ReportCard
        id="valuation"
        title="Stock Valuation"
        description="Total inventory value using FIFO methodology"
        icon={<DollarSign size={24} />}
        metric="₹8.7M"
        metricLabel="Total Value"
        variant="success"
        href="/reports/inventory/valuation"
      />
    </ReportGrid>
  );
}
```

**ReportCard Props**:
- `id` (string, required): Unique identifier
- `title` (string, required): Card heading
- `description` (string, required): Subtitle
- `icon` (ReactNode, required): Icon component
- `metric` (string, optional): Metric value to display
- `metricLabel` (string, optional): Label for metric
- `variant` ('default' | 'featured' | 'alert' | 'success'): Visual style
- `href` (string, required): Navigation link
- `onClick` (function, optional): Custom click handler

**ReportGrid Props**:
- `children` (ReactNode, required): ReportCard components
- `featuredIndex` (number, optional): Index of featured card (spans 2 columns)

---

### 4. DataTableEditorial

**Purpose**: Clean, minimal data table with optional sorting and footer.

```tsx
import { DataTableEditorial, Column } from '@/components/reports';

interface SalesData {
  id: string;
  date: string;
  product: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export function SalesReportTable() {
  const data: SalesData[] = [
    {
      id: '1',
      date: '2024-03-20',
      product: 'Laptop Pro',
      quantity: 2,
      amount: 299998,
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-03-19',
      product: 'USB Cable',
      quantity: 50,
      amount: 2500,
      status: 'completed',
    },
  ];

  const columns: Column<SalesData>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      format: (value) => new Date(value).toLocaleDateString('en-IN'),
    },
    {
      key: 'product',
      header: 'Product',
      sortable: true,
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      align: 'right',
      sortable: true,
      format: (value) => value.toFixed(2),
    },
    {
      key: 'status',
      header: 'Status',
      format: (value) => (
        <span className={`badge badge-${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const footerRow = {
    date: 'Total',
    product: '',
    quantity: 52,
    amount: 302498,
    status: '',
  };

  return (
    <DataTableEditorial
      columns={columns}
      data={data}
      rowKey="id"
      striped={true}
      hoverable={true}
      compact={false}
      showFooter={true}
      footerRow={footerRow}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  );
}
```

**Column<T> Props**:
- `key` (keyof T, required): Data key
- `header` (string, required): Column heading
- `format` (function, optional): Format cell value
- `align` ('left' | 'center' | 'right'): Text alignment
- `sortable` (boolean): Enable sorting

**DataTableEditorial Props**:
- `columns` (Column[], required): Column definitions
- `data` (T[], required): Table data
- `rowKey` (keyof T, required): Unique row identifier
- `striped` (boolean): Alternating row colors
- `hoverable` (boolean): Highlight on hover
- `compact` (boolean): Reduce padding
- `showFooter` (boolean): Display footer row
- `footerRow` (Record, optional): Footer data
- `onRowClick` (function, optional): Row click handler

---

## Complete Example

```tsx
'use client';

import React, { useState } from 'react';
import {
  ReportsLayout,
  FilterPanel,
  DataTableEditorial,
  Column,
} from '@/components/reports';
import { Package, TrendingUp } from 'lucide-react';

interface StockData {
  sku: string;
  product: string;
  warehouse: string;
  quantity: number;
  value: number;
}

export default function CurrentStockReport() {
  const [filters, setFilters] = useState({
    warehouse: '',
    category: '',
    search: '',
  });

  const mockData: StockData[] = [
    {
      sku: 'SKU-001',
      product: 'Laptop Pro 15"',
      warehouse: 'Main Warehouse',
      quantity: 45,
      value: 2700000,
    },
    {
      sku: 'SKU-002',
      product: 'Wireless Mouse',
      warehouse: 'Branch A',
      quantity: 320,
      value: 64000,
    },
  ];

  const columns: Column<StockData>[] = [
    { key: 'sku', header: 'SKU', sortable: true },
    { key: 'product', header: 'Product', sortable: true },
    { key: 'warehouse', header: 'Warehouse', sortable: true },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right',
      sortable: true,
    },
    {
      key: 'value',
      header: 'Value (₹)',
      align: 'right',
      format: (val) => val.toLocaleString('en-IN'),
    },
  ];

  return (
    <ReportsLayout
      title="Current Stock Report"
      description="Real-time inventory across all warehouses"
    >
      <FilterPanel
        filters={[
          {
            id: 'warehouse',
            label: 'Warehouse',
            type: 'select',
            options: [
              { value: 'main', label: 'Main Warehouse' },
              { value: 'branch-a', label: 'Branch A' },
            ],
            value: filters.warehouse,
            onChange: (v) => setFilters({ ...filters, warehouse: v }),
          },
          {
            id: 'search',
            label: 'Search',
            type: 'search',
            placeholder: 'Product name or SKU...',
            value: filters.search,
            onChange: (v) => setFilters({ ...filters, search: v }),
          },
        ]}
        onApply={() => console.log('Filtered by:', filters)}
      />

      <DataTableEditorial
        columns={columns}
        data={mockData}
        rowKey="sku"
        striped
        hoverable
        showFooter
        footerRow={{
          sku: 'Total',
          product: '',
          warehouse: '',
          quantity: 365,
          value: 2764000,
        }}
      />
    </ReportsLayout>
  );
}
```

---

## CSS Variables

All components use CSS custom properties for theming:

```css
--color-primary: #1a1a1a;        /* Text color */
--color-secondary: #4a7c59;      /* Accent (sage green) */
--color-accent: #d97706;         /* Alerts (amber) */
--color-bg: #fafaf9;             /* Background */
--color-bg-elevated: #ffffff;    /* Card background */
--color-border: #d4d4d8;         /* Borders */
--color-text-primary: #1a1a1a;   /* Primary text */
--color-text-muted: #71717a;     /* Secondary text */
```

Override in your stylesheet:

```css
:root {
  --color-secondary: #your-brand-color;
}
```

---

## Best Practices

1. **Use TypeScript**: Leverage strong typing for columns and data
2. **Mobile First**: Components are responsive by default
3. **Accessibility**: All components support keyboard navigation
4. **Performance**: Use `React.memo` for large lists
5. **Styling**: Customize via CSS variables, not inline styles
6. **Semantics**: Use proper HTML elements (table, select, etc.)

---

## Theming

Each component respects the design system colors. To customize:

```css
/* In your global styles */
:root {
  --font-display: 'Your Display Font', sans-serif;
  --font-body: 'Your Body Font', sans-serif;
  --color-secondary: #your-accent-color;
}
```

---

## Accessibility Notes

- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Screen reader support (semantic HTML)
- ✅ Focus indicators (visible on all interactive elements)
- ✅ Color contrast (WCAG AA compliant)
- ✅ Responsive text sizes (readable on all screens)

---

## Questions?

See individual component source files for additional props and customization options.
