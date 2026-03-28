# Reports Module — Comprehensive Implementation Plan

## Executive Summary

The Reports Module is the business intelligence layer of the ERP system. It enables data-driven decision-making through 18 different reports across 5 functional areas (Sales, Purchase, Inventory, GST, Financial). The module must be:

- **Performant**: Aggregate queries across large datasets (multi-year history)
- **Reusable**: Common filter/export/print infrastructure shared across all reports
- **Role-aware**: Access control embedded at the report level
- **Reliable**: Audit-grade data accuracy (especially GST reports)

---

## 1. Architecture Overview

```
src/
├── app/
│   └── dashboard/
│       └── reports/
│           ├── layout.tsx                          # Reports sidebar + layout
│           ├── page.tsx                            # Reports home/directory
│           ├── sales/
│           │   ├── register/
│           │   │   ├── page.tsx                   # RSC page
│           │   │   └── register-client.tsx        # Client + table
│           │   ├── outstanding/
│           │   │   ├── page.tsx
│           │   │   └── outstanding-client.tsx
│           │   └── items/
│           │       ├── page.tsx
│           │       └── items-client.tsx
│           ├── purchase/
│           │   ├── register/
│           │   ├── outstanding/
│           │   └── grn/
│           ├── inventory/
│           │   ├── current-stock/
│           │   ├── low-stock/
│           │   ├── ledger/
│           │   ├── valuation/
│           │   └── slow-moving/
│           ├── gst/
│           │   ├── gstr1/
│           │   ├── gstr3b/
│           │   └── itc/
│           ├── finance/
│           │   ├── trial-balance/
│           │   ├── pl/
│           │   ├── balance-sheet/
│           │   └── cash-flow/
│           └── cash-memos/
│
├── components/
│   └── reports/
│       ├── common/
│       │   ├── report-header.tsx                  # Title + breadcrumbs
│       │   ├── filter-bar.tsx                     # Standard filter UI
│       │   ├── date-range-picker.tsx              # Presets + custom
│       │   ├── outlet-selector.tsx                # Admin/non-admin logic
│       │   ├── report-table.tsx                   # TanStack table wrapper
│       │   ├── report-footer.tsx                  # Totals row
│       │   ├── report-state.tsx                   # Loading/Empty/Error/Data
│       │   ├── export-button.tsx                  # Excel + JSON export
│       │   ├── print-button.tsx                   # Print view + CSS
│       │   └── report-shell.tsx                   # Combines above
│       ├── filters/
│       │   ├── customer-filter.tsx
│       │   ├── vendor-filter.tsx
│       │   ├── product-filter.tsx
│       │   ├── category-filter.tsx
│       │   └── invoice-type-filter.tsx
│       └── charts/
│           ├── revenue-trend.tsx
│           ├── expense-trend.tsx
│           └── cash-flow-waterfall.tsx
│
├── actions/
│   └── reports/
│       ├── sales.ts                               # Sales report queries
│       ├── purchase.ts                            # Purchase report queries
│       ├── inventory.ts                           # Inventory report queries
│       ├── gst.ts                                 # GST report aggregations
│       └── finance.ts                             # GL + Financial queries
│
├── lib/
│   └── reports/
│       ├── date-utils.ts                          # FY, period, preset logic
│       ├── export.ts                              # Excel generation (XLSX)
│       ├── print-layout.ts                        # Print CSS & HTML
│       ├── aggregations.ts                        # Reusable Prisma aggregations
│       ├── formatters.ts                          # Currency, date, batch, qty
│       ├── access-control.ts                      # Role-based filtering
│       └── report-cache.ts                        # Optional: Redis caching
│
├── types/
│   └── reports/
│       ├── common.ts                              # Shared types
│       ├── sales.ts                               # Sales report DTOs
│       ├── purchase.ts                            # Purchase report DTOs
│       ├── inventory.ts                           # Inventory report DTOs
│       ├── gst.ts                                 # GST report DTOs
│       └── finance.ts                             # Financial report DTOs
│
├── messages/
│   └── en/
│       └── reports.json                           # i18n keys
│
└── styles/
    └── reports/
        └── print.css                              # Print-only styles
```

---

## 2. Phased Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal**: Build the reusable infrastructure that every report will use.

#### 2.1.1 Report Shell Component

**File**: `src/components/reports/common/report-shell.tsx`

```typescript
interface ReportShellProps {
  title: string;
  subtitle: string;
  filters: ReactNode;
  state: 'loading' | 'empty' | 'error' | 'data';
  errorMessage?: string;
  retryFn?: () => void;
  children: ReactNode; // The table or chart
  footerData?: any; // For totals row
  onExport?: () => void;
  onPrint?: () => void;
}

export function ReportShell({
  title,
  subtitle,
  filters,
  state,
  children,
  ...props
}: ReportShellProps) {
  return (
    <div className="space-y-6">
      <ReportHeader title={title} subtitle={subtitle} />
      <FilterBar>{filters}</FilterBar>
      <div className="print:hidden space-x-2">
        <ExportButton onClick={props.onExport} />
        <PrintButton onClick={props.onPrint} />
      </div>

      <ReportState state={state} error={props.errorMessage} retry={props.retryFn}>
        {children}
      </ReportState>

      {state === 'data' && props.footerData && (
        <ReportFooter data={props.footerData} />
      )}
    </div>
  );
}
```

#### 2.1.2 Date Range Picker with Presets

**File**: `src/components/reports/common/date-range-picker.tsx`

Presets:
- Today
- This Week (Mon–Sun)
- This Month
- Last Month
- This Quarter
- This FY (Apr–Mar or Jan–Dec based on config)
- Last FY
- Custom (DatePicker range)

```typescript
type DatePreset = 'today' | 'week' | 'month' | 'lastMonth' | 'quarter' | 'fy' | 'lastFy' | 'custom';

interface DateRangePickerProps {
  value: { from: Date; to: Date };
  onChange: (dates: { from: Date; to: Date }) => void;
  allowCustom?: boolean;
}

export function DateRangePicker({ value, onChange, allowCustom = true }: DateRangePickerProps) {
  const presets: Record<DatePreset, () => { from: Date; to: Date }> = {
    today: () => ({ from: today(), to: today() }),
    week: () => ({
      from: startOfWeek(today()),
      to: endOfWeek(today()),
    }),
    month: () => ({
      from: startOfMonth(today()),
      to: endOfMonth(today()),
    }),
    // ... etc
  };

  return (
    <div className="flex gap-2">
      <Tabs defaultValue="presets">
        <TabsList>
          {Object.keys(presets).map(preset => (
            <TabsTrigger
              key={preset}
              value={preset}
              onClick={() => onChange(presets[preset as DatePreset]())}
            >
              {preset.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {allowCustom && (
        <Popover>
          <PopoverTrigger>Custom</PopoverTrigger>
          <PopoverContent>
            <DatePickerWithRange value={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
```

#### 2.1.3 Outlet Selector

**File**: `src/lib/reports/access-control.ts`

