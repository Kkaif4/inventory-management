# Outlet & Warehouse Create/Edit UI Implementation Plan

**Date:** 2026-03-25
**Status:** Planning
**Scope:** Implement unified UI spec for Outlet (5-section form) & Warehouse (simplified variant)

---

## Executive Summary

Current state has **inconsistencies** across 4 outlet pages (2 admin + 2 master-data) and 4 warehouse pages. Admin uses manual HTML forms, Master Data uses shadcn/ui. This plan **unifies** the UI layer with:

- **Shared FormSection component** (title, description, FormGrid, validation states)
- **Business-owner-friendly UX** (clear field state badges, conditional read-only UI, confirmation dialogs)
- **Consistent styling** across all create/edit pages (rounded-2xl containers, emerald focus ring, h-14 inputs)
- **Reusable field components** (GSTIN validator, Segmented control for policies, Toggle with warnings)
- **Outlet spec** = 5 sections (Basic, Invoice, Bank, Inventory, Billing)
- **Warehouse spec** = 3 sections (Basic, Contact, Warehouse Type) — extension of outlet patterns

---

## Current State Analysis

### Inconsistencies Found

| Aspect | Admin Pages | Master Data Pages |
|--------|-----------|------------------|
| Form Library | Manual HTML + register() | shadcn/ui Form |
| Container Roundness | rounded-xl (12px) | rounded-[2.5rem] (40px) |
| Input Height/Padding | default | h-14 px-6 |
| Focus Ring Color | ring-blue-500 | ring-emerald-500 |
| Section Spacing | p-6 | p-10 |
| Field Labels | Standard | text-xs font-black uppercase |
| Warehouse Select | Checkbox grid | Checkbox grid + labels |
| Missing Fields | Some present | Some missing in edit pages |

### Current Component Assets

✓ `FormSection`, `FormGrid` exist but underutilized
✓ shadcn/ui Form components available (Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription)
✓ Custom Input, Button, Select components
✓ Toast/error notification system (sonner)
✓ Zod validation schemas for both entities

---

## Design Principles (Business Owner UX)

1. **Clear Field States** — Read-only fields have visual indicators (icon badge, tooltip, disabled styling)
2. **Inline Validation** — GSTIN badge (green ✓ / red ✗ / amber ⚠) shown on blur
3. **Conditional Warnings** — Turning off batch tracking shows red warning with checkbox acknowledgement
4. **Live Preview** — Invoice prefix shows "Your first invoice will be: MSH/2526/0001" as user types
5. **Grouped Sections** — Related fields grouped in FormSection (title + description)
6. **Accessible Toggles** — Toggles with clear labels + info banners explaining impact
7. **Warehouse Linking** — Select shows list with descriptions, "No warehouses linked" state when empty

---

## Implementation Plan

### Phase 1: Create Reusable Components (Foundation)

#### 1.1 Enhanced FormSection Component
**File:** `src/components/form/form-section.tsx` (create or enhance existing)

```typescript
interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-6 border-b border-slate-100 pb-8">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
      </div>
      <FormGrid>{children}</FormGrid>
    </div>
  );
}
```

#### 1.2 FormGrid Component
**File:** `src/components/form/form-grid.tsx` (enhance existing)

```typescript
interface FormGridProps {
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
}

export function FormGrid({ cols = 2, children }: FormGridProps) {
  return (
    <div className={cn(
      "grid gap-6",
      cols === 1 && "grid-cols-1",
      cols === 2 && "grid-cols-1 md:grid-cols-2",
      cols === 3 && "grid-cols-1 md:grid-cols-3",
      cols === 4 && "grid-cols-1 md:grid-cols-4",
    )}>
      {children}
    </div>
  );
}
```

#### 1.3 GSTIN Validator Component
**File:** `src/components/form/gstin-input.tsx` (new)

**Purpose:** Shows validation badge (green/red/amber) on blur with state mismatch detection

