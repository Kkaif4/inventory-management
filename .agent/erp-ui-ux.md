
# ERP Admin Dashboard — UI/UX Build Prompt

**Industrial Equipment & Hardware Inventory System**
Version 2.0 | Aligned to BRD v1.2

---

## 1. Project Context

Build a production-grade ERP Admin Dashboard for an Industrial Equipment & Hardware business operating across multiple outlets and warehouses in India. The system handles:

- Multi-outlet / multi-warehouse inventory operations
- GST-compliant billing (auto CGST+SGST vs IGST detection)
- Full purchase workflow: Purchase Order → GRN → Purchase Bill → Payment
- Sales invoicing with payment allocation (FIFO / manual)
- Tally-like double-entry accounting
- Role-based user access per outlet

**Stack:** Next.js App Router · React · TailwindCSS · React Query (TanStack)
**Scope:** Frontend UI, UX, and API integration only. Backend APIs and database are pre-existing.
**Architecture:** Component-driven. Every screen is assembled from a shared component library. No one-off components.

---

## 2. Design System

### 2.1 Philosophy

> Industrial precision. Utilitarian but refined. Data-dense without feeling crowded. Every pixel justifies its existence.

Reference aesthetic: **Linear + Stripe + Raycast** — crisp type, tight spacing, purposeful color, zero decoration.

- No gradient backgrounds, no hero illustrations, no rounded-everything
- Color is reserved for status, action, and hierarchy — not decoration
- Whitespace is used deliberately to group, not to fill
- Tables are the primary UI primitive — they must be fast, filterable, and keyboard-friendly

### 2.2 Design Tokens

Define in `tailwind.config.ts` and as CSS custom properties. Never hardcode values in components.

```ts
// tailwind.config.ts — extend theme
colors: {
  brand: {
    DEFAULT: '#1a56db',
    hover:   '#1e429f',
    light:   '#ebf5ff',
    muted:   '#dbeafe',
  },
  surface: {
    base:     '#ffffff',
    muted:    '#f9fafb',
    elevated: '#f3f4f6',
    overlay:  '#111827cc',   // modal backdrop
  },
  border: {
    DEFAULT: '#e5e7eb',
    strong:  '#d1d5db',
    focus:   '#1a56db',
  },
  text: {
    primary:   '#111827',
    secondary: '#374151',
    muted:     '#6b7280',
    disabled:  '#9ca3af',
    inverse:   '#ffffff',
  },
  status: {
    draft:      { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
    pending:    { bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
    approved:   { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    received:   { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    partial:    { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
    completed:  { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
    cancelled:  { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    overdue:    { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
    intransit:  { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  }
}

spacing: {
  // Base unit: 4px
  px: '1px', 0.5: '2px', 1: '4px', 2: '8px', 3: '12px',
  4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px',
  12: '48px', 16: '64px',
}

fontSize: {
  '2xs': ['11px', '16px'],
  xs:    ['12px', '16px'],
  sm:    ['13px', '20px'],
  base:  ['14px', '22px'],
  md:    ['16px', '24px'],
  lg:    ['18px', '28px'],
  xl:    ['24px', '32px'],
  '2xl': ['32px', '40px'],
}

borderRadius: {
  sm: '4px', DEFAULT: '6px', md: '6px', lg: '8px', xl: '12px', full: '9999px',
}

boxShadow: {
  card:    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  modal:   '0 20px 60px rgba(0,0,0,0.18)',
  popover: '0 4px 16px rgba(0,0,0,0.12)',
  focus:   '0 0 0 2px #1a56db',
}

fontFamily: {
  sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
  mono: ['"IBM Plex Mono"', 'monospace'],
}
```

### 2.3 Core UI Rules

1. **All interactive elements** have a visible 2px blue focus ring — never remove outlines
2. **Primary button:** solid brand blue, white text, hover darkens
3. **Secondary button:** white bg, border-default, text-secondary
4. **Ghost button:** no border, text-secondary, hover shows surface-elevated bg
5. **Destructive button:** `#dc2626` red — only used in ConfirmDialog or for delete actions
6. **Disabled state:** `text-disabled`, `bg-surface-elevated`, `cursor-not-allowed`
7. **Form fields:** `border-default`, `bg-white`, `placeholder: text-muted` — on focus: `border-focus + ring-2`
8. **Links:** brand blue, underline on hover, never use color alone as the link indicator

---

## 3. Application Layout

### 3.1 Shell Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  TopNavbar  h-14  sticky top-0 z-40  bg-white border-b               │
├─────────────┬────────────────────────────────────────────────────────┤
│             │                                                        │
│  Sidebar    │  <Outlet>  (scrollable page content)                   │
│  w-60       │                                                        │
│  fixed      │  PageHeader  (title + breadcrumbs + actions)           │
│  h-full     │  ──────────────────────────────────────────────────    │
│  overflow-y │  Page Body                                             │
│  -auto      │                                                        │
│             │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
                                         Toast Stack (fixed bottom-right)
```

- Sidebar collapses to `w-16` (icon-only) via a toggle button at the bottom of the sidebar
- Collapsed state persists in `localStorage`
- Content area: `ml-60` (or `ml-16` when collapsed), `min-h-screen bg-surface-muted`
- Inner content max-width: `max-w-screen-2xl mx-auto px-6 py-6`
- Sidebar and TopNavbar are `bg-white` — not dark, not colored

### 3.2 TopNavbar Content

```
[≡ toggle]  [Logo]  [spacer flex-1]  [OutletSwitcher]  [Notifications 🔔]  [UserMenu]
```

**OutletSwitcher** — always visible, never hidden:

- Dropdown button showing current outlet name + a small outlet icon
- Dropdown lists all outlets the current user can access (from session)
- "All Outlets" option only visible to Admin role
- Selecting an outlet: invalidates all React Query cache, reloads current page data, persists in session
- Switching with unsaved form data triggers a ConfirmDialog: "You have unsaved changes. Switch outlet and lose changes, or stay?"
- Outlet badge color: each outlet has a configurable accent color for quick visual identification

**UserMenu** dropdown: Profile · Change Password · divider · Sign Out

### 3.3 Sidebar Nav Groups

```
──── OVERVIEW
     Dashboard              /

──── PRODUCTS & STOCK
     Products               /products
     Inventory              /inventory

──── PROCUREMENT
     Purchase Orders        /purchase/orders
     Goods Receipts         /purchase/grn
     Purchase Bills         /purchase/bills

──── SALES
     Sales Invoices         /sales/invoices
     Quotations             /sales/quotations
     Delivery Challans      /sales/challans

──── PARTIES
     Vendors                /vendors
     Customers              /customers

──── FINANCE
     Payments Received      /payments/received
     Payments Made          /payments/made
     Accounts Ledger        /accounts

──── REPORTS
     Stock Reports          /reports/stock
     Sales Reports          /reports/sales
     Purchase Reports       /reports/purchase
     GST Reports            /reports/gst
     P&L / Balance Sheet    /reports/finance

──── ADMIN
     Outlets & Warehouses   /admin/outlets
     Users & Roles          /admin/users
     Settings               /settings
```

Active state: `bg-brand-light text-brand font-medium border-l-2 border-brand`
Inactive state: `text-text-secondary hover:bg-surface-elevated hover:text-text-primary`

### 3.4 PageHeader Component

Every page starts with PageHeader — no exceptions.

```tsx
<PageHeader
  title="Purchase Orders"
  subtitle="Manage supplier orders for Main Godown"
  breadcrumbs={[
    { label: "Procurement" },
    { label: "Purchase Orders", href: "/purchase/orders" }
  ]}
  actions={[
    { label: "Export", variant: "ghost", icon: DownloadIcon },
    { label: "New Purchase Order", variant: "primary", icon: PlusIcon,
      onClick: () => router.push('/purchase/orders/new') }
  ]}