```typescript
export async function getReportOutletFilter(userId: string, role: Role) {
  // Admin: can select any outlet
  if (role === 'ADMIN') {
    const outlets = await prisma.outlet.findMany({
      select: { id: true, name: true },
    });
    return { outlets, canSelect: true, default: null };
  }

  // Non-admin: locked to their assigned outlet(s)
  const userOutlets = await prisma.outlet
    .findMany({
      where: { users: { some: { id: userId } } },
      select: { id: true, name: true },
    });

  return { outlets: userOutlets, canSelect: false, default: userOutlets[0]?.id };
}
```

#### 2.1.4 Export to Excel

**File**: `src/lib/reports/export.ts`

```typescript
import ExcelJS from 'exceljs';

interface ExcelExportOptions {
  filename: string;
  title: string;
  columns: { header: string; key: string; width?: number }[];
  data: Record<string, any>[];
  totalsRow?: Record<string, any>;
  summaryData?: Record<string, string | number>;
}

export async function exportToExcel(options: ExcelExportOptions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Add title
  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = options.title;
  worksheet.getCell('A1').font = { bold: true, size: 14 };

  // Add summary (filter info)
  worksheet.mergeCells('A2:H2');
  worksheet.getCell('A2').value = `Generated on ${new Date().toLocaleString()}`;

  // Add table
  worksheet.columns = options.columns;
  options.data.forEach(row => worksheet.addRow(row));

  // Add totals row
  if (options.totalsRow) {
    worksheet.addRow(options.totalsRow);
    const lastRow = worksheet.lastRow;
    lastRow.font = { bold: true, bg: 'E0E0E0' };
  }

  await workbook.xlsx.writeFile(`${options.filename}.xlsx`);
}
```

#### 2.1.5 Print Layout

**File**: `src/styles/reports/print.css`

```css
@media print {
  .print\:hidden {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 0.5in;
  }

  body {
    font-family: Arial, sans-serif;
    font-size: 11px;
    line-height: 1.4;
  }

  .report-header {
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
  }

  .report-filter-summary {
    font-size: 10px;
    color: #666;
    margin-bottom: 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: avoid;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  td {
    padding: 6px;
    border-bottom: 1px solid #ddd;
  }

  .report-footer {
    margin-top: 20px;
    text-align: right;
    font-size: 10px;
    color: #666;
  }

  .page-break {
    page-break-after: always;
  }
}
```

#### 2.1.6 Types & DTOs

**File**: `src/types/reports/common.ts`

```typescript
export interface ReportFilter {
  dateFrom: Date;
  dateTo: Date;
  outletId: string;
  [key: string]: any; // Report-specific filters
}

export interface ReportPage {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totals?: Record<string, number | string>; // Footer totals
}

export interface ExportOptions {
  format: 'excel' | 'json' | 'csv';
  includeHeaders: boolean;
}
```

#### 2.1.7 i18n Keys

**File**: `src/messages/en/reports.json`

```json
{
  "title": "Reports",
  "subtitle": "Business Intelligence & Analytics",
  "filters": {
    "dateRange": "Date Range",
    "outlet": "Outlet / Warehouse",
    "moreFilters": "More Filters",
    "applyFilters": "Apply",
    "resetFilters": "Reset",
    "presets": {
      "today": "Today",
      "week": "This Week",
      "month": "This Month",
      "lastMonth": "Last Month",
      "quarter": "This Quarter",
      "fy": "This FY",
      "lastFy": "Last FY",
      "custom": "Custom"
    }
  },
  "export": {
    "excel": "Export Excel",
    "json": "Export JSON",
    "csv": "Export CSV"
  },
  "print": "Print",
  "noData": "No data for the selected filters.",
  "changeFilters": "Change filters",
  "error": "An error occurred while loading the report.",
  "retry": "Retry",
  "sales": {
    "register": {
      "title": "Sales Register",
      "subtitle": "Complete list of all posted sales invoices"
    },
    "outstanding": {
      "title": "Customer Outstanding",
      "subtitle": "Collections report - Shows unpaid balance by customer"
    },
    "items": {
      "title": "Item-wise Sales",
      "subtitle": "Product performance analysis"
    }
  },
  "purchase": {
    "register": {
      "title": "Purchase Register",
      "subtitle": "Complete list of all posted purchase bills"
    },
    "outstanding": {
      "title": "Vendor Outstanding",
      "subtitle": "Payables report - Shows outstanding balance by vendor"
    },
    "grn": {
      "title": "GRN Summary",
      "subtitle": "Goods Receipt Note summary"
    }
  },
  "inventory": {
    "currentStock": {
      "title": "Current Stock",
      "subtitle": "Snapshot of inventory on hand"
    },
    "lowStock": {
      "title": "Low Stock Alert",
      "subtitle": "Items below minimum stock level"
    },
    "ledger": {
      "title": "Stock Ledger",
      "subtitle": "Complete movement history for a product"
    },
    "valuation": {
      "title": "Stock Valuation",
      "subtitle": "Total inventory value"
    },
    "slowMoving": {
      "title": "Slow-Moving Stock",
      "subtitle": "Items with no recent outward movement"
    }
  },
  "gst": {
    "gstr1": {
      "title": "GSTR-1",
      "subtitle": "Outward supplies data for GST return filing"
    },
    "gstr3b": {
      "title": "GSTR-3B Summary",
      "subtitle": "Net GST liability summary"
    },
    "itc": {
      "title": "ITC Register",
      "subtitle": "Input Tax Credit availability"
    }
  },
  "finance": {
    "trialBalance": {
      "title": "Trial Balance",
      "subtitle": "All accounts with opening, debit, credit, and closing balances"
    },
    "pl": {
      "title": "Profit & Loss",
      "subtitle": "Income and expenses summary"
    },
    "balanceSheet": {
      "title": "Balance Sheet",
      "subtitle": "Financial position - Assets, Liabilities, Equity"
    },
    "cashFlow": {
      "title": "Cash Flow",
      "subtitle": "Cash inflows and outflows by activity"
    }
  }
}
```

#### 2.1.8 Deliverables Checklist

- [ ] `report-shell.tsx` (core layout component)
- [ ] `date-range-picker.tsx` (with all presets)
- [ ] `outlet-selector.tsx` (admin/non-admin logic)
- [ ] `access-control.ts` (role-based filtering utility)
- [ ] `export.ts` (Excel generation)
- [ ] `print.css` (@media print styles)
- [ ] `types/reports/common.ts` (shared TypeScript types)
- [ ] `messages/en/reports.json` (i18n keys)

---

### Phase 2: Inventory Reports (Week 2–3)

**Goal**: Implement the 5 inventory reports. Lowest complexity (no GST, no GL).

#### 2.2.1 Current Stock Report

**Route**: `/reports/inventory/current-stock`

**File Structure**:
```
src/app/dashboard/reports/inventory/current-stock/
├── page.tsx
└── current-stock-client.tsx
```

**page.tsx** (RSC):
```typescript
export default async function CurrentStockPage({ searchParams }) {
  const outletId = await getCurrentSessionOutlet();
  const filters = parseReportFilters(searchParams, {
    warehouseId: '',
    categoryId: '',
    brand: '',
    status: 'ALL',
    asOfDate: new Date(),
  });

  const data = await getStockSnapshot(outletId, filters);
  const totals = calculateStockTotals(data);

  return (
    <ReportShell
      title="Current Stock"
      subtitle="Snapshot of inventory on hand"
      filters={<CurrentStockFilters />}
      state={data ? 'data' : 'empty'}
      footerData={totals}
      onExport={() => exportCurrentStock(data)}
      onPrint={() => printCurrentStock(data)}
    >
      <CurrentStockTable data={data} />
    </ReportShell>
  );
}
```