```typescript
interface GSTINInputProps {
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  selectedState?: string;
  disabled?: boolean;
}

export function GSTINInput({ value, selectedState, onBlur, onChange }: GSTINInputProps) {
  const [validationState, setValidationState] = useState<'valid' | 'invalid' | 'mismatch' | null>(null);
  const [derivedState, setDerivedState] = useState<string | null>(null);

  const handleBlur = () => {
    if (!value) return;

    const isValid = /^[A-Z0-9]{15}$/.test(value.toUpperCase());
    if (!isValid) {
      setValidationState('invalid');
      return;
    }

    // Derive state from digits 1-2 of GSTIN
    const gstStateCode = value.substring(0, 2);
    const derivedStateValue = GST_STATE_MAPPING[gstStateCode];
    setDerivedState(derivedStateValue);

    if (derivedStateValue && selectedState && derivedStateValue !== selectedState) {
      setValidationState('mismatch');
    } else {
      setValidationState('valid');
    }

    onBlur?.();
  };

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onBlur={handleBlur}
        placeholder="15-character GSTIN"
        className="font-mono"
        maxLength={15}
      />

      {validationState === 'valid' && (
        <Badge variant="success" className="w-fit text-xs">
          ✓ Valid GSTIN
        </Badge>
      )}
      {validationState === 'invalid' && (
        <Badge variant="destructive" className="w-fit text-xs">
          ✗ Invalid format — must be 15 alphanumeric characters
        </Badge>
      )}
      {validationState === 'mismatch' && (
        <Badge variant="secondary" className="w-fit text-xs bg-amber-50 text-amber-700">
          ⚠ GSTIN suggests {derivedState} but State is {selectedState}
        </Badge>
      )}
    </div>
  );
}
```

#### 1.4 Segmented Control for Negative Stock Policy
**File:** `src/components/form/segmented-policy-control.tsx` (new)

```typescript
interface SegmentedPolicyControlProps {
  value: 'BLOCK' | 'WARN' | 'ALLOW';
  onChange: (value: 'BLOCK' | 'WARN' | 'ALLOW') => void;
}

export function SegmentedPolicyControl({ value, onChange }: SegmentedPolicyControlProps) {
  const options = [
    { value: 'BLOCK', label: 'Block', description: 'Prevents going below zero' },
    { value: 'WARN', label: 'Warn (default)', description: 'Shows warning, user can confirm' },
    { value: 'ALLOW', label: 'Allow', description: 'No check, stock can go negative' },
  ];

  return (
    <div className="space-y-4">
      <div className="inline-flex gap-2 rounded-lg border border-slate-200 p-1 bg-slate-50">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              value === opt.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-600">
        Controls what happens when a sale or transfer reduces stock below zero at this outlet's warehouse.
      </p>
    </div>
  );
}
```

#### 1.5 Enhanced Toggle with Info Banner
**File:** `src/components/form/toggle-with-banner.tsx` (new)

```typescript
interface ToggleWithBannerProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  infoBanner?: string;
  warningBanner?: { type: 'warning' | 'error'; message: string; requireAcknowledgement?: boolean };
  onAcknowledge?: (acknowledged: boolean) => void;
  disabled?: boolean;
}

export function ToggleWithBanner({
  label,
  value,
  onChange,
  infoBanner,
  warningBanner,
  requireAcknowledgement,
}: ToggleWithBannerProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch checked={value} onCheckedChange={onChange} />
        <label className="text-sm font-medium text-slate-900">{label}</label>
      </div>

      {value && infoBanner && (
        <div className="flex gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900 border border-blue-200">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-wrap">{infoBanner}</div>
        </div>
      )}

      {warningBanner && (
        <div className={cn(
          "flex gap-3 rounded-lg p-4 text-sm border",
          warningBanner.type === 'warning'
            ? "bg-amber-50 text-amber-900 border-amber-200"
            : "bg-red-50 text-red-900 border-red-200"
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="whitespace-pre-wrap">{warningBanner.message}</p>
            {requireAcknowledgement && (
              <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={acknowledged}
                  onCheckedChange={(checked) => {
                    setAcknowledged(checked as boolean);
                    onAcknowledge?.(checked as boolean);
                  }}
                />
                <span className="text-sm">I understand. Disable batch tracking for this outlet.</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 1.6 Invoice Preview Component
**File:** `src/components/form/invoice-preview.tsx` (new)

```typescript
interface InvoicePreviewProps {
  prefix: string;
  startingNumber: number;
}