/>
```

Layout: breadcrumbs row (text-xs text-muted), then title (text-xl font-semibold text-primary) + subtitle (text-sm text-muted), actions float right on the same row as the title.
Bottom: a 1px `border-b border-default` separating the header from the content below.

---

## 4. Component Library

Build every component in `src/components/ui/` before building any pages. Pages import from this library only.

---

### 4.1 Form Components

All form components share these base props:

```ts
interface BaseFieldProps {
  label?: string
  hint?: string          // helper text below field
  error?: string         // error text below field — replaces hint when present
  required?: boolean     // shows red asterisk after label
  disabled?: boolean
  className?: string
}
```

**TextInput**
Standard text field. Variants: `default` / `filled`. Always show character count if `maxLength` is set.

**NumberInput**
Numeric field with `min`, `max`, `step`. Optional `prefix` (shows inside left of field, e.g. "₹") and `suffix` (shows inside right, e.g. "Pcs"). Prevents non-numeric keystrokes.

**CurrencyInput**
Extends NumberInput. Prefix = "₹". Formats display with Indian number system (lakhs/crores). Stores raw number in state, formats on blur, unformats on focus.

**PercentInput**
Extends NumberInput. Suffix = "%". `min=0`, `max=100`.

**SelectDropdown**
Styled `<select>` replacement. Supports `grouped` option lists. Built-in filter input appears when option count > 8. Keyboard navigable.

**SearchSelect (async)**
Typeahead component for searching large datasets via API. Critical component — used extensively.

```tsx
<SearchSelect
  label="Product / SKU"
  placeholder="Search by name or SKU..."
  fetchOptions={(query) => api.get(`/products/search?q=${query}`)}
  getOptionLabel={(item) => item.name}
  getOptionValue={(item) => item.id}
  renderOption={(item) => (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="font-medium text-sm">{item.name}</span>
        <span className="text-xs text-muted ml-2">{item.sku}</span>
      </div>
      <QuantityDisplay qty={item.stock} unit={item.baseUnit} />
    </div>
  )}
  debounceMs={300}
/>
```

- Shows LoadingSpinner inside dropdown during fetch
- Shows "No results" state with clear search action
- Keyboard: Arrow up/down to navigate, Enter to select, Escape to close

**DatePicker**
Calendar popover on click. Format: DD/MM/YYYY (Indian standard). Supports `minDate`, `maxDate`. Range variant for report filters.

**DateRangePicker**
Two-calendar popover. Used in all report filter bars. Quick presets: Today / This Week / This Month / This Quarter / This FY / Custom.

**ToggleSwitch**
Boolean toggle. Label appears to the right. Optional `description` appears below label in text-muted.

**FormSection**
Groups related fields with a section title and divider.

```tsx
<FormSection title="Tax & Compliance" description="HSN code determines the applicable GST rate.">
  <FormGrid cols={3}>
    <HSNCodeInput />
    <GSTRateSelect />
  </FormGrid>
</FormSection>
```

**FormGrid**
Responsive grid: `cols={1|2|3|4}`. Gap: `gap-4`. On mobile collapses to 1 column.

**GSTRateSelect**
A specialized SelectDropdown. Options are strictly: `0% · 0.25% · 3% · 5% · 12% · 18% · 28%`. No free-text. Shows a tooltip icon with: "GST rate is determined by the product's HSN code." Never allow entering a custom rate.

**HSNCodeInput**
TextInput with async HSN validation.

- On blur: calls `/api/hsn-lookup?code={val}`
- On success: auto-fills GSTRateSelect and shows a green badge: `✓ HSN valid — 18% GST`
- On failure: shows inline error: `"HSN not found. Verify the code and try again."`

**UnitConversionFields**
A compound field group for product unit setup:

```
Base Unit      [Piece ▾]
Purchase Unit  [Box ▾]
Sales Unit     [Piece ▾]
Conversion     1  [Box ▾]  =  [10]  [Piece ▾]
               └── Live preview: "Purchasing 5 Box adds 50 Piece to stock"
```

Live preview updates as values change.

**MarkupPricingField**
Toggleable pricing method per product variant:

```
Selling Price Method   [○ Manual  ● Markup %]

When Manual:    Selling Price  [₹ ______]

When Markup:    Markup %       [_____%]
                               Purchase Price ₹850 + 20% = ₹1,020
                               ⚠ Auto-updates when purchase price changes
```

---

### 4.2 Table Components

**DataTable**

The most-used component in the system. Must be fast, consistent, and composable.

```tsx
<DataTable
  columns={columns}              // ColumnDef[]
  data={rows}                    // T[]
  loading={isLoading}            // shows SkeletonLoader
  emptyState={<EmptyState />}    // shown when data is empty
  selectable                     // enables checkbox column
  stickyHeader                   // header stays on scroll
  onRowClick={(row) => ...}      // optional
  rowClassName={(row) => ...}    // conditional row styling
/>
```

Column definition type:

```ts
interface ColumnDef<T> {
  key: keyof T | string
  label: string
  width?: number | string       // fixed or min-width
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
  sticky?: 'left' | 'right'    // for action columns
}
```

Column widths: action columns are always sticky right. First column (name/number) is sticky left on wide tables.

**TableToolbar**

Sits directly above every DataTable. Never skip it.

```
Row 1: [🔍 Search...________________] [Filter ▾] [Columns ▾]  flex-1  [Export ▾] [Bulk Actions ▾]
                                                               right:  "Showing 124 results"
Row 2 (conditional): [Active filter chips × ] [× Clear all filters]
```

- Search is always present and auto-focused on `Ctrl+F` / `Cmd+F`
- Filter panel opens as a popover below the Filter button
- Active filters shown as small chips with × to remove individually
- Bulk Actions button only appears when rows are selected; shows count badge

**ColumnFilter**

Popover panel opened from TableToolbar. Each column that supports filtering shows a filter control:

- Text columns: text input
- Status columns: checkbox list of all status values
- Date columns: date range picker
- Number/amount columns: min/max range inputs

Multiple filters combine with AND logic. Panel has "Apply" and "Reset" buttons.

**Pagination**

```
[< Prev]  [1] [2] [3] ... [12]  [Next >]     Page size: [25 ▾]
Showing 26–50 of 301 results
```

- Page jump: clicking the current page number opens an input
- Page sizes: 10 / 25 / 50 / 100

**RowActions**

Three-dot menu (vertical ellipsis) on the right of each row. Never show more than 6 items.

```tsx
<RowActions items={[
  { label: 'View',      icon: EyeIcon,    onClick: () => ... },
  { label: 'Edit',      icon: PencilIcon, onClick: () => ... },
  { label: 'Duplicate', icon: CopyIcon,   onClick: () => ... },
  { type: 'separator' },
  { label: 'Cancel',    icon: XIcon,      onClick: () => ..., variant: 'danger' },
]} />
```

Keyboard: opens on Enter/Space when focused, navigable with arrow keys, Escape closes.

**StatusBadge**

Pill badge. Never use just color — always include the status label text.

```tsx
<StatusBadge status="partially_received" />
// → renders: amber pill "Partially Received"
```

Status → color mapping (use `status` token from design system):

| Status             | Color      |
| ------------------ | ---------- |
| draft              | gray       |
| pending            | yellow     |
| sent               | blue       |
| approved           | blue       |
| partially_received | orange     |
| received           | teal       |
| posted             | indigo     |
| completed          | green      |
| paid               | green      |
| cancelled          | red        |
| overdue            | orange-red |
| in_transit         | purple     |
| write_off          | gray       |

---

### 4.3 Modal & Drawer Components

**Modal**

Centered overlay dialog. Always uses a backdrop (semi-transparent dark). Sizes:

- `sm`: max-w-md (for confirms, alerts)
- `md`: max-w-lg (default — short forms)
- `lg`: max-w-2xl (medium forms)
- `xl`: max-w-4xl (complex forms, document views)

Structure:

```
┌──────────────────────────────────┐
│ Title                     [× ] │
├──────────────────────────────────┤
│                                  │
│  Scrollable body                 │
│                                  │
├──────────────────────────────────┤
│ [Secondary]          [Primary]   │
└──────────────────────────────────┘
```

- ESC closes (unless `preventClose` is set)
- Focus trap: Tab cycles inside modal only
- Footer is sticky — never hidden by content overflow
- Body scrolls independently

**ConfirmDialog**

Extends Modal (`sm` size). Used for all destructive or irreversible actions.

```tsx
<ConfirmDialog
  title="Cancel Purchase Order?"
  description="PO-0045 will be marked as cancelled. This cannot be undone."
  confirmLabel="Yes, Cancel PO"
  confirmVariant="danger"
  onConfirm={handleCancel}