**Server Action** `src/actions/reports/inventory.ts`:
```typescript
export async function getStockSnapshot(
  outletId: string,
  filters: CurrentStockFilters,
) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(outletId);

    const where: any = {
      outlet: { id: outletId },
      quantity: { gt: 0 }, // On hand > 0
    };

    if (filters.warehouseId) where.warehouse = { id: filters.warehouseId };
    if (filters.categoryId) where.variant = { product: { categoryId: filters.categoryId } };
    if (filters.brand) where.variant = { product: { brand: filters.brand } };

    const stocks = await prisma.stock.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
        warehouse: true,
      },
    });

    // Apply status filter in-memory (easier than Prisma)
    return stocks
      .map(s => ({
        sku: s.variant.sku,
        product: s.variant.product.name,
        category: s.variant.product.category.name,
        warehouse: s.warehouse.name,
        qtyOnHand: s.quantity,
        minStockLevel: s.variant.minStockLevel,
        reorderQty: s.quantity - s.variant.minStockLevel,
        movingAvgCost: calculateMovingAvgCost(s.variant.id),
        stockValue: s.quantity * calculateMovingAvgCost(s.variant.id),
      }))
      .filter(row => {
        if (filters.status === 'IN_STOCK') return row.qtyOnHand > row.minStockLevel;
        if (filters.status === 'LOW_STOCK') return row.qtyOnHand <= row.minStockLevel && row.qtyOnHand > 0;
        if (filters.status === 'OUT_OF_STOCK') return row.qtyOnHand === 0;
        return true;
      });
  });
}

function calculateMovingAvgCost(variantId: string): number {
  // FIFO if enabled, otherwise simple average
  // TODO: Implement based on outlet.inventoryValuationMethod
  return 0;
}

function calculateStockTotals(data: CurrentStockRow[]): Record<string, number> {
  return {
    totalQty: data.reduce((sum, row) => sum + row.qtyOnHand, 0),
    totalValue: data.reduce((sum, row) => sum + row.stockValue, 0),
  };
}
```

**Columns**:
| SKU | Product | Category | Warehouse | Qty on Hand | Min Level | Reorder Qty | Avg Cost | Stock Value |

**Footer**: Total Qty, Total Value.

#### 2.2.2 Low Stock Alert Report

**Route**: `/reports/inventory/low-stock`

Similar structure. Query: `WHERE quantity <= minStockLevel AND quantity > 0`

**Action in `src/actions/reports/inventory.ts`**:
```typescript
export async function getLowStockItems(
  outletId: string,
  filters: LowStockFilters,
) {
  return withErrorHandler(async () => {
    const stocks = await prisma.stock.findMany({
      where: {
        outlet: { id: outletId },
        quantity: { lte: prisma.raw('variant.minStockLevel') }, // Raw SQL needed
      },
      include: { variant: { include: { product: true } }, warehouse: true },
    });

    // Calculate last GRN date & preferred vendor
    return Promise.all(stocks.map(async s => ({
      sku: s.variant.sku,
      product: s.variant.product.name,
      warehouse: s.warehouse.name,
      currentQty: s.quantity,
      minStockLevel: s.variant.minStockLevel,
      deficit: s.variant.minStockLevel - s.quantity,
      lastGrnDate: await getLastGrnDate(s.variant.id, s.warehouse.id),
      preferredVendor: await getPreferredVendor(s.variant.id),
    })));
  });
}

async function getLastGrnDate(variantId: string, warehouseId: string): Promise<Date | null> {
  const grn = await prisma.transaction.findFirst({
    where: {
      type: 'GRN',
      toLocationId: warehouseId,
      items: { some: { variantId } },
    },
    orderBy: { date: 'desc' },
    select: { date: true },
  });
  return grn?.date || null;
}

async function getPreferredVendor(variantId: string): Promise<string | null> {
  const vp = await prisma.vendorProduct.findFirst({
    where: { variantId },
    include: { vendor: true },
    orderBy: { lastPrice: 'desc' },
  });
  return vp?.vendor.name || null;
}
```

#### 2.2.3 Stock Ledger Report

**Route**: `/reports/inventory/ledger`

**Required filters**: Product + Warehouse (must select before loading).

**page.tsx**:
```typescript
export default async function StockLedgerPage({ searchParams }) {
  const outletId = await getCurrentSessionOutlet();
  const { variantId, warehouseId, dateFrom, dateTo } = searchParams;

  if (!variantId || !warehouseId) {
    return <SelectRequiredFilters />;
  }

  const ledger = await getStockLedger(outletId, {
    variantId,
    warehouseId,
    dateFrom: parseDate(dateFrom),
    dateTo: parseDate(dateTo),
  });

  const summaryData = {
    openingBalance: ledger[0]?.balance || 0,
    totalIn: ledger.filter(l => l.quantity > 0).reduce((sum, l) => sum + l.quantity, 0),
    totalOut: ledger.filter(l => l.quantity < 0).reduce((sum, l) => sum + Math.abs(l.quantity), 0),
    closingBalance: ledger[ledger.length - 1]?.balance || 0,
  };

  return (
    <ReportShell
      title="Stock Ledger"
      subtitle={`For SKU: ${variantSku}`}
      summaryData={summaryData}
    >
      <StockLedgerTable data={ledger} />
    </ReportShell>
  );
}
```

**Server Action**:
```typescript
export async function getStockLedger(
  outletId: string,
  filters: StockLedgerFilters,
): Promise<StockLedgerRow[]> {
  const entries = await prisma.stockLedger.findMany({
    where: {
      variantId: filters.variantId,
      warehouseId: filters.warehouseId,
      outletId,
      date: {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      },
    },
    include: { transaction: true, user: true },
    orderBy: { date: 'asc' },
  });

  // Calculate running balance
  let balance = 0;
  return entries.map(entry => ({
    date: entry.date,
    type: entry.type, // PURCHASE, SALE, TRANSFER_IN, etc.
    referenceNo: entry.transaction?.txnNumber,
    description: generateDescription(entry),
    inQty: entry.quantity > 0 ? entry.quantity : 0,
    outQty: entry.quantity < 0 ? Math.abs(entry.quantity) : 0,
    balance: (balance += entry.quantity),
    batchNo: entry.costPerUnit ? 'FIFO' : null,
    costPerUnit: entry.costPerUnit,
    user: entry.user.name,
  }));
}

function generateDescription(entry: StockLedger): string {
  const txn = entry.transaction;
  if (entry.type === 'SALE') return `Sale to ${txn.party?.name} — ${txn.txnNumber}`;
  if (entry.type === 'PURCHASE') return `Purchase from ${txn.party?.name} — ${txn.txnNumber}`;
  // ... etc
  return entry.type;
}
```

**Columns**: Date | Type | Reference | Description | In | Out | Balance | Batch | Cost/Unit | User