export function InvoicePreview({ prefix, startingNumber }: InvoicePreviewProps) {
  const currentFY = new Date().getFullYear().toString().slice(2) +
                   (new Date().getFullYear() + 1).toString().slice(2);
  const firstInvoice = prefix
    ? `${prefix}/${currentFY}/${String(startingNumber || 1).padStart(4, '0')}`
    : '—';

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 font-medium">PREVIEW</p>
      <p className="text-sm font-mono text-slate-900 mt-1">
        Your first invoice will be: <span className="font-bold">{firstInvoice}</span>
      </p>
    </div>
  );
}
```

#### 1.7 Read-Only Field Badge
**File:** `src/components/form/read-only-badge.tsx` (new)

```typescript
interface ReadOnlyBadgeProps {
  reason: string;
}

export function ReadOnlyBadge({ reason }: ReadOnlyBadgeProps) {
  return (
    <Badge variant="outline" className="text-xs gap-1">
      <Lock className="h-3 w-3" />
      {reason}
    </Badge>
  );
}
```

---

### Phase 2: Create Outlet-Specific Components

#### 2.1 Create Unified Outlet Form Component
**File:** `src/components/outlets/outlet-form.tsx` (new, shared across all 4 pages)

**Props:**
- `outlet?: Outlet` (undefined for create, defined for edit)
- `mode: 'admin' | 'master-data'` (styling may differ slightly)
- `onSubmit: (data: OutletFormValues) => Promise<void>`
- `isLoading: boolean`

**Structure:**
```typescript
export function OutletForm({ outlet, mode, onSubmit, isLoading }: OutletFormProps) {
  const form = useForm<OutletFormValues>({
    resolver: zodResolver(outletSchema),
    defaultValues: outlet ? { ... } : { ... },
  });

  const [batchTrackingEnabled, setBatchTrackingEnabled] = useState(outlet?.batchTrackingEnabled ?? false);
  const [hasExistingBatches, setHasExistingBatches] = useState(false);
  const [hasPostedInvoices, setHasPostedInvoices] = useState(false);

  useEffect(() => {
    if (outlet?.id) {
      // Check if invoices exist for this outlet
      checkPostedInvoices(outlet.id).then(setHasPostedInvoices);
      // Check if batches exist
      checkExistingBatches(outlet.id).then(setHasExistingBatches);
    }
  }, [outlet?.id]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Section 1: Basic Information */}
        <FormSection
          title="Basic Information"
          description="Identity of the outlet. Printed on every invoice this outlet generates."
        >
          <FormField name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Outlet Name</FormLabel>
              <FormControl>
                <Input {...field} maxLength={80} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="address" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} maxLength={300} />
              </FormControl>
              <FormDescription>Full address including street, area. Max 300 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="state" render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Used for GST type detection on invoices</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="gstin" render={({ field }) => (
            <FormItem>
              <FormLabel>GSTIN</FormLabel>
              <FormControl>
                <GSTINInput
                  {...field}
                  selectedState={form.watch('state')}
                />
              </FormControl>
              <FormDescription>15-character alphanumeric. Validated on blur.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </FormSection>

        {/* Section 2: Invoice Settings */}
        <FormSection
          title="Invoice Settings"
          description="Controls how invoice numbers are generated for this outlet. Every outlet has its own independent numbering series."
        >
          <FormField name="invoicePrefix" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Invoice Prefix</FormLabel>
                {hasPostedInvoices && (
                  <ReadOnlyBadge reason="Cannot change after invoices have been posted." />
                )}
              </div>
              <FormControl>
                <Input
                  {...field}
                  maxLength={8}
                  disabled={hasPostedInvoices}
                  placeholder="e.g., MSH"
                  className="font-mono uppercase"
                />
              </FormControl>
              <FormDescription>Max 8 chars. Alphanumeric only. No spaces or special chars.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="invoiceStartingNumber" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Starting Number</FormLabel>
                {hasPostedInvoices && (
                  <ReadOnlyBadge reason="Cannot change after invoices have been posted." />
                )}
              </div>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  disabled={hasPostedInvoices}
                  min={1}
                />
              </FormControl>
              <FormDescription>Default: 1. First invoice number for current financial year.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <div className="md:col-span-2">
            <InvoicePreview
              prefix={form.watch('invoicePrefix')}
              startingNumber={form.watch('invoiceStartingNumber')}
            />
          </div>
        </FormSection>

        {/* Section 3: Bank Details */}
        <FormSection
          title="Bank Details"
          description="Bank account information printed at the bottom of invoices for customer payment reference."
        >
          <FormField name="bankDetails" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Bank Details</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  maxLength={300}
                  placeholder="HDFC Bank — Current Account&#10;Account No: 1234567890&#10;IFSC: HDFC0001234&#10;Account Holder: ABC Hardware Pvt. Ltd."
                />
              </FormControl>
              <FormDescription>
                This text is printed on every invoice from this outlet. Include bank name, account number, IFSC, and account holder name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </FormSection>

        {/* Section 4: Inventory & Stock Settings */}
        <FormSection
          title="Inventory & Stock Settings"
          description="Controls how stock is managed, valued, and protected at this outlet."
        >
          <FormField name="defaultWarehouseId" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Default Warehouse</FormLabel>
              <FormControl>
                <WarehouseSelect
                  value={field.value}
                  onChange={field.onChange}
                  outletId={outlet?.id}
                  emptyMessage="No warehouses linked. Link a warehouse first."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="negativeStockPolicy" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Negative Stock Policy</FormLabel>
              <FormControl>
                <SegmentedPolicyControl
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="batchTrackingEnabled" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormControl>
                <ToggleWithBanner
                  label="Enable Batch-wise Inventory"
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setBatchTrackingEnabled(val);
                  }}
                  infoBanner={field.value ? "Batch tracking assigns a unique batch number to each purchase receipt.\nStock is consumed in FIFO order (oldest batch first) on every sale.\n\nIf this outlet already has existing stock, you will need to complete\nan Opening Batch Entry before new transactions can proceed." : undefined}
                  warningBanner={
                    !field.value && hasExistingBatches
                      ? {
                          type: 'error',
                          message: "Disabling batch tracking is irreversible for existing records.\nAll existing batch history will be preserved as read-only.\nNew transactions will not use batch tracking.",
                          requireAcknowledgement: true,
                        }
                      : undefined
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="inventoryValuationMethod" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Inventory Valuation Method</FormLabel>
              {batchTrackingEnabled ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Badge className="bg-emerald-100 text-emerald-900">FIFO (auto)</Badge>
                  <span className="text-sm text-slate-600">Automatically set by batch tracking</span>
                </div>
              ) : (
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Not available" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Not Set</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              )}
              {!batchTrackingEnabled && (
                <FormDescription className="text-slate-500">
                  Enable batch tracking to use FIFO valuation
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )} />
        </FormSection>

        {/* Section 5: Billing Settings */}
        <FormSection
          title="Billing Settings"
          description="Controls billing behaviour specific to this outlet."
        >
          <FormField name="allowRawCashBills" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormControl>
                <ToggleWithBanner
                  label="Allow Raw Cash Bills (No.2 Bills)"
                  value={field.value}
                  onChange={field.onChange}
                  infoBanner={field.value ? "Enables a second billing mode (No.2 / Cash Memo) for quick counter sales.\n\nNo.2 bills:\n• Reduce stock\n• Create a journal entry to Cash Sales — Informal account\n• Do NOT appear in GST reports\n• Do NOT update customer ledger\n\nUse this for walk-in cash buyers where a legal invoice is not required." : undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FormSection>

        {/* Form Footer */}
        <div className="flex justify-between pt-8 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {outlet ? 'Update Outlet' : 'Create Outlet'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

#### 2.2 Update Outlet Create/Edit Pages
**Files to update:**
- `src/app/dashboard/admin/outlets/new/page.tsx`
- `src/app/dashboard/admin/outlets/[id]/edit/edit-client.tsx`
- `src/app/dashboard/master-data/locations/outlet/new/page.tsx`
- `src/app/dashboard/master-data/locations/outlet/[id]/edit/edit-client.tsx`

All pages should use the unified `OutletForm` component instead of duplicating form logic.

---

### Phase 3: Create Warehouse-Specific Components

#### 3.1 Create Unified Warehouse Form Component
**File:** `src/components/warehouses/warehouse-form.tsx` (new, shared across 4 pages)

**Sections:**
1. Basic Information (Name, Address, State)
2. Contact Information (Manager Name, Direct Number)
3. Warehouse Type / Classification (optional for future expansion)

```typescript
export function WarehouseForm({ warehouse, onSubmit, isLoading }: WarehouseFormProps) {
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouse ? { ... } : { ... },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <FormSection
          title="Basic Information"
          description="Identity of the warehouse."
        >
          <FormField name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse Name</FormLabel>
              <FormControl>
                <Input {...field} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="address" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="state" render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FormSection>

        <FormSection
          title="Contact Information"
          description="Warehouse manager and contact details."
        >
          <FormField name="contactName" render={({ field }) => (
            <FormItem>
              <FormLabel>Manager Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="contactPhone" render={({ field }) => (
            <FormItem>
              <FormLabel>Direct Number</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormDescription>10-digit phone number</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </FormSection>

        {/* Form Footer */}
        <div className="flex justify-between pt-8 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {warehouse ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

#### 3.2 Update Warehouse Create/Edit Pages
**Files to update:**
- `src/app/dashboard/admin/warehouses/new/page.tsx`
- `src/app/dashboard/admin/warehouses/[id]/edit/edit-client.tsx`
- `src/app/dashboard/master-data/locations/warehouse/new/page.tsx`
- `src/app/dashboard/master-data/locations/warehouse/[id]/edit/edit-client.tsx`

All pages should use the unified `WarehouseForm` component.

---

### Phase 4: Styling & Design System Alignment

#### 4.1 Unified Styling Palette
- **Container:** `rounded-2xl` (32px), `p-10`, `bg-white border border-slate-200`
- **Input/Textarea:** `h-14 px-6 rounded-lg`, `bg-slate-50 border border-slate-200`, `focus:ring-2 focus:ring-emerald-500/20`
- **FormLabel:** `text-xs font-black uppercase tracking-widest text-slate-400`
- **FormDescription:** `text-sm text-slate-600`
- **Button Submit:** `h-14 px-12 rounded-lg bg-slate-900 text-white shadow-xl hover:bg-slate-800`
- **Button Cancel:** `h-14 px-12 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-50`
- **FormSection:** `space-y-6 border-b border-slate-100 pb-8`
- **Badges:** Green (valid), Red (invalid), Amber (warning)
- **Focus Ring:** Emerald-500 @ 20% opacity (emerald focus for inventory context)

#### 4.2 Update shadcn/ui Input Component
**File:** `src/components/ui/input.tsx`

Apply unified styling:
```typescript
const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-14 w-full rounded-lg border border-slate-200 bg-slate-50 px-6 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
```

#### 4.3 Update shadcn/ui Textarea Component
Same styling approach.

#### 4.4 Update shadcn/ui Select Component
Apply rounded-lg, h-14 min-height, emerald focus ring.

---

### Phase 5: Server Actions & Validation

#### 5.1 Update Outlet Validation Schema
**File:** `src/validations/outlet.validation.ts`

Add new fields + update existing ones:
```typescript
export const outletSchema = z.object({
  name: z.string().min(2).max(80),
  address: z.string().max(300).optional(),
  state: z.string().min(1, "State is required"),
  gstin: z.string().optional(), // Will validate format in component
  invoicePrefix: z.string().min(1).max(8),
  invoiceStartingNumber: z.number().min(1),
  bankDetails: z.string().max(300).optional(),
  defaultWarehouseId: z.string().optional(),
  negativeStockPolicy: z.enum(["WARN", "BLOCK", "ALLOW"]),
  batchTrackingEnabled: z.boolean(),
  inventoryValuationMethod: z.enum(["NONE", "FIFO"]),
  allowRawCashBills: z.boolean(),
});
```

#### 5.2 Create/Update Outlet Server Actions
**File:** `src/actions/outlets/index.ts`

```typescript
export async function createOutlet(data: OutletFormValues) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);

    // Check for duplicate invoice prefix
    const existingPrefix = await db.outlet.findFirst({
      where: {
        invoicePrefix: data.invoicePrefix,
        accountId: session.user.accountId,
      },
    });
    if (existingPrefix) throw new ValidationError("Invoice prefix already exists");

    // Create outlet
    const outlet = await db.outlet.create({
      data: {
        ...data,
        accountId: session.user.accountId,
      },
    });

    // If batch tracking enabled and stock exists, trigger Opening Batch Entry
    if (data.batchTrackingEnabled) {
      const hasStock = await db.stock.findFirst({
        where: { outlet: outlet.id }
      });
      if (hasStock) {
        return { success: true, data: outlet, redirectTo: `/opening-batch-entry/${outlet.id}` };
      }
    }

    return { success: true, data: outlet };
  });
}