/>
```

Icon: warning triangle for caution, red circle-X for destructive.

**SlideOverDrawer**

Right-side panel that slides in over the page without replacing it. Widths:

- `md`: 480px — quick edit forms (vendor, customer)
- `lg`: 640px — product form, stock adjustment
- `xl`: 800px — invoice detail, purchase bill, payment allocation

```
┌──── SlideOverDrawer ────────────────────┐
│ [← Back / ×]  Title           [Action] │
├─────────────────────────────────────────┤
│                                         │
│  Scrollable content                     │
│                                         │
├─────────────────────────────────────────┤
│  [Secondary]              [Primary]     │
└─────────────────────────────────────────┘
```

- Can stack: a drawer can open another drawer (e.g. Invoice → Payment → Allocate)
- URL does not change when a drawer opens (use query param `?drawer=payment&id=X`)
- Clicking backdrop closes (unless dirty form)

---

### 4.4 Feedback Components

**ToastNotification**

Fixed stack, bottom-right, `z-50`. Max 4 visible. Types:

```
✓  PO-0045 created successfully.                [View]   ×     ← success (green)
!  Failed to save: HSN code is required.                  ×     ← error (red, no auto-dismiss)
⚠  Stock below minimum for 3 items.             [View]   ×     ← warning (amber)
ℹ  Transfer IN-0012 is in transit.                        ×     ← info (blue)
```

- Success: auto-dismiss after 4 seconds
- Error: stays until manually dismissed
- Warning/Info: auto-dismiss after 6 seconds
- Show a thin progress bar at the bottom of the toast counting down to dismissal

**LoadingSpinner**

Sizes: `xs` 12px / `sm` 16px / `md` 24px / `lg` 40px / `xl` 64px.
Use `sm` inside buttons (replacing button text during submit), `md` inline in dropdowns, `lg` for page-level loads.

**SkeletonLoader**

Each page/table must have a matching skeleton that mirrors the real layout exactly. A skeleton table row is the same height as a real row.

```tsx
// Table skeleton
<SkeletonTable rows={10} columns={6} />

// Card skeleton
<SkeletonCard lines={3} />

// Form skeleton
<SkeletonForm sections={2} fieldsPerSection={4} />
```

Skeleton animation: subtle left-to-right shimmer `animate-pulse` or shimmer gradient.

**EmptyState**

Three variants:

1. **No data:** Used when a list has zero records.

```
[Icon — appropriate to module]
No Purchase Orders yet
Start your procurement workflow by creating your first PO.
[+ New Purchase Order]
```

2. **No search results:**

```
[Search icon]
No results for "bosch drill"
Try different keywords or remove filters.
[Clear search]  [Clear all filters]
```

3. **No access:**

```
[Lock icon]
You don't have access to this section.
Contact your Admin to request access.
```

---

### 4.5 Utility Components

**CurrencyDisplay**

```tsx
<CurrencyDisplay amount={125000} />    // → ₹1,25,000.00
<CurrencyDisplay amount={-5000} />     // → ₹-5,000.00  (red text)
<CurrencyDisplay amount={0} size="sm" /> // → ₹0.00
```

Always uses Indian number format (lakh system). Negative values are red. `size` accepts `sm|md|lg`.

**QuantityDisplay**

```tsx
<QuantityDisplay qty={50} unit="Pcs" minStock={10} />
// → "50 Pcs" in green (above min)
// → "8 Pcs" in orange (at/near min — within 20%)
// → "0 Pcs" in red (out of stock)
```

Shows both quantity and unit always. Color indicates stock health.

**OutletBadge**

```tsx
<OutletBadge outlet={{ name: "Main Shop", color: "#1a56db" }} />
// → Small colored pill with outlet name
```

Used in all cross-outlet tables (admin consolidated view).

**WorkflowProgress**
Critical component. Shown on all purchase and sales documents to indicate stage.

```tsx
<WorkflowProgress
  steps={[
    { label: "PO Created",  date: "12 Jan", status: "complete" },
    { label: "GRN Done",    date: "14 Jan", status: "complete" },
    { label: "Bill Posted", date: null,     status: "current"  },
    { label: "Paid",        date: null,     status: "upcoming" },
  ]}
/>
```

Renders as a horizontal stepper with connecting lines:

```
● PO Created ── ● GRN Done ── ◉ Bill Posted ── ○ Paid
  12 Jan          14 Jan         (current)
```

Complete = filled blue circle. Current = filled blue with pulse ring. Upcoming = empty circle.

**GSTTypeIndicator**

```tsx
<GSTTypeIndicator sellerState="Maharashtra" buyerState="Gujarat" rate={18} />
// → [IGST 18% — Inter-state]  (blue pill)