**Summary Strip**: Opening · Total In · Total Out · Closing

#### 2.2.4 Stock Valuation Report

**Route**: `/reports/inventory/valuation`

**Grouping**: By Category (L1).

Each category has subtotal; report footer has grand total.

```typescript
export async function getStockValuation(
  outletId: string,
  filters: ValuationFilters,
): Promise<ValuationRow[]> {
  const stocks = await prisma.stock.findMany({
    where: {
      outlet: { id: outletId },
      quantity: { gt: 0 },
      // Apply category filter if provided
    },
    include: { variant: { include: { product: { include: { category: true } } } } },
  });

  // Group by category
  const grouped = groupBy(stocks, s => s.variant.product.category.name);

  const rows: ValuationRow[] = [];
  for (const [category, items] of Object.entries(grouped)) {
    let categoryTotal = 0;

    for (const item of items) {
      const value = item.quantity * calculateMovingAvgCost(item.variant.id);
      categoryTotal += value;
      rows.push({
        category,
        product: item.variant.product.name,
        sku: item.variant.sku,
        qty: item.quantity,
        rate: calculateMovingAvgCost(item.variant.id),
        value,
        type: 'item',
      });
    }

    // Subtotal row
    rows.push({
      category,
      product: `Subtotal - ${category}`,
      value: categoryTotal,
      type: 'subtotal',
    });
  }

  return rows;
}
```

**Summary Cards** (above table):
- Total Inventory Value
- Total SKUs
- Total Qty

#### 2.2.5 Slow-Moving Stock Report

**Route**: `/reports/inventory/slow-moving`

**Query**: Find all stock with `lastOutwardMovement < today - N days` where N is the filter (30/60/90/180).

```typescript
export async function getSlowMovingStock(
  outletId: string,
  filters: SlowMovingFilters,
): Promise<SlowMovingRow[]> {
  const thresholdDate = subDays(today(), filters.daysThreshold);

  const stocks = await prisma.stock.findMany({
    where: {
      outlet: { id: outletId },
      quantity: { gt: 0 },
    },
    include: { variant: true, warehouse: true },
  });

  // Find last outward movement for each stock
  return Promise.all(stocks.map(async s => {
    const lastOutbound = await prisma.stockLedger.findFirst({
      where: {
        variantId: s.variantId,
        warehouseId: s.warehouseId,
        quantity: { lt: 0 }, // Outbound only
      },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    const daysSince = lastOutbound ? differenceInDays(today(), lastOutbound.date) : 999999;

    return {
      sku: s.variant.sku,
      product: s.variant.product.name,
      warehouse: s.warehouse.name,
      qtyOnHand: s.quantity,
      stockValue: s.quantity * calculateMovingAvgCost(s.variantId),
      lastOutwardMovement: lastOutbound?.date || null,
      daysSinceMovement: daysSince,
      lastGrnDate: await getLastGrnDate(s.variantId, s.warehouseId),
    };
  }));
}
```

#### 2.2.6 Deliverables Checklist

- [ ] `src/app/dashboard/reports/inventory/current-stock/` (page + client)
- [ ] `src/app/dashboard/reports/inventory/low-stock/` (page + client)
- [ ] `src/app/dashboard/reports/inventory/ledger/` (page + client)
- [ ] `src/app/dashboard/reports/inventory/valuation/` (page + client)
- [ ] `src/app/dashboard/reports/inventory/slow-moving/` (page + client)
- [ ] `src/actions/reports/inventory.ts` (all 5 server actions)
- [ ] `src/types/reports/inventory.ts` (DTOs)

---

### Phase 3: Sales & Purchase Operational Reports (Week 4–5)

#### 2.3.1 Sales Register Report

**Route**: `/reports/sales/register`

**Filters**:
- Date Range
- Outlet
- Customer (SearchSelect)
- Invoice Type (All / No.1 / No.2)
- Status (All / Posted / Partially Paid / Paid / Cancelled)
- GST Rate (multi-select)

**Server Action**:
```typescript
export async function getSalesRegister(
  outletId: string,
  filters: SalesRegisterFilters,
): Promise<SalesRegisterRow[]> {
  const where: any = {
    type: 'SALES_INVOICE',
    outletId,
    date: { gte: filters.dateFrom, lte: filters.dateTo },
  };

  if (filters.customerId) where.partyId = filters.customerId;
  if (filters.invoiceType !== 'ALL') where.billType = filters.invoiceType === 'NO1' ? 'NO1' : 'NO2';
  if (filters.status !== 'ALL') where.status = filters.status;

  const invoices = await prisma.transaction.findMany({
    where,
    include: {
      party: true,
      items: { include: { variant: { include: { product: true } } } },
      payments: { select: { amount: true } },
    },
    orderBy: { date: 'desc' },
  });

  // Apply GST rate filter in-memory (checks if any item in invoice matches rate)
  let filtered = invoices;
  if (filters.gstRates && filters.gstRates.length > 0) {
    filtered = invoices.filter(inv =>
      inv.items.some(item => filters.gstRates.includes(item.variant.product.gstRate))
    );
  }

  // Calculate payment status and outstanding
  return filtered.map(inv => {
    const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = inv.grandTotal - totalPaid;

    return {
      invoiceNo: inv.txnNumber,
      date: inv.date,
      customer: inv.party?.name || 'Walk-in',
      placeOfSupply: inv.party?.state || 'N/A',
      gstType: hasIgst(inv.items) ? 'IGST' : 'CGST+SGST',
      taxableValue: inv.totalTaxable,
      cgst: hasIgst(inv.items) ? 0 : inv.totalTax / 2,
      sgst: hasIgst(inv.items) ? 0 : inv.totalTax / 2,
      igst: hasIgst(inv.items) ? inv.totalTax : 0,
      totalTax: inv.totalTax,
      grandTotal: inv.grandTotal,
      paymentStatus: outstanding === 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid',
      outstanding,
    };
  });
}

function hasIgst(items: TransactionItem[]): boolean {
  // IGST is used when place of supply != outlet state
  return true; // Simplified; actual logic in full implementation
}
```

**Columns**: Invoice No. | Date | Customer | Place of Supply | GST Type | Taxable | CGST | SGST | IGST | Total Tax | Grand Total | Payment Status | Outstanding

**Footer Totals**: Sum of Taxable, CGST, SGST, IGST, Total Tax, Grand Total, Outstanding.

#### 2.3.2 Item-wise Sales Report

**Route**: `/reports/sales/items`

**Filters**: Date Range | Outlet | Category | Brand | Product/SKU

