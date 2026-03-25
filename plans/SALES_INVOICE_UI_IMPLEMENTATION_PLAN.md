# Sales Invoice UI Implementation Plan

**Date:** 2026-03-25
**Status:** Planning
**Scope:** Redesign invoice create/edit forms per detailed field reference spec, improve UX, extract reusable components

---

## Executive Summary

Current invoice implementation (888 lines, monolithic) is feature-complete for NO.1 legal billing but lacks:
- Clean component architecture
- Invoice editing capability
- Advanced field features (GSTIN validation, live preview, read-only states)
- Specialized form components (like we built for outlets/warehouses)
- Draft invoice workflow
- Professional UX patterns per spec

**This plan** will:
1. Extract invoice form into 6 reusable components
2. Implement all 30+ fields with proper validation + state feedback
3. Build specialized components (GSTINInput, GST Type Indicator, Stock Display)
4. Support both create and edit modes
5. Add draft invoice management
6. Ensure all NO.1/NO.2 bill type variations work correctly
7. Follow the same architectural patterns used for outlet/warehouse forms

---

## Current State Assessment

### What Works Well ✅

- Bill type selector (Tabs with visual distinction)
- Product auto-price lookup from customer price list
- GST calculation (inter-state vs intra-state)
- Stock availability display (basic)
- Credit limit tracking (if configured)
- Line item management (add/remove)
- Payment recording with drawer
- Server-side validation + error handling

### What Needs Improvement 🔧

| Issue | Current | Target |
|-------|---------|--------|
| Form Structure | 888-line monolithic component | Split into 6-8 reusable components |
| Invoice Number | System-generated only | Editable before posting (per spec) |
| GSTIN Field | Text input only | Validation badges + state derivation |
| GST Type | Badge display only | Interactive indicator with breakdown |
| Stock Display | Small text "STK: X" | Enhanced UI with status colors, warehouse detail |
| Read-Only States | Fields not locked after posting | Lock with badge explaining why |
| Draft Workflow | "Save Draft" button exists but doesn't work | Full draft → finalize transition |
| Edit Mode | No edit route or page | Full edit form with field locking |
| Line Items | Grid cards (responsive but verbose) | Data table with inline editing |
| Place of Supply | Auto-filled only | Editable with state validation |
| Discount Logic | Line-level only | Support header-level + line-level |
| Rate Override | Always editable | Check user permission + show cost warning |
| Responsive Design | Mobile-first grid layout | Optimized for small screens + large forms |

### Code Quality Debt 🔴

- Multiple `any` type casts throughout form
- No TypeScript strict mode compliance
- No ARIA labels or accessibility features
- Limited error recovery (network errors not handled)
- Pagination missing for large product lists
- Single-threaded account lookups (could cause slowdown)

---

## Implementation Strategy

### Phase 1: Foundation Components (New Components)

Extract reusable form components specific to invoicing:

#### 1.1 GSTINInput Component
**File:** `src/components/form/gstin-input.tsx` (new)

**Features:**
- 15-char validation (like outlet form)
- 3-state badge: ✓ Valid | ✗ Invalid | ⚠ Mismatch
- Auto-derive state from first 2 digits
- Compare against "Place of Supply" field
- If mismatch: show amber badge *"GSTIN suggests Tamil Nadu but Place of Supply is Karnataka"*
- Uppercase conversion

**Usage:** `<GSTINInput value={gstin} onChange={setGstin} placeOfSupply={state} />`

#### 1.2 GSTTypeIndicator Component
**File:** `src/components/form/gst-type-indicator.tsx` (new)

**Features:**
- Read-only pill/badge
- Shows: `[CGST + SGST — Intra-state]` or `[IGST — Inter-state]`
- Color-coded (emerald for intra, blue for inter)
- Expandable to show rate breakdown:
  - "CGST @ X%, SGST @ X% (Total Y%)" or
  - "IGST @ Y%"
- Warning state if cannot be determined (outlet state missing, place of supply missing)
- Cannot be edited directly; changes by editing Place of Supply

**Usage:** `<GSTTypeIndicator outletState={state} placeOfSupply={postate} billType={no1/no2} />`

#### 1.3 StockAvailabilityDisplay Component
**File:** `src/components/form/stock-availability-display.tsx` (new)

**Features:**
- Shows stock status with color coding:
  - 🟢 Green: Stock available (qty available ≥ qty requested)
  - 🟡 Amber: Low stock (qty available < min threshold but > 0)
  - 🔴 Red: Out of stock (qty available = 0)
- Expandable details:
  - Total available in outlet
  - Warehouse-level breakdown (if multiple warehouses)
  - "Recently received" date (if applicable)