export async function updateOutlet(id: string, data: OutletFormValues) {
  return withErrorHandler(async () => {
    const outlet = await db.outlet.findUnique({ where: { id } });

    // Check if invoices exist (for read-only field validation)
    const hasInvoices = await db.transaction.findFirst({
      where: { outletId: id, type: "SALE" }
    });

    // Prevent changing invoice prefix/starting number if invoices exist
    if (hasInvoices) {
      if (data.invoicePrefix !== outlet.invoicePrefix) {
        throw new ValidationError("Cannot change invoice prefix after invoices have been posted");
      }
      if (data.invoiceStartingNumber !== outlet.invoiceStartingNumber) {
        throw new ValidationError("Cannot change invoice starting number after invoices have been posted");
      }
    }

    // Update outlet
    const updated = await db.outlet.update({
      where: { id },
      data,
    });

    return { success: true, data: updated };
  });
}
```

#### 5.3 Update Warehouse Server Actions
**File:** `src/actions/warehouses/index.ts`

Similar pattern, simpler validation (no invoice checks needed).

---

### Phase 6: Test & QA Checklist

#### 6.1 Form Behavior Tests
- [ ] Outlet Create: All fields required/optional per spec
- [ ] Outlet Edit: Read-only fields lock after invoices posted
- [ ] GSTIN validation: Green/red/amber badges show correctly
- [ ] Invoice preview: Updates live as user types
- [ ] Batch tracking toggle: Shows/hides info banner
- [ ] Batch tracking OFF: Shows warning with acknowledgement checkbox when batches exist
- [ ] Negative stock policy: Segmented control selects one option
- [ ] Default warehouse: Shows "No warehouses linked" when empty
- [ ] Warehouse Create: All fields work
- [ ] Warehouse Edit: No read-only restrictions (all fields editable)

#### 6.2 Styling & UX Tests
- [ ] Input heights h-14 consistent across all fields
- [ ] Focus ring emerald-500/20 on all inputs
- [ ] FormSection spacing consistent (space-y-6, pb-8)
- [ ] Labels text-xs font-black uppercase
- [ ] Badges show with correct colors
- [ ] Toggles with banners render correctly
- [ ] Cancel button confirms if form is dirty
- [ ] Submit button shows loading state (spinner + disabled)

#### 6.3 Responsive Tests
- [ ] Mobile: Single column, labels above inputs
- [ ] Tablet/Desktop: Two-column grid for wide fields
- [ ] Section descriptions wrap correctly

#### 6.4 Edge Cases
- [ ] Outlet with existing stock + batch tracking OFF → red warning with checkbox
- [ ] Edit outlet → invoice prefix locked if invoices exist
- [ ] Create outlet → batch tracking ON, redirect to Opening Batch Entry if stock exists
- [ ] Warehouse with no state selected → form won't submit
- [ ] GSTIN state mismatch → amber badge shows correct states

---

### Phase 7: Implementation Order

**Week 1 — Foundation Components**
1. Enhance FormSection & FormGrid components
2. Create GSTINInput component with validation
3. Create SegmentedPolicyControl component
4. Create ToggleWithBanner component
5. Create InvoicePreview component
6. Create ReadOnlyBadge component

**Week 2 — Outlet Form**
7. Create unified OutletForm component
8. Update all 4 outlet pages to use OutletForm
9. Update outletSchema validation
10. Update outlet server actions (create/update)

**Week 3 — Warehouse Form**
11. Create unified WarehouseForm component
12. Update all 4 warehouse pages to use WarehouseForm
13. Update warehouse server actions

**Week 4 — Styling & Testing**
14. Align all shadcn/ui components (Input, Textarea, Select, Button)
15. QA testing across all 8 pages
16. Mobile responsive testing
17. Edge case testing

---

## Component Hierarchy

```
FormSection (title, description, space-y-6)
  └── FormGrid (responsive 1|2 cols)
      └── FormField (shadcn/ui)
          ├── FormLabel (text-xs font-black uppercase)
          ├── FormControl
          │   └── Input | Textarea | Select | GSTINInput | SegmentedPolicyControl | ToggleWithBanner
          ├── FormDescription (text-sm text-slate-600)
          └── FormMessage (error, red text)