**Server Action**:
```typescript
export async function getItemwiseSales(
  outletId: string,
  filters: ItemwiseSalesFilters,
): Promise<ItemwiseSalesRow[]> {
  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: {
        type: 'SALES_INVOICE',
        outletId,
        status: 'POSTED',
        date: { gte: filters.dateFrom, lte: filters.dateTo },
      },
      variant: {
        product: {
          categoryId: filters.categoryId || undefined,
          brand: filters.brand || undefined,
        },
      },
    },
    include: { variant: { include: { product: { include: { category: true } } } } },
  });

  // Group by SKU and aggregate
  const grouped = groupBy(items, i => i.variant.sku);

  return Object.entries(grouped).map(([sku, lineItems]) => ({
    sku,
    product: lineItems[0].variant.product.name,
    category: lineItems[0].variant.product.category.name,
    brand: lineItems[0].variant.product.brand || 'N/A',
    qtyTotal: lineItems.reduce((sum, i) => sum + i.quantity, 0),
    unit: lineItems[0].variant.product.baseUnit,
    avgRate: lineItems.reduce((sum, i) => sum + i.rate, 0) / lineItems.length,
    totalRevenue: lineItems.reduce((sum, i) => sum + i.taxableValue, 0),
    totalDiscount: lineItems.reduce((sum, i) => sum + (i.discountAmount || 0), 0),
    grossRevenue: lineItems.reduce((sum, i) => sum + i.rate * i.quantity, 0),
    timesInvoiced: new Set(lineItems.map(i => i.transactionId)).size,
  }));
}
```

**Default Sort**: Total Revenue DESC

#### 2.3.3 Purchase Register & Vendor Outstanding

Follow the same pattern as Sales Register.

#### 2.3.4 GRN Summary Report

**Route**: `/reports/purchase/grn`

**Filters**: Date Range | Outlet/Warehouse | Vendor | Status (All / Saved / Closed / Pending Bill)

```typescript
export async function getGrnSummary(
  outletId: string,
  filters: GrnSummaryFilters,
): Promise<GrnSummaryRow[]> {
  const grns = await prisma.transaction.findMany({
    where: {
      type: 'GRN',
      outletId,
      partyId: filters.vendorId || undefined,
      toLocationId: filters.warehouseId || undefined,
      date: { gte: filters.dateFrom, lte: filters.dateTo },
    },
    include: {
      party: true,
      items: true,
      _count: { select: { items: true } },
      // Find linked bill (if any)
      children: { select: { id: true, txnNumber: true } },
    },
  });

  return grns.map(grn => ({
    grnNo: grn.txnNumber,
    date: grn.date,
    vendor: grn.party.name,
    poNo: 'PO-12345', // Link to parent PO if exists
    warehouse: grn.toWarehouse?.name || 'N/A',
    itemsReceived: grn._count.items,
    totalQty: grn.items.reduce((sum, i) => sum + i.quantity, 0),
    totalValue: grn.grandTotal, // At purchase price
    billStatus: grn.children.length > 0 ? 'Billed' : 'Pending Bill',
    linkedBillNo: grn.children[0]?.txnNumber || null,
  }));
}
```

#### 2.3.5 Cash Memo Report

**Route**: `/reports/cash-memos`

**Filters**: Date Range | Outlet | Posted By (user)

```typescript
export async function getCashMemos(
  outletId: string,
  filters: CashMemoFilters,
): Promise<CashMemoRow[]> {
  const memos = await prisma.transaction.findMany({
    where: {
      type: 'SALES_INVOICE',
      billType: 'NO2', // No.2 bills only
      outletId,
      date: { gte: filters.dateFrom, lte: filters.dateTo },
      userId: filters.userId || undefined,
    },
    include: { user: true, _count: { select: { items: true } } },
  });

  return memos.map(memo => ({
    cmNo: memo.txnNumber,
    date: memo.date,
    buyerName: memo.buyerName || '—',
    buyerPhone: memo.buyerPhone || '—',
    itemCount: memo._count.items,
    total: memo.grandTotal,
    paymentMode: 'Cash', // Would need to track from transaction metadata
    postedBy: memo.user.name,
  }));
}
```

#### 2.3.6 Deliverables Checklist

- [ ] `src/app/dashboard/reports/sales/register/`
- [ ] `src/app/dashboard/reports/sales/items/`
- [ ] `src/app/dashboard/reports/purchase/register/`
- [ ] `src/app/dashboard/reports/purchase/grn/`
- [ ] `src/app/dashboard/reports/cash-memos/`
- [ ] `src/actions/reports/sales.ts` (Sales Register, Item-wise Sales)
- [ ] `src/actions/reports/purchase.ts` (Purchase Register, GRN Summary)
- [ ] `src/types/reports/sales.ts` & `purchase.ts`

---

### Phase 4: Outstanding & Ageing (Week 6)

#### 2.4.1 Customer Outstanding Report

**Route**: `/reports/sales/outstanding`

**Filters**: Outlet | As-of Date | Overdue Only Toggle | State | Customer Type (B2B/B2C)

**Complexity**: Ageing buckets (0–30, 31–60, 61–90, 90+).

```typescript
export async function getCustomerOutstanding(
  outletId: string,
  filters: OutstandingFilters,
): Promise<OutstandingRow[]> {
  const customers = await prisma.party.findMany({
    where: {
      type: 'CUSTOMER',
      outletId,
      state: filters.state || undefined,
      isActive: true,
    },
  });

  const asOfDate = filters.asOfDate || today();
  const today_val = today();

  return Promise.all(customers.map(async customer => {
    // Get all unpaid invoices
    const invoices = await prisma.transaction.findMany({
      where: {
        type: 'SALES_INVOICE',
        partyId: customer.id,
        status: { in: ['POSTED', 'PARTIALLY_PAID'] },
      },
      include: { payments: true },
    });

    // Calculate outstanding per invoice
    const outstanding = invoices.map(inv => ({
      balance: inv.grandTotal - (inv.payments.reduce((sum, p) => sum + p.amount, 0)),
      dueDate: addDays(inv.date, customer.creditPeriod),
    }));

    // Age each outstanding amount
    const age0_30 = outstanding
      .filter(o => differenceInDays(asOfDate, o.dueDate) <= 30)
      .reduce((sum, o) => sum + o.balance, 0);

    const age31_60 = outstanding
      .filter(o => {
        const days = differenceInDays(asOfDate, o.dueDate);
        return days > 30 && days <= 60;
      })
      .reduce((sum, o) => sum + o.balance, 0);

    // ... 61–90, 90+

    const totalOutstanding = outstanding.reduce((sum, o) => sum + o.balance, 0);

    return {
      customerName: customer.name,
      type: customer.gstin ? 'B2B' : 'B2C',
      state: customer.state,
      creditPeriod: customer.creditPeriod,
      creditLimit: customer.creditLimit || 'No Limit',
      totalOutstanding,
      age0_30,
      age31_60,
      age61_90,
      age90plus,
      lastPaymentDate: await getLastPaymentDate(customer.id),
    };
  }));
}

async function getLastPaymentDate(customerId: string): Promise<Date | null> {
  const payment = await prisma.payment.findFirst({
    where: { partyId: customerId },
    orderBy: { paymentDate: 'desc' },
    select: { paymentDate: true },
  });
  return payment?.paymentDate || null;
}
```

**Columns**: Customer | Type | State | Credit Period | Credit Limit | Total Outstanding | 0–30 | 31–60 | 61–90 | 90+ | Last Payment

**Footer Totals**: Sum of each bucket + Total Outstanding.

**Drill-down**: Click customer row → expand to show all open invoices with due dates and amounts.

#### 2.4.2 Vendor Outstanding Report

Same structure as Customer Outstanding.

#### 2.4.3 Deliverables Checklist