- Inline warning if qty > available based on outlet's `negativeStockPolicy`:
  - BLOCK: Red border, prevents save
  - WARN: Amber border, shows warning icon
  - ALLOW: No special styling
- Tooltip on hover: "Available: 48 pcs, Incoming: 12 pcs (due 2026-04-01)"

**Usage:** `<StockAvailabilityDisplay variantId={id} outletId={outlet} requestedQty={qty} policy={block/warn/allow} />`

#### 1.4 InvoiceNumberInput Component
**File:** `src/components/form/invoice-number-input.tsx` (new)

**Features:**
- Text input with format validation
- Displays next suggested number in placeholder: "e.g., INV-2526-0042"
- Real-time validation:
  - Cannot be blank
  - No special chars except `/` and `-`
  - Check duplicate for this outlet + FY (via debounced server call)
- Green badge on valid format
- Red badge if duplicate found
- If editing posted invoice: read-only with lock badge *"Cannot change after posting"*
- Auto-format as user types (e.g., "INV20260042" → "INV-2526-0042")

**Usage:** `<InvoiceNumberInput value={no} onChange={setNo} outlet={outletId} isPosted={bool} />`

#### 1.5 RoundOffInput Component
**File:** `src/components/form/round-off-input.tsx` (new)

**Features:**
- Number input for round-off adjustment
- Range: ±₹1 (or configurable in settings)
- Shows impact on Grand Total in real-time
- Validates: `abs(roundOff) <= 1`
- Read-only after posting

**Usage:** `<RoundOffInput value={roundOff} onChange={setRoundOff} isPosted={bool} />`

#### 1.6 DiscountInput Component (Enhanced)
**File:** `src/components/form/discount-input.tsx` (new or enhance existing)

**Features:**
- Two variants:
  1. **Line-level discount %** (already exists)
  2. **Header-level discount %** (new) — applied to entire subtotal before tax
- Shows:
  - Discount amount in ₹
  - Impact on taxable value
  - Tax change (if header-level)
- Validation:
  - Range: 0–100
  - If user has discount limit set: warn/block if exceeded
  - If rate falls below cost price: show subtle warning
- Editable before posting only

**Usage:** `<DiscountInput value={disc} onChange={setDisc} type="line" maxDiscount={50} costPrice={cost} />`

#### 1.7 SummaryPanel Component (Extract from page)
**File:** `src/components/sales/invoice-summary-panel.tsx` (new)

**Current:** Inline in `/invoices/new/page.tsx`, 200+ lines
**Extract to:** Standalone, reusable, sticky component

**Props:**
```typescript
interface InvoiceSummaryProps {
  billType: 'NO1' | 'NO2';
  itemsTotal: number;
  discount: {
    line: number;      // sum of line-level discounts
    header: number;    // header-level discount amount
  };
  taxableValue: number;
  taxBreakup: {        // NO.1 only
    gst5: { taxable: number; tax: number };
    gst12: { taxable: number; tax: number };
    gst18: { taxable: number; tax: number };
    gst28: { taxable: number; tax: number };
  };
  totalTax: number;
  freightCost: number;
  roundOff: number;
  grandTotal: number;
  isDraft: boolean;
  isPosted: boolean;
}
```

**Features:**
- NO.1: Show itemsTotal, Total Discount, Taxable, GST breakup, Total Tax, Freight, Round Off, Grand Total
- NO.2: Show itemsTotal, Freight, Grand Total (no tax)
- Color-coded: Brand for NO.1, Amber for NO.2
- Sticky positioning: `sticky top-8`
- Submit button: Dynamic text ("Post Invoice" / "Post Cash Bill" / "Update Invoice")
- Save Draft button (NO.1 only, if editing/creating)
- Disabled state: if negative stock (BLOCK policy) or credit limit exceeded

---

### Phase 2: Invoice Form Component (Main Form)

#### 2.1 Create InvoiceForm Component
**File:** `src/components/sales/invoice-form.tsx` (new)

**Props:**
```typescript
interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoice?: Transaction & { items: TransactionItem[] };
  outlets: Outlet[];
  onSubmit: (data: InvoiceFormValues) => Promise<{ success: boolean; error?: any }>;
  onSaveDraft?: (data: InvoiceFormValues) => Promise<{ success: boolean; error?: any }>;
}
```

**Layout:** 3-column grid (left 2/3 form, right 1/3 sidebar)

**Sections:**