<GSTTypeIndicator sellerState="Maharashtra" buyerState="Maharashtra" rate={18} />
// → [CGST 9% + SGST 9% — Intra-state]  (teal pill)
```

Read-only. Never a user input. Auto-computed from states. Show on every invoice and purchase form near the tax summary.

**HSNBadge**
Small badge showing HSN code + resolved GST rate:

```
[8467 · 18%]
```

Green border if validated, yellow if unvalidated, red if invalid.

**Avatar**
Initials-based. Shows user's name initials in a colored circle. Color derived from name hash (consistent per user). Tooltip shows full name on hover. Sizes: `sm` 24px / `md` 32px / `lg` 40px.

**Tooltip**
Accessible popover on hover/focus. Positions: top/bottom/left/right (auto-flips at viewport edges). Max width 240px. Used for: truncated text, icon-only buttons, HSN explanations, unit conversions.

**Breadcrumbs**

```tsx
<Breadcrumbs items={[
  { label: "Procurement", href: "/purchase" },
  { label: "Purchase Orders", href: "/purchase/orders" },
  { label: "PO-0045" }  // last item — no href, shown as current
]} />
```

---

## 5. Page Specifications

### 5.1 Dashboard

**Layout:** Responsive grid. 4 KPI cards full-width → 2-col main + 1-col sidebar.

**KPI Cards (4 across):**
Each card: icon · label · primary number · secondary context

| Card                    | Primary           | Secondary                 |
| ----------------------- | ----------------- | ------------------------- |
| Today's Sales           | ₹ total          | N invoices                |
| Open POs                | Count             | ₹ total value            |
| Low Stock Items         | Count (red if >0) | Click → Low Stock report |
| Outstanding Receivables | ₹ total          | Click → Customer ledger  |

KPI cards are clickable — they navigate to the relevant filtered list.

**Main content (left 2/3):**

- **Recent Invoices** — mini table: Invoice #, Customer, Amount, Status, Date. Last 8. "View all →" link.
- **Pending Actions** — vertically stacked list of items requiring attention:
  - GRNs awaiting bill entry (N items)
  - Overdue vendor payments (N, ₹ total)
  - POs with no GRN after expected delivery date
  - Stock below minimum (N items)

**Right sidebar (1/3):**

- **Stock Alerts** — items below min stock, grouped by outlet. Shows item name + current qty (red) + min qty.
- **Outlet Context Note** — if user is in "All Outlets" mode, show a banner: "Viewing consolidated data across all outlets."

---

### 5.2 Products Module

#### Product List Page

**TableToolbar filters:**

- Search: product name or any variant SKU (full-text, instant)
- Filter by: Category (3-level hierarchical), Brand (multi-select), GST Rate, Status (Active/Inactive)
- Sort: Name (default A-Z), Category, Brand, Last Updated, Variant Count

**Table columns:**

| Column       | Width | Notes                             |
| ------------ | ----- | --------------------------------- |
| Product Name | flex  | Primary — bold, links to detail  |
| Category     | 160   | Shows full path (Cat > Sub > Sub) |
| Brand        | 120   |                                   |
| HSN Code     | 100   | With HSNBadge                     |
| GST %        | 80    | Centered                          |
| Variants     | 80    | Count — click expands            |
| Status       | 100   | StatusBadge                       |
| Actions      | 60    | RowActions (sticky right)         |

**Inline row expansion:** clicking anywhere on a row (except Actions) expands an inline sub-row showing all variants:

```
▾ [Product row]
  ┌── Variant Table ─────────────────────────────────────────────────────┐
  │  SKU     │ Specification │ Purchase Price │ Selling Price │ Stock    │
  │  DRL-001 │ 500W          │ ₹850           │ ₹1,020 (20%) │ 48 Pcs  │
  │  DRL-002 │ 750W          │ ₹1,100         │ ₹1,320 (20%) │ 12 Pcs  │
  └──────────────────────────────────────────────────────────────────────┘
  [+ Add Variant]
```

Stock column in variant table uses QuantityDisplay (green/orange/red).

---

#### Product Create / Edit Form

**Route:** `/products/new` and `/products/[id]/edit`
**Layout:** Single column with `max-w-3xl`, sticky footer.

```
PageHeader: "New Product" / "Edit Product"

FormSection: Basic Information
  FormGrid cols=2:
    TextInput: Product Name *
    SelectDropdown: Brand (with "+ Add New Brand" inline option)
  FormGrid cols=3:
    SelectDropdown: Category (Level 1) *
    SelectDropdown: Subcategory (Level 2) — enabled after L1 selected
    SelectDropdown: Sub-subcategory (Level 3) — enabled after L2 selected
  FormGrid cols=2:
    ToggleSwitch: Active / Inactive

FormSection: Tax & Compliance
  FormGrid cols=2:
    HSNCodeInput *        ← auto-lookup on blur
    GSTRateSelect *       ← auto-filled from HSN lookup

FormSection: Units of Measure
  UnitConversionFields   ← compound component (see 4.1)

FormSection: Variants
  [Variant rows table — see below]
  [+ Add Variant] button

Sticky Footer:
  [Cancel]  [Save Draft]  [Save & Activate]
```

**Variants section:**

Each variant is a row in an editable table:

| Field                | Type               | Notes                               |
| -------------------- | ------------------ | ----------------------------------- |
| SKU Code             | TextInput          | Auto-generated suggestion, editable |
| Specification        | TextInput          | e.g. "500W", "3/4 inch", "Model XR" |
| Purchase Price       | CurrencyInput      |                                     |
| Selling Price Method | MarkupPricingField | Toggle: Manual / Markup %           |
| Min Stock Level      | NumberInput        | Per-variant threshold               |
| [×]                 | Button             | Remove variant (disabled if only 1) |

Minimum 1 variant always. If a product has only 1 variant, the "specification" field can be blank.

---

### 5.3 Inventory Module

#### Current Stock Table

**Most-used screen for inventory manager role.**

**Above-table context bar (prominent, not inside filter popover):**

```
Location:  [All Warehouses ▾]     Stock Status: [All ▾]
```

Location and status selectors are always visible — not buried in a filter panel.

**TableToolbar search:** by SKU or product name

**Table columns:**

| Column        | Notes                             |
| ------------- | --------------------------------- |
| SKU           | Monospace font                    |
| Product Name  | Links to product detail           |
| Category      |                                   |
| Warehouse     | OutletBadge if all-outlet view    |
| Qty on Hand   | QuantityDisplay (color-coded)     |
| Unit          | Base unit                         |
| Min Stock     | Plain number                      |
| Last Movement | Relative time ("3 days ago")      |
| Actions       | View Ledger · Adjust · Transfer |

**Row actions:** View Stock Ledger (SlideOverDrawer lg), Adjust Stock (SlideOverDrawer md), Transfer Stock (SlideOverDrawer lg).

---

#### Stock Ledger View (SlideOverDrawer lg)

Opened from Current Stock row → "View Ledger":

```
Header: "Stock Ledger — Drill Bit Set 500W"
         DRL-001 · Main Godown

Filters: [Date Range ▾]  [Movement Type ▾]

Table:
  Date       │ Type         │ Ref No.    │ In  │ Out │ Balance │ Notes
  15 Jan      Purchase       PO-0045      +50       50
  18 Jan      Sales          INV-0102          -5   45
  20 Jan      Transfer Out   TRF-0012          -10  35   → Branch Godown
  22 Jan      Adjustment     ADJ-0003     +5        40   Received missing items

Running balance shown in every row. Color: green for In, red for Out.
```

---

#### Stock Transfer Screen

**Route:** `/inventory/transfers/new`
**Layout:** Single column, max-w-2xl.

```
PageHeader: "New Stock Transfer"

FormSection: Transfer Details
  FormGrid cols=2:
    DatePicker: Transfer Date *
    TextInput: Reference / Note
  FormGrid cols=2:
    SelectDropdown: From Location (Warehouse / Outlet) *
    SelectDropdown: To Location * — same options, cannot equal From

FormSection: Items to Transfer
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Product / SKU      │  Available     │  Transfer Qty  │  Unit  │  × │
  │  [SearchSelect]     │  50 Pcs        │  [_____]       │  Pcs   │  × │
  └──────────────────────────────────────────────────────────────────────┘
  [+ Add Item]

  Validation inline:
  ⚠ Transfer qty (60) exceeds available stock (50). Reduce or check location.

Sticky Footer:
  [Cancel]  [Save as Draft]  [Submit Transfer]
```

On submit: ConfirmDialog shows summary ("Transferring 50 Pcs Drill Bit 500W from Main Godown to Branch Godown"). On confirm: items show as "In Transit" in Current Stock until GRN at destination confirms receipt.

**In-transit flow:**

- Transfer creates a pending transfer record
- Destination warehouse manager sees it in a "Incoming Transfers" panel in Inventory
- They confirm receipt item-by-item: quantities may differ (partial receipt allowed)
- On confirmation: stock appears at destination, removed from in-transit

---

#### Stock Adjustment Screen

**Route:** `/inventory/adjustments/new`
**Layout:** Single column, max-w-2xl.

```
FormSection: Adjustment Details
  FormGrid cols=3:
    DatePicker: Date *
    SelectDropdown: Warehouse *
    SelectDropdown: Adjustment Type * [Increase / Decrease / Write-Off / Opening Stock]

  TextInput: Reference Number
  TextInput: Reason * (required — logged in audit trail)