OutletForm
  └── FormSection × 5
      └── Various form fields + conditional badges/warnings

WarehouseForm
  └── FormSection × 3
      └── Standard form fields
```

---

## Business Owner UX Principles Implemented

✓ **Clear Field States** — Read-only fields marked with lock badge + tooltip
✓ **Inline Validation** — GSTIN badge (green/red/amber) on blur
✓ **Conditional Warnings** — Batch tracking disable shows red warning
✓ **Live Preview** — Invoice number updates as user types
✓ **Grouped Sections** — Related fields in FormSection with title/description
✓ **Accessible Toggles** — Toggles with info banners explaining impact
✓ **Warehouse Linking** — Select shows warehouse descriptions or "No warehouses" message
✓ **Confirmation Dialogs** — Cancel button confirms if form is dirty
✓ **Error Messages** — Clear, actionable error messages in FormMessage

---

## Files to Create

**New Components (9 files):**
1. `src/components/form/form-section.tsx` (enhanced)
2. `src/components/form/form-grid.tsx` (enhanced)
3. `src/components/form/gstin-input.tsx`
4. `src/components/form/segmented-policy-control.tsx`
5. `src/components/form/toggle-with-banner.tsx`
6. `src/components/form/invoice-preview.tsx`
7. `src/components/form/read-only-badge.tsx`
8. `src/components/outlets/outlet-form.tsx`
9. `src/components/warehouses/warehouse-form.tsx`

**Files to Update (14 files):**
- All 4 outlet pages (admin/master-data create/edit)
- All 4 warehouse pages (admin/master-data create/edit)
- `src/validations/outlet.validation.ts`
- `src/validations/warehouse.validation.ts`
- `src/actions/outlets/index.ts`
- `src/actions/warehouses/index.ts`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/button.tsx`

---

## Success Criteria

✓ All 8 create/edit pages (4 outlet + 4 warehouse) use unified components
✓ Form validation matches spec exactly
✓ Read-only fields lock correctly based on data state
✓ GSTIN validation with 3-state badges
✓ Batch tracking warnings show/hide correctly
✓ Styling consistent across all pages (rounded-2xl, h-14, emerald focus ring)
✓ Business owner can easily understand field state and requirements
✓ Responsive on mobile, tablet, desktop
✓ QA testing all edge cases passes

---

## Notes

- **Prisma Schema Alignment:** No schema changes needed; all fields exist in Outlet/Warehouse models
- **Server Actions:** Existing withErrorHandler pattern maintained
- **Toast Notifications:** Use existing sonner integration for success/error messages
- **Styling:** Replaces manual HTML forms in Admin pages with shadcn/ui for consistency
- **Component Reuse:** FormSection, FormGrid shared across outlet and warehouse forms
- **Future Extension:** Warehouse "Type" section left space for future classification fields (e.g., "Primary", "Backup", "Cold Storage")