#### Section 1: Header / Bill Type
```
[← Back] Generate Sales Invoice (mode: create)
        or Edit Sales Invoice (mode: edit)
────────────────────────────────────
[ NO.1 LEGAL BILL ] [ NO.2 CASH BILL ]
(Tabs selector with icons)

[Info banner for NO.2]
"This creates an informal cash memo. No GST, no customer ledger update."
```

#### Section 2: Dispatch Location
```
┌─ Dispatch Location ────────────────────────────┐
│ From Outlet*             | Invoice Date*        │
│ [locked — selected outlet] | [date input]        │
│                          | Validation: ≥ FY start, ≤ today |
└────────────────────────────────────────────────┘
```

#### Section 3: Invoice Details (NO.1 only for full fields)
```
┌─ Invoice & Bill Details ───────────────────────┐
│ Invoice No.*       | Bill Type          │ [G]  │
│ INV-2526-0042      │ [Pill: NO.1/NO.2]  │      │
│ (editable, validation)                 │      │
│                                        │ GSTIN validation badge  │
└────────────────────────────────────────────────┘

Place of Supply*    (NO.1 only)
[State dropdown, auto-filled from customer]
```

#### Section 4: Customer / Buyer Info
**NO.1 Bills:**
```
┌─ Customer Contract ────────────────────────────┐
│ Customer*          [Search async]              │
│ [Customer dropdown + state badge]              │
│                                                │
│ GSTIN            [GSTIN input + validation]    │
│ (auto-filled from customer, editable)          │
│                                                │
│ GST Type         [Inter-state/Intra-state]     │
│ (read-only badge)                              │
│                                                │
│ Credit Limit     [Progress bar if set]         │
│ ₹50,000 / ₹10,000 (with warning if exceeded)   │
└────────────────────────────────────────────────┘
```

**NO.2 Bills:**
```
┌─ Retail Buyer Info ────────────────────────────┐
│ Buyer Name         [text input, optional]      │
│ Contact Number     [tel input, optional]       │
└────────────────────────────────────────────────┘
```

#### Section 5: Line Items
```
┌─ Items ────────────────────────────────────────┐
│ [Add Line] [Bulk Add] [Paste from Clipboard]   │
├────────────────────────────────────────────────┤
│ Line 1:                                        │
│ Product*    [Search async, show SKU + spec]    │
│ Qty*        [Number] [Unit] [Stock status]     │
│ Rate        [Number] [₹] [Cost warning if <]   │
│ Discount %  [Number, NO.1 only] [= ₹X]        │
│ GST %       [Dropdown, NO.1 only, editable]    │
│ HSN Code    [Read-only, auto-filled]           │
│ Description [Text, auto-filled from variant]   │
│ ─────────────────────────────────────          │
│ Taxable     ₹ X (calculated)                   │
│ Tax         ₹ Y (CGST/SGST or IGST)            │
│ Line Total  ₹ Z                                │
│ [Delete] [Move up] [Move down]                 │
│                                                │
│ [+ Add another line]                           │
└────────────────────────────────────────────────┘

┌─ Header-Level Settings (NO.1 only) ───────────┐
│ Discount % [Number] [= ₹X total discount]     │
│ Freight    [Number] [₹] (added to total)       │
│ Round Off  [Number] [±₹1] (adjustment)        │
└────────────────────────────────────────────────┘
```

#### Section 6: Sidebar — Summary & Actions
```
┌─ Summary Panel (Sticky) ──────────────────────┐
│ Items Total        ₹ X                        │
│ Total Discount     ₹ X (if any)               │
│ Subtotal           ₹ X                        │
│                                               │
│ GST @ 5%   ₹X  (NO.1 only)                   │
│ GST @ 12%  ₹Y                                 │
│ GST @ 18%  ₹Z                                 │
│ GST @ 28%  ₹W                                 │
│ Total GST  ₹ (X+Y+Z+W)                        │
│ ───────────────────────────────────           │
│ Grand Total        ₹ XXXXX                    │
│                                               │
│ [Post Invoice] [Save Draft]                   │
│ (buttons disabled if validation fails)        │
└────────────────────────────────────────────────┘
```

#### 2.2 Page Structure
**Create Page:** `src/app/dashboard/sales/invoices/new/page.tsx` (rewrite, ~100 lines)
- Load outlets, products, parties
- Call `<InvoiceForm mode="create">`
- Handle submit → call `createSalesInvoice()` server action
- On success: redirect to invoice detail or draft list