FormSection: Items
  [Same line-item table as Transfer, with Current Stock shown per item]

  For Write-Off type only, additional column:
  Write-Off Reason: [Damaged / Expired / Lost / Theft / Other ▾]

Authorization Note (shown if qty change > threshold):
  ⚠ Adjustments above ₹10,000 value require Admin approval.
  This adjustment (₹14,500) will be submitted for approval.

Sticky Footer:
  [Cancel]  [Submit Adjustment]
```

---

### 5.4 Purchase Workflow

All purchase documents show WorkflowProgress at the top of their detail view. Stage gates are enforced: a button for the next stage only appears when the current stage is complete.

#### Purchase Order List

**Route:** `/purchase/orders`

**Filters:** Status (multi-select), Vendor (SearchSelect), Warehouse, Date range, Amount range.

**Table columns:**

| Column              | Notes                      |
| ------------------- | -------------------------- |
| PO Number           | Monospace, links to detail |
| Date                | DD/MM/YYYY                 |
| Vendor              |                            |
| Receiving Warehouse |                            |
| Items               | Count                      |
| Total Value         | CurrencyDisplay            |
| Status              | StatusBadge                |
| Actions             |                            |

**RowActions per status:**

- Draft: Edit, Submit, Cancel
- Sent: Create GRN, Cancel
- Partially Received: Create GRN (another one), View GRNs, Cancel
- Received: Create Bill, View GRNs
- Closed: View only

**Stage gate:** "Create Bill" button in row actions only appears when status = Received. If clicked while status = Sent, show disabled tooltip: "Complete goods receipt first."

---

#### Create Purchase Order

**Route:** `/purchase/orders/new`
**Layout:** Single column, max-w-4xl, sticky footer.

```
PageHeader: "New Purchase Order"

FormSection: Order Details
  FormGrid cols=3:
    TextInput: PO Number (auto-generated, editable prefix)
    DatePicker: Date *
    DatePicker: Expected Delivery Date
  FormGrid cols=2:
    SearchSelect: Vendor * (async search)
    SelectDropdown: Receiving Warehouse *
  TextArea: Notes (optional)

  GSTTypeIndicator (auto — shows after vendor selected)

FormSection: Line Items
  Line items table:
  ┌────────────────────────────────────────────────────────────────────────────────┐
  │  Product/SKU   │ HSN  │ Pur. Unit │  Qty  │  Rate ₹  │  Disc%  │  GST%  │  Amt  │ × │
  │  [SearchSelect]│[auto]│  [auto]   │[____] │  [_____] │  [___]  │ [auto] │[calc] │ × │
  └────────────────────────────────────────────────────────────────────────────────┘
  [+ Add Item]

  On item select (via SearchSelect):
  - HSN auto-fills from product record
  - GST% auto-fills from HSN
  - Purchase Unit auto-fills from product's UoM settings
  - Unit conversion tooltip appears: "1 Box = 10 Pcs → 5 Box = 50 Pcs in stock"

FormSection: Freight & Charges
  (Visible only if "Enable Freight on Purchases" is ON in Settings)
  ToggleSwitch: Include Freight Charges
    If ON:
      FormGrid cols=3:
        CurrencyInput: Freight Amount *
        GSTRateSelect: GST on Freight (0% or 5%)
        SelectDropdown: Distribution Method [By Value / By Quantity]

      Info banner: "₹500 freight will be distributed across 3 items.
                    Drill Bit 500W: +₹167/unit (landed: ₹1,017)"

Tax Summary (right-aligned card):
  ──────────────────────────────────────────
  Subtotal                          ₹8,500
  Discount                           -₹500
  Taxable Value                     ₹8,000

  [GST @ 12%]  Taxable ₹2,000   → ₹240
  [GST @ 18%]  Taxable ₹6,000   → ₹1,080
  ──────────────────────────────────────────
  Total CGST                          ₹660   ← shown if intra-state
  Total SGST                          ₹660   ← shown if intra-state
  (or IGST ₹1,320 if inter-state)
  Freight                             ₹500
  Round Off                           -₹0.50
  ══════════════════════════════════════════
  Grand Total                      ₹10,159
  ──────────────────────────────────────────

  GSTTypeIndicator: [CGST + SGST — Maharashtra → Maharashtra]

Sticky Footer:
  [Cancel]  [Save Draft]  [Submit PO]
```

On Submit PO: status changes to "Sent". ConfirmDialog asks: "Submit PO-0045 to [Vendor Name]? This will lock line items."

---

#### Goods Receipt Note (GRN)

**Route:** `/purchase/grn/new?po=[id]` or `/purchase/grn/new`
**Layout:** Single column, max-w-3xl.

```
PageHeader: "New Goods Receipt"

FormSection: GRN Details
  FormGrid cols=3:
    TextInput: GRN Number (auto)
    DatePicker: Receipt Date *
    SearchSelect: Linked PO * (pre-filled if opened from PO)
  FormGrid cols=2:
    TextInput: Vendor (auto from PO, read-only)
    SelectDropdown: Receiving Warehouse (auto from PO, editable)

WorkflowProgress: [● PO] ── [◉ GRN] ── [○ Bill] ── [○ Paid]

FormSection: Items Received (pre-populated from PO)
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Product       │  PO Qty     │  Prev. Recd  │  Receiving Now  │  Pending │
  │  Drill Bit 500W│  10 Box     │  0           │  [   7   ] Box  │  3 Box   │
  │  Hammer M-200  │  20 Nos     │  5           │  [  15   ] Nos  │  0       │
  └──────────────────────────────────────────────────────────────────────────┘

  Unit conversion note (per row): "7 Box = 70 Pcs will be added to stock"

  Discrepancy warnings (inline per row):
  ⚠ Receiving 12 Box — exceeds PO qty of 10. Verify before saving.

TextArea: Remarks

Sticky Footer:
  [Cancel]  [Save GRN]
```

On Save GRN:

- Stock is updated at the receiving warehouse
- PO status updates: Partially Received (if pending > 0) or Received (if all received)
- Prompt dialog: "GRN saved. Create Purchase Bill now?" [Create Bill] [Later]

---

#### Purchase Bill

**Route:** `/purchase/bills/new?grn=[id]`
**Layout:** Single column, max-w-4xl.

```
PageHeader: "New Purchase Bill"