- [ ] `src/app/dashboard/reports/sales/outstanding/`
- [ ] `src/app/dashboard/reports/purchase/outstanding/`
- [ ] Server actions for ageing logic
- [ ] Drill-down expandable rows in client

---

### Phase 5: GST Reports (Week 7–8)

**Complexity**: High. Must match GSTR-1/3B form structures and validation rules.

#### 2.5.1 GSTR-1 Report

**Route**: `/reports/gst/gstr1`

**Period Selector**: Financial Year + Month/Quarter.

**Tabs**:
1. **B2B Invoices** (Table 4)
2. **B2C Invoices** (Table 5 & 7)
3. **HSN Summary** (Table 12)
4. **Credit Notes** (Table 9)
5. **Document Summary** (Table 13)

**Server Actions** `src/actions/reports/gst.ts`:

```typescript
// Tab 1: B2B Invoices
export async function getGstr1B2bInvoices(
  outletId: string,
  period: { year: number; month: number },
): Promise<Gstr1B2bRow[]> {
  const invoices = await prisma.transaction.findMany({
    where: {
      type: 'SALES_INVOICE',
      outletId,
      status: 'POSTED',
      date: {
        gte: startOfMonth(new Date(period.year, period.month - 1, 1)),
        lte: endOfMonth(new Date(period.year, period.month - 1, 1)),
      },
      party: { type: 'CUSTOMER', gstin: { not: null } }, // Registered customers
    },
    include: { party: true, items: true },
  });

  return invoices.map(inv => ({
    gstinOfRecipient: inv.party.gstin,
    tradeName: inv.party.name,
    invoiceNo: inv.txnNumber,
    invoiceDate: inv.date,
    invoiceValue: inv.grandTotal,
    placeOfSupply: inv.party.state,
    reverseCharge: 'N', // Determine based on rules
    invoiceType: 'Regular', // Or 'Bill of Supply'
    rate: aggregateGstRate(inv.items), // Highest rate in invoice
    taxableValue: inv.totalTaxable,
    igst: computeIgst(inv),
    cgst: computeCgst(inv),
    sgst: computeSgst(inv),
  }));
}

// Tab 2: B2C Invoices (grouped by state & rate)
export async function getGstr1B2cInvoices(
  outletId: string,
  period: { year: number; month: number },
): Promise<Gstr1B2cRow[]> {
  const invoices = await prisma.transaction.findMany({
    where: {
      type: 'SALES_INVOICE',
      outletId,
      status: 'POSTED',
      OR: [
        { party: { type: 'CUSTOMER', gstin: null } }, // Unregistered
        { party: null }, // Walk-in / no customer
      ],
    },
    include: { items: true },
  });

  // Group by state + GST rate combination
  const grouped = groupBy(invoices, inv => {
    const state = inv.party?.state || 'XX'; // XX for inter-state / unknown
    const rate = aggregateGstRate(inv.items);
    return `${state}_${rate}`;
  });

  return Object.entries(grouped).map(([key, invs]) => {
    const [state, rate] = key.split('_');
    return {
      state,
      rate,
      taxableValue: invs.reduce((sum, i) => sum + i.totalTaxable, 0),
      igst: invs.reduce((sum, i) => sum + computeIgst(i), 0),
      cgst: invs.reduce((sum, i) => sum + computeCgst(i), 0),
      sgst: invs.reduce((sum, i) => sum + computeSgst(i), 0),
      uqc: 'PCS', // Unit of Quantity Code (hardcoded for simplicity)
    };
  });
}

// Tab 3: HSN Summary (Table 12)
export async function getGstr1HsnSummary(
  outletId: string,
  period: { year: number; month: number },
): Promise<Gstr1HsnRow[]> {
  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: {
        type: 'SALES_INVOICE',
        outletId,
        status: 'POSTED',
        date: { gte: periodStart, lte: periodEnd },
      },
    },
    include: { variant: { include: { product: true } } },
  });

  // Group by HSN + Rate
  const grouped = groupBy(items, i => `${i.variant.product.hsnCode}_${i.variant.product.gstRate}`);

  return Object.entries(grouped).map(([key, items]) => {
    const [hsn] = key.split('_');
    return {
      hsnCode: hsn,
      description: items[0].variant.product.name,
      uom: items[0].variant.product.baseUnit,
      totalQty: items.reduce((sum, i) => sum + i.quantity, 0),
      totalTaxableValue: items.reduce((sum, i) => sum + i.taxableValue, 0),
      igst: items.reduce((sum, i) => sum + (i.igst || 0), 0),
      cgst: items.reduce((sum, i) => sum + (i.cgst || 0), 0),
      sgst: items.reduce((sum, i) => sum + (i.sgst || 0), 0),
    };
  });
}

// Helper: Compute IGST/CGST/SGST from transaction items
function computeIgst(transaction: any): number {
  // IGST applied when place of supply ≠ outlet state
  return transaction.items.reduce((sum, i) => sum + (i.igst || 0), 0);
}

function computeCgst(transaction: any): number {
  return transaction.items.reduce((sum, i) => sum + (i.cgst || 0), 0);
}

function computeSgst(transaction: any): number {
  return transaction.items.reduce((sum, i) => sum + (i.sgst || 0), 0);
}

function aggregateGstRate(items: any[]): number {
  // Return highest GST rate in invoice
  return Math.max(...items.map(i => i.variant.product.gstRate));
}
```

**Export JSON** (for portal upload):
```typescript
export async function exportGstr1Json(data: Gstr1Data): Promise<string> {
  const gstr1 = {
    fp: '122024', // Financial period: MMYYYY
    gstin: 'YOUR_GSTIN',
    b2b: data.b2bInvoices,
    b2c: data.b2cInvoices,
    hsn: data.hsnSummary,
    cdnr: data.creditNotes,
    doc: data.documentSummary,
  };
  return JSON.stringify(gstr1, null, 2);
}
```

#### 2.5.2 GSTR-3B Summary Report

**Route**: `/reports/gst/gstr3b`

**Sections**: Outward supplies + ITC = Net Payable.

```typescript
export async function getGstr3bSummary(
  outletId: string,
  period: { year: number; month: number },
): Promise<Gstr3bData> {
  // Section 3.1: Outward Supplies
  const sales = await getSalesData(outletId, period);
  const outIgst = sales.igstTotal;
  const outCgst = sales.cgstTotal;
  const outSgst = sales.sgstTotal;

  // Section 4: Input Tax Credit
  const purchases = await getPurchaseData(outletId, period);
  const itcIgst = purchases.igstTotal;
  const itcCgst = purchases.cgstTotal;
  const itcSgst = purchases.sgstTotal;

  // Net Payable
  return {
    outwardSupply: {
      totalTaxableValue: sales.totalTaxable,
      outIgst,
      outCgst,
      outSgst,
      totalOutput: outIgst + outCgst + outSgst,
    },
    itc: {
      itcIgst,
      itcCgst,
      itcSgst,
      totalItc: itcIgst + itcCgst + itcSgst,
    },
    netPayable: {
      igst: outIgst - itcIgst,
      cgst: outCgst - itcCgst,
      sgst: outSgst - itcSgst,
      total: (outIgst + outCgst + outSgst) - (itcIgst + itcCgst + itcSgst),
    },
  };
}
```