**Edit Page:** `src/app/dashboard/sales/invoices/[id]/edit/page.tsx` (new, ~100 lines)
- Load invoice with all items, related data
- Call `<InvoiceForm mode="edit" invoice={data}>`
- Show field locking UI (invoice #, date, items locked if posted)
- Handle submit → call `editSalesInvoice()` server action
- On success: show toast "Invoice updated"

---

### Phase 3: Feature Implementation

#### 3.1 Field Validation & Locking

**Before Posting:**
- All fields editable (except calculated fields)
- Bill type locked after first item added
- Invoice number must be unique
- Customer required for NO.1

**After Posting:**
- Invoice no, date, items, customer: locked with badge
- Notes: still editable (no accounting impact)
- Everything else: read-only with visual lock indicator

**Edit Mode Restrictions:**
- If already posted: almost all fields locked
- If draft: most fields editable
- Show warning: "Changing items will recalculate GST and balances"

#### 3.2 Draft Invoice Workflow

**Save Draft Button:**
- Shows on create and edit (NO.1 only)
- Saves invoice with status: "DRAFT"
- Does NOT create accounting entries
- Does NOT update stock
- Allows editing later

**Draft List View:** `src/app/dashboard/sales/invoices/drafts/page.tsx` (new)
- Table with: Invoice No, Date, Customer, Total, Last Modified, Actions
- Quick actions: Edit, Delete, Preview, Post Now
- Bulk action: Post multiple drafts

**Post Draft Workflow:**
- Navigate to draft detail or inline edit
- Review summary
- Click "Post Invoice"
- Same validation as normal create
- Creates accounting entries, updates stock

#### 3.3 Advanced Features

**A. GSTIN State Validation**
- On customer select or GSTIN change: compare GSTIN state vs Place of Supply
- If mismatch: show amber warning in GSTINInput component
- Warn but don't block

**B. Stock Availability**
- Fetch on product select and qty change
- Show in StockAvailabilityDisplay component
- Color-code based on availability
- Show warehouse-level detail if available
- Respect outlet's negativeStockPolicy

**C. Rate Override Permission Check**
- On rate field change: check if user has `overridePriceLimit` permission
- If not: show read-only state, cannot edit
- If yes: allow edit but warn if below cost price

**D. Product Search Optimization**
- Debounced async search (500ms delay)
- Search by: SKU, Product Name, HSN
- Paginate results (first 10, load more on scroll)
- Show: SKU, Product Name, HSN, Current Stock, Last Sold Price

**E. Customer Price List**
- On customer select: check if customer has custom price list
- If yes: use custom rates instead of default variant price
- Show badge: "Using customer rate"
- Allow override

**F. Credit Limit Validation**
- Real-time check as items added
- Show progress bar with warning if exceeded
- Block post if exceeded (unless manager override)

---

### Phase 4: Server Actions & Validation

#### 4.1 Create Sales Invoice

**File:** `src/actions/sales/sales-invoice.ts` (enhance existing)

**New action:** `editSalesInvoice(id, data)`

**Validations:**
```typescript
// Check invoice not already posted
if (invoice.status === 'POSTED') throw ValidationError("Cannot edit posted invoice");

// Check invoice number unique
const dup = await db.transaction.findFirst({
  where: {
    txnNumber: data.invoiceNo,
    outletId: data.outletId,
    id: { not: id }  // exclude self
  }
});
if (dup) throw ValidationError("Invoice number already exists");

// Check customer credit limit (NO.1)
if (data.billType === 'NO1' && data.partyId) {
  const balance = await getPartyBalance(data.partyId);
  if (balance + data.grandTotal > party.creditLimit) {
    throw ValidationError("Credit limit exceeded");
  }
}

// Stock availability check
for (const item of data.items) {
  const available = await getAvailableStock(item.variantId, outlet);
  if (item.quantity > available && outlet.negativeStockPolicy === 'BLOCK') {
    throw ValidationError(`Insufficient stock for ${item.product.name}`);
  }
}
```

#### 4.2 Save Draft Invoice

**New action:** `saveDraftInvoice(data)`

**Similar validations but:**
- Does NOT check credit limit (can exceed as draft)
- Does NOT consume stock
- Sets status = "DRAFT"
- Allows missing items (can be filled later)

---

### Phase 5: UI Polish & Accessibility

#### 5.1 Responsive Design

**Mobile (< 640px):**
- Form in single column
- Grid fields stack vertically
- Line items shown as collapsed cards (tap to expand)
- Summary panel below form (not sticky)
- Buttons full-width

**Tablet (640px - 1024px):**
- Form 2-column where possible
- Line items start to show as mini-table
- Summary sidebar on right (not sticky yet)

**Desktop (> 1024px):**
- Full 3-column layout (form, sidebar)
- Summary panel sticky
- Line items as full data table

#### 5.2 Accessibility

- Add ARIA labels to all inputs
- Announce totals for screen readers
- Keyboard navigation: Tab through fields, Enter to add line
- Color not only indicator (badges have text)
- Focus visible on all buttons/inputs
- Error messages linked to inputs with `aria-describedby`

#### 5.3 Error Handling

- Network errors: Show toast "Network error. Retrying..." with retry button
- Validation errors: Inline per-field + summary at top
- Duplicate invoice no: Real-time feedback (not blocking, just warning)
- Stock issues: Show warning but allow if policy permits
- Credit limit: Block with explanation, show which invoices caused breach

---

## File Structure

### New Components
```
src/components/
├── form/
│   ├── gstin-input.tsx (REUSE from outlet form!)
│   ├── gst-type-indicator.tsx (NEW)
│   ├── stock-availability-display.tsx (NEW)
│   ├── invoice-number-input.tsx (NEW)
│   ├── round-off-input.tsx (NEW)
│   └── discount-input.tsx (NEW, with header-level variant)
└── sales/
    ├── invoice-form.tsx (NEW, unified form)
    ├── invoice-summary-panel.tsx (EXTRACT from page)
    ├── invoice-line-item.tsx (NEW, can be row or card)
    └── invoice-header-section.tsx (NEW, optional split)
```

### Updated Pages
```
src/app/dashboard/sales/invoices/
├── new/page.tsx (REWRITE: ~100 lines using InvoiceForm)
├── [id]/
│   ├── page.tsx (invoice detail, no change)
│   └── edit/page.tsx (NEW, edit form page)
└── drafts/
    └── page.tsx (NEW, draft list view)
```

### Updated Server Actions
```
src/actions/sales/
└── sales-invoice.ts (enhance with editSalesInvoice + saveDraftInvoice)
```

### Updated Validation
```
src/validations/
└── invoice.validation.ts (enhance with edit schemas, draft schemas)
```

---

## Implementation Roadmap

### Week 1: Foundation Components
- [ ] Extract GSTINInput from outlet form (reuse)
- [ ] Create GSTTypeIndicator component
- [ ] Create StockAvailabilityDisplay component
- [ ] Create InvoiceNumberInput component
- [ ] Create RoundOffInput component
- [ ] Enhance DiscountInput for header-level

### Week 2: Form Components
- [ ] Extract SummaryPanel from current page
- [ ] Create InvoiceForm unified component (create + edit modes)
- [ ] Update new/page.tsx to use InvoiceForm
- [ ] Create edit/page.tsx
- [ ] Test bill type switching
- [ ] Test customer/GSTIN auto-fill

### Week 3: Features & Workflows
- [ ] Implement Save Draft functionality
- [ ] Create drafts list page
- [ ] Add draft → post workflow
- [ ] Implement GSTIN state validation
- [ ] Add product search optimization
- [ ] Add customer price list detection

### Week 4: Polish & Testing
- [ ] Responsive design testing
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Error handling + recovery
- [ ] Performance optimization (pagination, debouncing)
- [ ] QA: All bill type variations
- [ ] Build verification + deploy

---

## Success Criteria

✅ All 30+ fields from spec implemented
✅ Create + Edit modes working
✅ Draft workflow functional
✅ NO.1 and NO.2 bill types fully supported
✅ Field locking (read-only after posting) working
✅ GSTIN validation with state derivation
✅ Stock availability display with color coding
✅ GST calculation (inter-state vs intra-state) correct
✅ Credit limit validation working
✅ Rate override permissions checked
✅ Responsive design (mobile/tablet/desktop)
✅ Accessibility compliant (WCAG AA)
✅ Zero TypeScript errors
✅ Build succeeds

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| 888-line form still too large | Hard to maintain | Ensure component split into ≤300 lines max |
| Customer auto-fill lag | UX friction | Implement debounced async search |
| Large product lists slow page | Performance | Paginate dropdown, lazy load on scroll |
| Stock calculations inconsistent | Data integrity | Use same moveStock() service as stock page |
| Edit mode edge cases | Bugs in prod | Comprehensive test matrix for all states |
| Mobile form unwieldy | Mobile user frustration | Test on actual devices, not just browser |

---

## Notes for Next Phase

1. **Component Reuse:** GSTINInput can be reused from outlet form (already built)
2. **Styling Consistency:** Use same rounded-lg, h-14, emerald focus ring as outlet/warehouse forms
3. **Server Actions:** Leverage existing `withErrorHandler()` pattern
4. **Stock Service:** Use existing `moveStock()` from `stock-service.ts` for atomicity
5. **Numbering:** Use existing `NumberingService` for FY-aware sequences
6. **Testing:** Consider adding E2E tests for complex flows (customer change, bill type switch)