FormSection: Bill Details
  FormGrid cols=3:
    TextInput: Vendor Invoice No. * (vendor's bill number)
    DatePicker: Bill Date *
    DatePicker: Due Date (auto: Bill Date + vendor credit period)
  FormGrid cols=2:
    TextInput: Vendor (from GRN, read-only)
    TextInput: Linked GRN(s) (read-only, links to GRN detail)

WorkflowProgress: [● PO] ── [● GRN] ── [◉ Bill] ── [○ Paid]

Line items: (pre-filled from GRN, read-only qty, editable rate/discount)
  [Same columns as PO — but Qty is from GRN, not editable]

Freight section (same as PO if enabled)
  + Show landed cost distribution summary below:
  "Freight allocated: Drill Bit 500W +₹50 (₹850 → ₹900/unit landed cost)"

Tax Summary (same structure as PO)

Sticky Footer:
  [Cancel]  [Save Draft]  [Post Bill]
```

On Post Bill: accounting entries are created (Dr Purchase, Dr Input GST, Cr Vendor). Status → "Posted". Toast: "Bill posted. Record payment?" with action button.

---

### 5.5 Sales Module

#### Sales Invoice

**Route:** `/sales/invoices/new`
**Layout:** Single column, max-w-4xl, sticky footer.

```
FormSection: Invoice Details
  FormGrid cols=2:
    TextInput: Invoice No. (auto, outlet-series)
    DatePicker: Invoice Date *
  FormGrid cols=2:
    SearchSelect: Customer * (or toggle to Cash Sale mode)
    TextInput: Place of Supply (auto from customer state, editable)

  Cash Sale Toggle:
    ToggleSwitch: [  ] Cash / Walk-in Sale
    (When ON: Customer field hidden, no GSTIN required, "Walk-in Customer" used)

  GSTTypeIndicator: [CGST + SGST — Maharashtra → Maharashtra]
  (or warning if customer state missing: "⚠ Customer state not set — update customer record to apply correct GST")

Line Items:
  ┌────────────────────────────────────────────────────────────────────────────────┐
  │  Product/SKU   │ HSN  │ Sales Unit │  Qty  │  Rate ₹  │  Disc%  │  GST%  │ Amt │ × │
  └────────────────────────────────────────────────────────────────────────────────┘

  Per item, show stock availability inline below the row:
  🟢 48 Pcs available   🟡 3 Pcs (low stock)   🔴 Out of stock — cannot add

Tax Summary (same structure as PO)

Sticky Footer:
  [Cancel]  [Save Draft]  [Print Preview]  [Share ↗]  [Post Invoice]
```

Print Preview: opens Modal (xl) showing the formatted invoice as it will print/share.
Share: opens a small dialog — "Copy PDF link" / "Open in WhatsApp" / "Send Email".

---

#### Payment Allocation Screen

**Route:** `/payments/received/new` or opened from Customer ledger / Invoice detail.
**Layout:** SlideOverDrawer (xl) or full page `/payments/received/new`.

```
FormSection: Payment Details
  FormGrid cols=2:
    DatePicker: Payment Date *
    CurrencyInput: Amount Received * (₹)
  FormGrid cols=3:
    SelectDropdown: Payment Mode [Cash / Bank Transfer / UPI / Cheque / DD]
    TextInput: Reference No. (cheque no., UTR, UPI ref)
    SelectDropdown: Bank Account (if Bank Transfer / Cheque)
  SearchSelect: Customer *

Allocation Section:
  Mode selector: [○ Auto (FIFO)]  [● Manual]

  Open Invoices table:
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  Invoice No.  │  Date   │  Due Date  │  Amount    │  Allocate  │  Status     │
  │  INV-001      │ 01 Jan  │ 31 Jan     │  ₹3,000    │  ₹ 3,000  │ ✓ Settled  │
  │  INV-002      │ 05 Jan  │ 04 Feb     │  ₹4,000    │  ₹ 4,000  │ ✓ Settled  │
  │  INV-003      │ 10 Jan  │ 09 Feb     │  ₹5,000    │  ₹ 3,000  │ ⚡ Partial │
  └──────────────────────────────────────────────────────────────────────────────┘

  In FIFO mode: Allocate column is auto-filled and read-only.
  In Manual mode: Allocate column is editable CurrencyInput per row.

  Running Total (sticky below table):
  ┌─────────────────────────────────┐
  │ Payment Amount     ₹10,000      │
  │ Total Allocated    ₹10,000      │
  │ Unallocated        ₹0           │  ← orange if > 0
  └─────────────────────────────────┘

  If unallocated > 0:
  ⚠ ₹X will be saved as an advance receipt on [Customer]'s account.
  It can be allocated to future invoices.

  Confirm button disabled if: allocated + unallocated ≠ payment amount exactly.

Sticky Footer:
  [Cancel]  [Confirm Payment & Allocation]
```

---

### 5.6 Vendor & Customer Management

#### Vendor / Customer List Pages

**Identical structure — parameterised by party type.**

**Table columns:**

| Column        | Notes                                    |
| ------------- | ---------------------------------------- |
| Name          | Primary — links to detail               |
| GSTIN         | Monospace, formatted                     |
| State         | Derived from GSTIN prefix                |
| Credit Period | "30 days"                                |
| Outstanding   | CurrencyDisplay — red if overdue        |
| Status        | Active / Inactive badge                  |
| Actions       | View · Edit · Ledger · Record Payment |

**RowActions:**

- View (SlideOverDrawer detail)
- Edit (SlideOverDrawer form)
- View Ledger (SlideOverDrawer xl — full transaction history)
- Record Payment (navigate to payment screen with party pre-selected)

---

#### Vendor / Customer Form (SlideOverDrawer lg)

```
Section: Basic Details
  FormGrid cols=2:
    TextInput: Name *
    TextInput: Contact Person
  FormGrid cols=2:
    TextInput: Phone *
    TextInput: Email

Section: GST & Tax
  FormGrid cols=2:
    TextInput: GSTIN
    (On blur: validate format, derive State from GSTIN prefix, show green badge if valid)
    TextInput: PAN

  For Customer only:
    ToggleSwitch: B2C Customer (hides GSTIN + PAN, marks as walk-in eligible)

Section: Address
  TextArea: Address Line
  FormGrid cols=3:
    TextInput: City
    SelectDropdown: State * (Indian states + UTs)
    TextInput: PIN Code

Section: Financial Terms
  FormGrid cols=2:
    NumberInput: Credit Period (days)
    CurrencyInput: Opening Balance (as of go-live date)

  For Customer only:
    CurrencyInput: Credit Limit (₹)

Sticky Footer:
  [Cancel]  [Save]
```

**GSTIN field UX:**

- 15-character alphanumeric mask
- On blur: format validation, derive state name, show: `✓ Valid GSTIN — Maharashtra`
- Invalid: `✗ Invalid format. GSTIN must be 15 alphanumeric characters.`

---

### 5.7 Outlets & Warehouses (Admin)

**Route:** `/admin/outlets`
**Layout:** Two-column split — Outlets left, Warehouses right.

```
┌─────────────────────────────┬─────────────────────────────┐
│ Outlets              [+ New] │ Warehouses           [+ New] │
├─────────────────────────────┼─────────────────────────────┤
│ ● Main Shop          ✎  ⋯  │ ● Main Godown        ✎  ⋯  │
│   Maharashtra                │   Linked: Main Shop          │
│   GSTIN: 27ABCDE...          │                              │
│   Series: INV-MSH-            │ ● Branch Storage     ✎  ⋯  │
│   Warehouses:                │   Linked: Branch Counter     │
│   • Main Godown [×]          │                              │
│   [+ Link Warehouse]         │                              │
│                              │                              │
│ ● Branch Counter     ✎  ⋯  │                              │
│   Maharashtra                │                              │
│   Series: INV-BRC-            │                              │
│   Warehouses:                │                              │
│   • Branch Storage [×]       │                              │
└─────────────────────────────┴─────────────────────────────┘
```

- Linking: clicking "+ Link Warehouse" opens a dropdown of available warehouses
- Removing a link: [×] button with ConfirmDialog
- Each card shows: name, state, GSTIN (if separate), invoice series prefix, active/inactive toggle
- Editing opens SlideOverDrawer (md) with the outlet/warehouse form

---

### 5.8 GST Reports

**Route:** `/reports/gst`

**Filters (always visible above tabs):**

```
Financial Year [2024–25 ▾]   Period [January ▾]   [All Outlets ▾]
[Generate Report]
```

**Tabs:** B2B Invoices | B2C Invoices | HSN Summary | Credit/Debit Notes | Document Summary

**B2B Invoices tab:**
Standard GSTR-1 B2B format: GSTIN of Recipient · Trade Name · Invoice No. · Date · Invoice Value · Place of Supply · Reverse Charge · Invoice Type · Rate · Taxable Value · IGST · CGST · SGST

**HSN Summary tab (critical):**

```
HSN Code │ Description │ UoM │ Total Qty │ Total Value │ IGST │ CGST │ SGST │ Cess
8467      │ Power tools │ Nos │ 124       │ ₹1,24,000   │ –    │₹11,160│₹11,160│ –
```

One row per HSN per rate — never aggregate different rates under the same HSN.

**Export buttons (top right of each tab):** `[Export Excel]` `[Export JSON]`

---

### 5.9 Reports Module

All reports share the same layout shell:

```
PageHeader: "[Report Name]"
Filter Bar: [DateRangePicker] [Outlet/Warehouse selector] [Export Excel]
─────────────────────────────────────────────────────────────────
Report content (DataTable or summary cards + DataTable)
```

**Stock Reports:**

- Current Stock — table with location filter
- Low Stock Alert — items below min, grouped by category, shows % below min
- Slow-Moving Stock — selector: last 30 / 60 / 90 days with no outward movement
- Stock Valuation — category-wise total inventory value at moving average cost
- Stock Ledger — per-item, requires SKU selection first, then date range

**Purchase Reports:**

- Purchase Register — all bills in period
- Vendor Outstanding Ageing — columns: 0–30 / 31–60 / 61–90 / 90+ / Total
- GRN Summary — all GRNs with PO reference and quantity variance

**Sales Reports:**

- Sales Register — all invoices in period
- Customer Outstanding Ageing — same buckets as vendor
- Item-wise Sales — qty sold + revenue per SKU, sortable

**Finance Reports:**

- Trial Balance — all accounts with opening balance, debit, credit, closing
- P&L Statement — income vs expenses for the period
- Balance Sheet — assets, liabilities, equity at period end
- GST Summary — output tax collected vs input tax paid, net liability

---

## 6. UX Patterns & Rules

### 6.1 Form UX

- Validate on blur, not on keystroke
- Required fields: label has a red asterisk `*`
- Error messages: below the field, text-xs text-red-600, icon `!`
- Hint text: below the field, text-xs text-muted (replaced by error when present)
- `Ctrl+S` / `Cmd+S` submits the currently focused form
- Long forms have a sticky footer — action buttons always visible without scrolling
- When a form is dirty and the user navigates away: ConfirmDialog "You have unsaved changes."
- Autosave indicator (optional): "Saved draft 30s ago" shown in the footer

### 6.2 Table UX

- Default sort: newest first (createdAt desc) for transactional tables; A-Z for master data
- Column sort: click header → asc → desc → unsorted (third click removes sort)
- All columns that can be filtered show a filter icon in the header that activates that column's filter
- Active filter count shown as a blue badge on the Filter button: `Filter (3)`
- Select All: selects current page only; a secondary "Select all [N] results" appears after page-select
- Empty search: "No results for '[query]'" with Clear search CTA, never a generic empty state

### 6.3 GST Auto-Detection (enforced system-wide)

**Rule:** The system determines GST type automatically. Users never manually choose.

Implementation:

1. Company state is read from Settings (immutable per session)
2. Party state is read from vendor/customer record
3. Compare: same state → CGST+SGST; different state → IGST
4. GSTTypeIndicator component renders the result as a read-only pill on every relevant form
5. If party state is missing: show warning `"⚠ [Vendor/Customer] state is not set. Update their record to apply correct GST."`
6. Warning blocks form submission until resolved (or admin override with reason)

Never: a dropdown to choose GST/IGST. Never: a manual tax type field.

### 6.4 Multi-Outlet Context

- Every new transaction (invoice, PO, stock adjustment) is tagged to the active outlet
- Outlet is always visible in TopNavbar — never just an internal state
- All queries include outlet context: `?outletId=OTL-01`
- In Admin "All Outlets" mode: tables show OutletBadge on every row; actions still target a specific outlet

### 6.5 Purchase Workflow Stage Gates

| Current Stage | Next Action Available | Button Location                   |
| ------------- | --------------------- | --------------------------------- |
| PO Draft      | Edit, Submit PO       | PO form footer                    |
| PO Sent       | Create GRN            | PO detail + list RowActions       |
| GRN saved     | Create Bill           | GRN detail prompt + PO RowActions |
| Bill posted   | Record Payment        | Bill detail + vendor ledger       |

If a user tries to skip a stage, show: "Complete [Stage Name] first to unlock this action." Never silently hide buttons — show them disabled with a tooltip explaining why.

### 6.6 Payment Allocation

- Default mode: Auto FIFO (oldest invoice first)
- User can switch to Manual at any point
- Running total always visible and always sums correctly
- Partial settlement is always allowed — remaining balance stays open
- Unallocated remainder → advance receipt → visible on customer ledger as a credit
- The Confirm button is disabled unless: `Σ allocated + unallocated = payment amount`

### 6.7 Unit Conversion UX

- When a line item's purchase unit ≠ base unit, show a non-intrusive tooltip on the Qty field:
  `"5 Box × 10 Pcs = 50 Pcs will be added to inventory"`
- GRN screen shows both: Receiving column in Purchase Unit, stock update shown in Base Unit
- All stock reports and balance figures always in Base Unit — never in purchase unit

### 6.8 Freight & Landed Cost UX

- Freight section is hidden entirely if the Settings toggle is off
- When freight is enabled and entered: show a live distribution preview below the freight fields
- Distribution is recalculated whenever freight amount, distribution method, or line items change
- On the Purchase Bill, show final landed cost per unit next to each line item

---

## 7. API Integration

### 7.1 Data Fetching (React Query)

```ts
// Always include outlet context in query keys
const { data, isLoading } = useQuery({
  queryKey: ['purchase-orders', { outletId, page, filters, sort }],
  queryFn: () => api.get('/purchase-orders', { params: { outletId, ...filters, page, sort } }),
  staleTime: 30_000,
})

// Master data (products, vendors, customers) — longer stale time
const { data: products } = useQuery({
  queryKey: ['products', { outletId }],
  staleTime: 5 * 60_000,
})
```

On outlet switch: `queryClient.invalidateQueries()` — invalidates all.

### 7.2 Mutations

```ts
const postBill = useMutation({
  mutationFn: (data: PostBillInput) => api.post('/purchase/bills', data),
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ['purchase-bills'] })
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
    toast.success(`Bill ${result.billNumber} posted successfully`)
    router.push(`/purchase/bills/${result.id}`)
  },
  onError: (error: ApiError) => {
    toast.error(error.message ?? 'Failed to post bill. Please try again.')
  }
})
```

### 7.3 Optimistic Updates

For status changes (approve PO, cancel invoice) — apply optimistic update immediately, revert on error:

```ts
const cancelPO = useMutation({
  mutationFn: (id: string) => api.patch(`/purchase-orders/${id}/cancel`),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['purchase-orders'] })
    const prev = queryClient.getQueryData(['purchase-orders', { outletId }])
    queryClient.setQueryData(['purchase-orders', { outletId }], (old) =>
      old.map(po => po.id === id ? { ...po, status: 'cancelled' } : po)
    )
    return { prev }
  },
  onError: (err, id, ctx) => {
    queryClient.setQueryData(['purchase-orders', { outletId }], ctx.prev)
    toast.error('Failed to cancel PO. Please try again.')
  }
})
```

### 7.4 Pagination API Contract

All list endpoints follow:

```
GET /resource?page=1&limit=25&sort=createdAt&order=desc&outletId=OTL-01&search=...