**Layout**:
```
Output Tax (IGST)     ₹12,000
Output Tax (CGST)      ₹8,400
Output Tax (SGST)      ₹8,400
─────────────────────────────
Total Output          ₹28,800

ITC — IGST            ₹4,000
ITC — CGST            ₹2,800
ITC — SGST            ₹2,800
─────────────────────────────
Total ITC              ₹9,600

Net Payable           ₹19,200
  IGST payable         ₹8,000
  CGST payable         ₹5,600
  SGST payable         ₹5,600
```

#### 2.5.3 ITC Register Report

**Route**: `/reports/gst/itc`

All purchase bills with GST breakdown + eligibility status.

#### 2.5.4 Deliverables Checklist

- [ ] `src/app/dashboard/reports/gst/` (all 3 reports)
- [ ] `src/actions/reports/gst.ts` (complex aggregations)
- [ ] GSTR-1 JSON export schema
- [ ] GSTR-3B calculation logic
- [ ] `src/types/reports/gst.ts` (DTO types matching form structures)

---

### Phase 6: Financial Statements (Week 9–10)

**Complexity**: Very High. Requires General Ledger queries, account groupings, and financial logic.

#### 2.6.1 Trial Balance Report

**Route**: `/reports/finance/trial-balance`

**Filters**: Financial Year | Period | Outlet

**Grouping**: By Account Group (Assets / Liabilities / Income / Expenses).

```typescript
export async function getTrialBalance(
  outletId: string,
  filters: TrialBalanceFilters,
): Promise<TrialBalanceRow[]> {
  const accounts = await prisma.account.findMany({
    where: { outletId },
  });

  const rows: TrialBalanceRow[] = [];
  let totalDebit = 0, totalCredit = 0;

  for (const account of accounts) {
    const [openingDebit, openingCredit] = await getOpeningBalance(
      account.id,
      filters.period.startDate,
    );

    const entries = await prisma.ledgerEntry.findMany({
      where: {
        accountId: account.id,
        date: { gte: filters.period.startDate, lte: filters.period.endDate },
      },
    });

    const periodDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const periodCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    const closingDebit = openingDebit + periodDebit - periodCredit;
    const closingCredit = openingCredit + periodCredit - periodDebit;

    rows.push({
      accountCode: account.code,
      accountName: account.name,
      openingBalance: openingDebit > 0 ? openingDebit : -openingCredit,
      totalDebit: periodDebit,
      totalCredit: periodCredit,
      closingBalance: closingDebit > 0 ? closingDebit : -closingCredit,
    });

    totalDebit += closingDebit;
    totalCredit += closingCredit;
  }

  // Check balance
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    // Error: trial balance does not balance
    console.error('Trial Balance does not balance!');
  }

  return rows;
}
```

#### 2.6.2 Profit & Loss Report

**Route**: `/reports/finance/pl`

**Structure**:
```
INCOME
  Sales              ₹
  Other Income       ₹
─────────────────────────
Total Income         ₹

EXPENSES
  COGS              ₹
  Operating Exp     ₹
─────────────────────────
Total Expenses       ₹

NET PROFIT           ₹ (%)
```

```typescript
export async function getProfitLoss(
  outletId: string,
  filters: PLFilters,
): Promise<PLData> {
  // Get all transactions for the period
  const salesValue = await getTotalSales(outletId, filters.period);
  const purchaseValue = await getTotalPurchases(outletId, filters.period);
  const expenseAccounts = await prisma.account.findMany({
    where: { outletId, group: 'EXPENSE' },
  });

  const expenses = await Promise.all(
    expenseAccounts.map(async acc => ({
      name: acc.name,
      value: await getAccountBalance(acc.id, filters.period),
    }))
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);

  const grossProfit = salesValue - purchaseValue;
  const netProfit = grossProfit - totalExpenses;

  return {
    income: salesValue,
    cogs: purchaseValue,
    grossProfit,
    grossProfitPercent: (grossProfit / salesValue) * 100,
    expenses: totalExpenses,
    netProfit,
    netProfitPercent: (netProfit / salesValue) * 100,
  };
}
```

#### 2.6.3 Balance Sheet Report

**Route**: `/reports/finance/balance-sheet`

**Structure**:
```
ASSETS                              LIABILITIES
  Current Assets                      Current Liabilities
    Cash              ₹                 Payables        ₹
    Debtors           ₹                 GST Payable     ₹
    Inventory         ₹
  ────────────────────            ────────────────────
  Total Assets        ₹            Total Liabilities   ₹

                                  EQUITY
                                    Opening Cap    ₹
                                    P&L            ₹
                                    Drawings       ₹
                                  ────────────────
                                  Total Equity     ₹

TOTAL ASSETS = TOTAL LIABILITIES + EQUITY?
```

#### 2.6.4 Cash Flow Summary Report

**Route**: `/reports/finance/cash-flow`

**Indirect Method**:
```
Operating Activities
  Cash from customers        ₹
  Cash to vendors           -₹
  Cash for expenses         -₹
  ───────────────────────────
  Net Operating CF           ₹

Investing Activities
  (Not typically applicable for trading)

Financing Activities
  Capital introduced         ₹
  Drawings                  -₹
  ───────────────────────────
  Net Financing CF           ₹

NET CHANGE IN CASH            ₹
Opening Cash                  ₹
Closing Cash                  ₹
```

#### 2.6.5 Deliverables Checklist

- [ ] `src/app/dashboard/reports/finance/` (all 4 reports)
- [ ] `src/actions/reports/finance.ts` (GL aggregations & calculations)
- [ ] Opening balance logic
- [ ] Period filtering for GL entries
- [ ] Accuracy validation (TB must balance, Assets = Liabilities + Equity)

---

## 3. Data Access & Role-Based Access Control

**File**: `src/lib/reports/access-control.ts`

```typescript
const REPORT_ACCESS: Record<string, Role[]> = {
  'sales/register': ['ADMIN', 'ACCOUNTANT', 'SALES'],
  'sales/outstanding': ['ADMIN', 'ACCOUNTANT', 'SALES'],
  'sales/items': ['ADMIN', 'ACCOUNTANT', 'SALES', 'INVENTORY_MANAGER'],
  'purchase/register': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'purchase/outstanding': ['ADMIN', 'ACCOUNTANT'],
  'purchase/grn': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'inventory/current-stock': ['ADMIN', 'ACCOUNTANT', 'SALES', 'INVENTORY_MANAGER'],
  'inventory/low-stock': ['ADMIN', 'ACCOUNTANT', 'SALES', 'INVENTORY_MANAGER'],
  'inventory/ledger': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'inventory/valuation': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'inventory/slow-moving': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'gst/gstr1': ['ADMIN', 'ACCOUNTANT'],
  'gst/gstr3b': ['ADMIN', 'ACCOUNTANT'],
  'gst/itc': ['ADMIN', 'ACCOUNTANT'],
  'finance/trial-balance': ['ADMIN', 'ACCOUNTANT'],
  'finance/pl': ['ADMIN', 'ACCOUNTANT'],
  'finance/balance-sheet': ['ADMIN', 'ACCOUNTANT'],
  'finance/cash-flow': ['ADMIN', 'ACCOUNTANT'],
  'cash-memos': ['ADMIN', 'ACCOUNTANT', 'SALES'],
};

export async function checkReportAccess(
  userId: string,
  reportId: string,
): Promise<boolean> {
  const session = await getServerSession();
  if (!session) return false;

  const allowedRoles = REPORT_ACCESS[reportId];
  if (!allowedRoles.includes(session.user.role)) {
    return false;
  }

  // For non-admin users, verify they have access to the requested outlet
  if (session.user.role !== 'ADMIN') {
    const outletId = getOutletIdFromRequest(); // From searchParams
    const hasAccess = await userHasOutletAccess(userId, outletId);
    return hasAccess;
  }

  return true;
}
```