Response:
{
  "data": [...],
  "meta": {
    "total": 301,
    "page": 1,
    "limit": 25,
    "totalPages": 13
  }
}
```

### 7.5 Outlet Context Injection

```ts
// axios interceptor — attaches outlet to every request
api.interceptors.request.use((config) => {
  const outlet = useOutletStore.getState().activeOutletId
  if (outlet) config.headers['X-Outlet-Id'] = outlet
  return config
})
```

### 7.6 Error States

- 400 Bad Request: show inline field errors from the server's validation response (map `field → message`)
- 401 Unauthorized: redirect to login, preserve current URL for post-login redirect
- 403 Forbidden: show EmptyState "no access" variant, not an error page
- 404 Not Found: show EmptyState "item not found" with Back button
- 500 Server Error: show inline error banner at top of content area with Retry button — not a toast, not a full error page
- Network offline: persistent top banner, amber background: "You appear to be offline. Changes may not save."

---

## 8. Accessibility & Performance

### Accessibility

- All interactive elements: visible 2px brand-blue focus ring — `focus-visible:ring-2 focus-visible:ring-brand`
- Color is never the only indicator — always paired with text or icon
- All icon-only buttons: `aria-label` (e.g. `aria-label="Close drawer"`)
- DataTable: `<caption>`, `scope="col"` on headers, `scope="row"` on first cell
- All modals and drawers: focus trap (Tab cycles inside), restore focus on close, `aria-modal="true"`
- StatusBadge: `role="status"` with accessible text matching the visual label
- Form errors: `aria-describedby` linking field to error message, `aria-invalid="true"` on invalid fields
- Avoid `div` buttons — use `<button>` elements always

### Performance

- Route-level code splitting: Next.js App Router handles this by default
- DataTable: use `react-virtual` for virtualization when rows > 100
- Images: `next/image` with explicit width/height, lazy loading
- Search inputs: debounce 300ms, cancel previous in-flight requests on new keystroke
- Skeleton loaders: reserve exact layout space to prevent CLS (Cumulative Layout Shift)
- Heavy drawers/modals: lazy-load with `React.lazy` + `Suspense`
- Fonts: preload IBM Plex Sans, `font-display: swap`

---

## 9. Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx                    ← AppLayout
│       ├── page.tsx                      ← Dashboard
│       ├── products/
│       │   ├── page.tsx                  ← Product List
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx              ← Product Detail
│       │       └── edit/page.tsx
│       ├── inventory/
│       │   ├── page.tsx                  ← Current Stock
│       │   ├── transfers/
│       │   │   ├── page.tsx
│       │   │   └── new/page.tsx
│       │   └── adjustments/
│       │       ├── page.tsx
│       │       └── new/page.tsx
│       ├── purchase/
│       │   ├── orders/
│       │   │   ├── page.tsx
│       │   │   ├── new/page.tsx
│       │   │   └── [id]/page.tsx
│       │   ├── grn/
│       │   │   ├── page.tsx
│       │   │   ├── new/page.tsx
│       │   │   └── [id]/page.tsx
│       │   └── bills/
│       │       ├── page.tsx
│       │       ├── new/page.tsx
│       │       └── [id]/page.tsx
│       ├── sales/
│       │   ├── invoices/
│       │   ├── quotations/
│       │   └── challans/
│       ├── payments/
│       │   ├── received/
│       │   └── made/
│       ├── vendors/
│       ├── customers/
│       ├── accounts/
│       ├── reports/
│       │   ├── stock/
│       │   ├── sales/
│       │   ├── purchase/
│       │   ├── gst/
│       │   └── finance/
│       ├── admin/
│       │   ├── outlets/
│       │   └── users/
│       └── settings/
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopNavbar.tsx
│   │   ├── OutletSwitcher.tsx
│   │   └── PageHeader.tsx
│   ├── ui/
│   │   ├── form/
│   │   │   ├── TextInput.tsx
│   │   │   ├── NumberInput.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── PercentInput.tsx
│   │   │   ├── SelectDropdown.tsx
│   │   │   ├── SearchSelect.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── ToggleSwitch.tsx
│   │   │   ├── FormSection.tsx
│   │   │   ├── FormGrid.tsx
│   │   │   ├── GSTRateSelect.tsx
│   │   │   ├── HSNCodeInput.tsx
│   │   │   ├── UnitConversionFields.tsx
│   │   │   └── MarkupPricingField.tsx
│   │   ├── table/
│   │   │   ├── DataTable.tsx
│   │   │   ├── TableToolbar.tsx
│   │   │   ├── ColumnFilter.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── RowActions.tsx
│   │   ├── modal/
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── SlideOverDrawer.tsx
│   │   └── feedback/
│   │       ├── ToastNotification.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── SkeletonLoader.tsx
│   │       └── EmptyState.tsx
│   ├── shared/
│   │   ├── StatusBadge.tsx
│   │   ├── CurrencyDisplay.tsx
│   │   ├── QuantityDisplay.tsx
│   │   ├── OutletBadge.tsx
│   │   ├── GSTTypeIndicator.tsx
│   │   ├── HSNBadge.tsx
│   │   ├── WorkflowProgress.tsx
│   │   ├── Avatar.tsx
│   │   └── Tooltip.tsx
│   ├── purchase/
│   │   ├── LineItemsTable.tsx           ← reused in PO, GRN, Bill
│   │   ├── FreightSection.tsx
│   │   ├── TaxSummaryCard.tsx
│   │   └── POStageActions.tsx           ← stage-gated action buttons
│   ├── sales/
│   │   ├── InvoiceLineItems.tsx
│   │   └── CashSaleToggle.tsx
│   └── payments/
│       └── AllocationTable.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts                    ← axios instance + interceptors
│   │   ├── products.ts
│   │   ├── purchase.ts
│   │   ├── sales.ts
│   │   └── parties.ts
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── usePurchaseOrders.ts
│   │   ├── useInventory.ts
│   │   └── useParties.ts
│   ├── store/
│   │   ├── outlet.ts                    ← Zustand: active outlet context
│   │   └── auth.ts
│   └── utils/
│       ├── currency.ts                  ← Indian number formatting
│       ├── gst.ts                       ← GST type detection, tax calc
│       ├── units.ts                     ← unit conversion helpers
│       └── dates.ts                     ← DD/MM/YYYY formatting
│
└── types/
    ├── product.ts
    ├── inventory.ts
    ├── purchase.ts
    ├── sales.ts
    ├── party.ts
    ├── payment.ts
    └── outlet.ts
```

---

## 10. Critical Utility Logic (Frontend)

```ts
// lib/utils/gst.ts
export function getGSTType(sellerState: string, buyerState: string): 'GST' | 'IGST' {
  return sellerState.trim().toLowerCase() === buyerState.trim().toLowerCase()
    ? 'GST'
    : 'IGST'
}

export function calcTax(rate: number, taxableValue: number, type: 'GST' | 'IGST') {
  const total = (taxableValue * rate) / 100
  if (type === 'IGST') return { igst: total, cgst: 0, sgst: 0 }
  return { igst: 0, cgst: total / 2, sgst: total / 2 }
}

export const GST_SLABS = [0, 0.25, 3, 5, 12, 18, 28] as const


// lib/utils/units.ts
export function toBaseUnits(purchaseQty: number, conversionRatio: number): number {
  return purchaseQty * conversionRatio
}

export function conversionLabel(
  qty: number, purchaseUnit: string,
  ratio: number, baseUnit: string
): string {
  return `${qty} ${purchaseUnit} × ${ratio} = ${qty * ratio} ${baseUnit}`
}


// lib/utils/currency.ts
export function formatINR(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatIndianNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}
```

---

*End of UI/UX Prompt — v2.0*
*Aligned to: BRD v1.2 | Stack: Next.js App Router · React · TailwindCSS · React Query*