**Middleware**: Apply to every report page.

---

## 4. Performance Optimization

### 4.1 Database Indexes

Add indexes for common report queries:

```prisma
model Transaction {
  // For sales/purchase register queries
  @@index([outletId, type, status, date])
  @@index([outletId, type, date]) // For register reports
}

model TransactionItem {
  @@index([transactionId, variantId])
}

model StockLedger {
  @@index([variantId, warehouseId, date])
}

model LedgerEntry {
  @@index([accountId, date])
  @@index([accountId, date, debit, credit])
}

model Party {
  @@index([outletId, type, state])
}
```

### 4.2 Query Optimization

- Use `select` to fetch only needed columns (avoid `include` when possible)
- Batch queries using `Promise.all()`
- For large result sets, implement pagination (limit to 1000 rows max)
- Cache period-end GL snapshots (Trial Balance, P&L, BS don't change after period close)

### 4.3 Caching Strategy (Optional)

**File**: `src/lib/reports/report-cache.ts`

```typescript
// Cache closed periods (e.g., last 6 months of financial reports)
// Use Redis or in-memory cache
export async function getCachedReport(
  cacheKey: string,
  fetchFn: () => Promise<any>,
  ttl = 3600, // 1 hour
): Promise<any> {
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch fresh data
  const data = await fetchFn();

  // Cache result
  await redis.set(cacheKey, JSON.stringify(data), 'EX', ttl);

  return data;
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

**File**: `src/actions/reports/__tests__/sales.test.ts`

```typescript
describe('getSalesRegister', () => {
  it('should sum invoice amounts correctly', async () => {
    const result = await getSalesRegister(outletId, filters);
    const totalFromData = result.reduce((sum, row) => sum + row.grandTotal, 0);
    expect(totalFromData).toBeGreaterThan(0);
  });

  it('should filter by date range', async () => {
    const result = await getSalesRegister(outletId, {
      ...filters,
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-01-31'),
    });
    result.forEach(row => {
      expect(row.date).toBeGreaterThanOrEqual(filters.dateFrom);
      expect(row.date).toBeLessThanOrEqual(filters.dateTo);
    });
  });
});
```

### 5.2 Integration Tests

- Verify exports match source data
- Validate GST calculations (ITC reconciliation)
- Trial Balance equilibrium test

### 5.3 User Acceptance Testing

- Test each report with sample data covering edge cases
- Verify print layout (A4 fit, no orphaned rows)
- Export and validate in Excel

---

## 6. Rollout & Migration

### 6.1 Data Validation Before Launch

```typescript
// Pre-launch checks
async function validateReportData(outletId: string) {
  const checks = [
    await validateTrialBalance(outletId), // TB must balance
    await validateSalesGst(outletId), // GST calc accuracy
    await validateGrnBillMatch(outletId), // GRN ↔ Bill reconciliation
    await validateStockMovements(outletId), // Stock ledger balance
  ];

  return checks.every(c => c.passed);
}
```

### 6.2 Phased Rollout

1. **Week 1**: Enable for ADMIN & ACCOUNTANT only
2. **Week 2**: Add SALES & INVENTORY_MANAGER (with restricted reports)
3. **Week 3**: Full public release

---

## 7. Success Metrics

- ✅ All 18 reports functional & tested
- ✅ <2 second load time (even with 2+ years of data)
- ✅ 100% role-based access enforcement
- ✅ Excel exports match displayed data (no rounding errors)
- ✅ Trial Balance always balances
- ✅ P&L net profit reconciles with GL retained earnings
- ✅ No security vulnerabilities (access control bypass tests passed)
- ✅ User feedback: "This is exactly what we need for compliance"

---

## 8. Implementation Checklist

### Phase 1: Foundation
- [ ] Report shell component
- [ ] Date range picker
- [ ] Outlet selector
- [ ] Export utilities
- [ ] Print CSS
- [ ] Types & i18n

### Phase 2: Inventory
- [ ] Current Stock
- [ ] Low Stock Alert
- [ ] Stock Ledger
- [ ] Stock Valuation
- [ ] Slow-Moving Stock

### Phase 3: Sales & Purchase
- [ ] Sales Register
- [ ] Item-wise Sales
- [ ] Purchase Register
- [ ] GRN Summary
- [ ] Cash Memo Report

### Phase 4: Outstanding
- [ ] Customer Outstanding (with ageing)
- [ ] Vendor Outstanding

### Phase 5: GST
- [ ] GSTR-1 (all tabs + JSON export)
- [ ] GSTR-3B Summary
- [ ] ITC Register

### Phase 6: Financial
- [ ] Trial Balance
- [ ] P&L
- [ ] Balance Sheet
- [ ] Cash Flow Summary

### Cross-Phase
- [ ] Database indexes (all phases)
- [ ] Role-based access control enforcement
- [ ] Integration tests
- [ ] Performance profiling & optimization
- [ ] User acceptance testing
- [ ] Documentation & training materials

---

## 9. File Structure Summary

```
src/
├── app/dashboard/reports/
│   ├── page.tsx (Reports home)
│   ├── layout.tsx (Sidebar navigation)
│   ├── sales/ (3 reports)
│   ├── purchase/ (3 reports)
│   ├── inventory/ (5 reports)
│   ├── gst/ (3 reports)
│   ├── finance/ (4 reports)
│   └── cash-memos/
│
├── components/reports/
│   ├── common/
│   │   ├── report-shell.tsx
│   │   ├── filter-bar.tsx
│   │   ├── date-range-picker.tsx
│   │   ├── outlet-selector.tsx
│   │   ├── report-table.tsx
│   │   ├── export-button.tsx
│   │   └── print-button.tsx
│   └── filters/
│
├── actions/reports/
│   ├── sales.ts
│   ├── purchase.ts
│   ├── inventory.ts
│   ├── gst.ts
│   └── finance.ts
│
├── lib/reports/
│   ├── date-utils.ts
│   ├── export.ts
│   ├── access-control.ts
│   └── aggregations.ts
│
├── types/reports/
│   ├── common.ts
│   ├── sales.ts
│   ├── purchase.ts
│   ├── inventory.ts
│   ├── gst.ts
│   └── finance.ts
│
└── messages/en/
    └── reports.json

Total: ~45 files (pages + clients + actions + types)
LOC estimate: ~15,000–20,000 lines
Timeline: 10 weeks (with 1 developer)
```

---

**This plan is ready for implementation. Start with Phase 1 foundation to establish the reusable infrastructure, then parallelize Phases 2–4 across team members if available.**
