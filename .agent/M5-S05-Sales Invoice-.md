# FRD — Sales Invoice (M05-S05)
**Industrial Equipment & Hardware ERP**
Version 1.0

---

## 1. Overview

The Sales Invoice is the legal GST tax document of the system. It is the only transaction that simultaneously reduces stock, creates accounting journal entries, updates the customer's outstanding balance, and contributes to GST filing (GSTR-1).

This screen also houses the **Raw Cash Bill** (No.2 Bill / Direct POS Sale) as an optional mode — a stripped-down quick billing flow that only reduces stock with zero accounting impact. This mode is hidden by default and must be explicitly enabled per outlet in Settings.

---

## 2. Raw Cash Bill Feature — Outlet Setting

### Setting location
**Outlet Settings → Billing → Allow Raw Cash Bills**

| Setting | Type | Default | Scope |
|---|---|---|---|
| Allow Raw Cash Bills | Toggle | **OFF** | Per outlet |

### Default behaviour (toggle OFF)

When the toggle is OFF for an outlet:
- The bill type selector does not appear on the invoice form
- Every bill created at this outlet is a No.1 (legal) invoice — no choice, no mode switching
- The "Direct POS Sale" sidebar item is hidden for users of this outlet
- The CM- number series is never used
- The Cash Memo Report under Reports shows no data for this outlet

This is the correct default for most businesses. A business that wants proper accounting and GST compliance should never accidentally create a raw bill.

### Enabled behaviour (toggle ON)

When the toggle is ON:
- A **Bill Type selector** appears at the top of the invoice create form
- The "Direct POS Sale" sidebar item becomes visible for users assigned to this outlet
- Both INV- and CM- number series are active
- The Cash Memo Report becomes populated for this outlet

### Who can change this setting
Admin role only. The change takes effect immediately for all users of that outlet. Changing from ON to OFF does not affect existing posted cash memos — they remain in the system as read-only records.

---

## 3. Sales Invoice Screen

**Route:** `/sales/invoices` (list) · `/sales/invoices/new` (create) · `/sales/invoices/[id]` (detail)
**Access:** Sales, Admin (create/edit) · Accountant (view only)

---

## 4. Invoice List

**Purpose:** View all invoices and credit notes for the active outlet in one place.

### Type toggle (top of list)
```
[ All ]  [ Invoices ]  [ Returns / Credit Notes ]
```
Default: All. Returns and Credit Notes live here — not in a separate screen.

### Filters

| Filter | Type | Default |
|---|---|---|
| Search | Text | Invoice no. or customer name |
| Date Range | DateRangePicker | This month |
| Status | Multi-select | All |
| Customer | SearchSelect | All |

### Table columns

| Column | Notes |
|---|---|
| Invoice No. | INV- series. Monospace. Links to detail. |
| Type | Invoice (blue) / Credit Note (red) badge |
| Date | DD/MM/YYYY |
| Customer | Linked customer name. "Walk-in" for B2C cash sales. |
| GST Type | CGST+SGST or IGST pill. Auto-determined. |
| Total (₹) | Grand total including GST |
| Status | Draft / Posted / Partially Paid / Paid / Return Raised / Cancelled |
| Actions | View · Record Payment · Raise Return · Download PDF · Cancel |

### Row actions by status

| Status | Actions |
|---|---|
| Draft | Edit · Post · Cancel |
| Posted | View · Record Payment · Raise Return · Download PDF · Cancel |
| Partially Paid | View · Record Payment · Raise Return · Download PDF |
| Paid | View · Raise Return · Download PDF |
| Cancelled | View only |

---

## 5. Create Invoice Form

**Route:** `/sales/invoices/new`

---

### Step 0 — Bill Type Selector

**Shown only when:** outlet setting "Allow Raw Cash Bills" = ON.

**When shown:**
```
Bill Type:
  ● No.1 Bill — Legal tax invoice  (accounts + stock + GST)
  ○ No.2 Bill — Raw cash memo      (stock only, no accounts)
```

Rules:
- Default selection is always No.1 Bill — user must actively choose No.2
- Cannot be changed after the first line item is added
- When No.2 is selected: the form immediately hides all GST, customer, and accounting fields
- When outlet setting is OFF: this selector does not render at all. Form always behaves as No.1 Bill.

---

### Part A — No.1 Bill Form (Legal Invoice)

This is the full form. Every field below is part of the No.1 Bill.

#### Header fields

| Field | Required | Validation / Notes |
|---|---|---|
| Invoice No. (auto) | — | INV-[FY]-[####]. Outlet series. System-generated, read-only. |
| Date | Yes | Default: today. Cannot be before the outlet's financial year start. |
| Customer | B2B: required · B2C: optional | SearchSelect async. Linked to customer master. |
| Cash Sale toggle | — | Toggle. When ON: customer field is hidden, GSTIN hidden, customer set to Walk-in internally. |
| GSTIN (customer) | B2B only | Auto-filled from customer record when customer is selected. Read-only. Hidden when Cash Sale is ON. |
| Place of Supply | Auto | Auto-derived from customer state. Editable override if needed. Hidden when Cash Sale is ON. |
| GST Type indicator | Auto, read-only | Calculated pill — never a user input. See logic below. |
| Source document | No | Link to Quotation / Proforma / Challan if this invoice is a conversion. Auto-filled if opened via Convert button. |
| Notes | No | Printed on the invoice footer. Max 300 chars. |

#### GST type auto-detection logic

```
Compare: outlet.state  vs  customer.state

Same state   →  CGST + SGST  →  pill shows "[CGST + SGST — Intra-state]"
Diff state   →  IGST          →  pill shows "[IGST — Inter-state]"

If customer state is missing:
  →  Show warning: "Customer state is not set. GST type cannot be determined.
     Update the customer record before posting."
  →  Post is blocked until resolved.

If Cash Sale is ON:
  →  GST type defaults to outlet's own state = intra-state (CGST + SGST).
  →  Pill still shown as read-only info.
```

The user never touches this. It is always system-determined.

#### Credit limit live indicator

Shown below the customer field on No.1 bills only. Updates in real-time as line items are added.

```
Normal    :  Credit: ₹6,200 used of ₹10,000 (62%)   [grey bar]
Warning   :  Credit: ₹8,800 used of ₹10,000 (88%)   [amber bar]
Exceeded  :  ⚠ Credit limit exceeded by ₹1,500       [red bar]
No limit  :  (nothing shown — customer has no credit limit set)
```

On Post — behaviour depends on outlet/system setting:

| Setting | Behaviour |
|---|---|
| Block | Hard stop. Cannot post. Error: "Credit limit exceeded. Limit: ₹10,000. Outstanding: ₹9,500. This bill: ₹2,000." |
| Warn | Confirmation dialog: "This bill will exceed [Customer]'s credit limit by ₹1,500. Post anyway?" Sales or Admin can confirm. |
| Ignore | No check at all. |

Credit limit is **never checked** on No.2 Bills.

#### Line items table

| Column | Type | Notes |
|---|---|---|
| Product / SKU | SearchSelect (async) | On select: auto-fills HSN, GST%, Sales Unit, Rate (selling price). Shows stock availability inline. |
| HSN | Auto-filled text | Read-only after product selection. Editable if needed (price override permission). |
| Unit | Auto-filled | Sales unit from product settings. Read-only. |
| Qty | Number | > 0. Stock availability shown inline below the field (see below). |
| Rate (₹) | Currency | Auto-filled from variant selling price. Editable only if user has "Price Override" permission. |
| Discount % | Percent | Optional. 0–100. |
| GST % | Auto-filled | From product's HSN code. Fixed slab options only (0, 0.25, 3, 5, 12, 18, 28). |
| Amount | Auto-calculated | (Qty × Rate) − Discount. Read-only. |
| × | Button | Remove line. Minimum 1 line required. |

**Stock availability display (inline, below Qty field):**
- 🟢 `48 Pcs available` — above min stock level
- 🟡 `3 Pcs available (low stock)` — at or below min stock, above zero
- 🔴 `Out of stock` — zero available at outlet's default warehouse

**Batch tracking (when enabled for outlet):**
No batch selection field is shown. FIFO consumption is fully automatic on Post. The user never sees or chooses a batch.

**Negative stock policy on Post:**

| Policy | Behaviour |
|---|---|
| Block | Post prevented if any line item would go below zero. Error listed per item: "Insufficient stock for [SKU]. Available: X, Requested: Y." |
| Warn | Warning dialog lists all items that would go negative. User clicks "Post Anyway" to proceed. Logged in audit trail. |
| Allow | No check. Posts freely even at zero or negative stock. |

Draft invoices are never stock-checked.

#### Tax summary (No.1 only)

Shown right-aligned below line items. Recalculates live as items are added or changed.

```
Subtotal                        ₹12,000
Discount                          -₹800
Taxable Value                   ₹11,200

GST @ 12%   Taxable ₹3,200    CGST ₹192    SGST ₹192
GST @ 18%   Taxable ₹8,000    CGST ₹720    SGST ₹720
              (IGST ₹1,824 shown instead if inter-state)

Total Tax                        ₹1,824
Round Off                          -₹0.40
─────────────────────────────────────────
Grand Total                     ₹13,024
```

For mixed-rate invoices: each GST slab shows as a separate row. This is required for GSTR-1 filing. The system never aggregates different rates into one line.

#### Form actions (No.1 Bill)

| Action | Notes |
|---|---|
| Save Draft | Saves. No stock change. No accounting. Fully editable. |
| Post Invoice | Stock reduced + journal entries created + customer balance updated + added to GSTR-1. Shows confirm dialog. Cannot edit after posting. |
| Print Preview | Modal showing the formatted legal invoice (with GSTIN, HSN, GST breakup). |
| Download PDF | Available after posting. |
| Cancel | Confirm dialog if form is dirty. |

#### On Post — what happens (No.1)

1. Stock reduced at outlet's default warehouse (per FIFO batch order if batch tracking is ON)
2. Journal entries created:
   - Dr Customer Ledger (grand total)
   - Cr Sales Account (taxable value)
   - Cr Output GST CGST (CGST amount) — or Cr Output GST IGST if inter-state
   - Cr Output GST SGST (SGST amount) — or skipped if inter-state
3. Customer outstanding balance increases by grand total
4. Invoice added to GSTR-1 dataset for the filing period
5. Invoice status → Posted

---

### Part B — No.2 Bill Form (Raw Cash Memo)

**Shown only when:** outlet setting "Allow Raw Cash Bills" = ON and user selects No.2 from the bill type selector.

**Design principle:** fastest path to posting. Counter-friendly. Under 30 seconds from open to receipt.

The No.2 form strips everything that is not needed for a quick cash sale. The form literally has fewer fields visible.

#### Header fields (No.2 only)

| Field | Required | Notes |
|---|---|---|
| CM No. (auto) | — | CM-[FY]-[####]. Separate series from INV-. Read-only. |
| Date | Yes | Default: today. |
| Buyer Name | No | Free text. Max 80 chars. NOT linked to customer master. No SearchSelect. |
| Buyer Phone | No | Free text. No format validation. Optional note for reference only. |
| Notes | No | Max 200 chars. |

**Hidden entirely on No.2 form:** Customer SearchSelect, GSTIN, Place of Supply, GST Type indicator, Credit Limit indicator, Source Document field.

#### Line items (No.2 — same columns, fewer)

| Column | Type | Notes |
|---|---|---|
| Product / SKU | SearchSelect (async) | Same as No.1. Stock shown inline. |
| Unit | Auto-filled | Read-only. |
| Qty | Number | > 0. Stock availability shown inline. |
| Rate (₹) | Currency | Auto-fills from selling price. Editable. |
| Discount % | Percent | Optional. |
| Amount | Auto-calculated | Read-only. |
| × | Button | Remove line. |

**Not shown on No.2 line items:** HSN column, GST % column.

**Negative Stock Policy:** Same enforcement as No.1 — Block / Warn / Allow applies equally.

#### Summary (No.2 only)

```
Subtotal     ₹8,500
Discount      -₹500
──────────────────
Total        ₹8,000
```

No tax lines. No GST breakup. No CGST/SGST. Just the amount.

#### Form actions (No.2 Bill)

| Action | Notes |
|---|---|
| Post Bill | Stock reduced only. Zero accounting impact. Shows confirm dialog. |
| Print Receipt | Plain cash memo format. No GSTIN printed. No GST breakup. No HSN. |
| Cancel | Confirm dialog if form is dirty. |

No "Save Draft" on No.2 bills — the form is designed for immediate posting. If the user abandons it, nothing is saved.

#### On Post — what happens (No.2)

1. Stock reduced at outlet's default warehouse (per FIFO batch order if batch tracking is ON)
2. **Nothing else.** No journal entry. No customer ledger update. No GST entry.
3. CM status → Posted

---

## 6. Side-by-Side: What Each Mode Does

| Behaviour | No.1 Bill | No.2 Bill |
|---|---|---|
| Reduces stock | ✅ | ✅ |
| Journal entries created | ✅ | ❌ |
| Customer ledger updated | ✅ | ❌ |
| Customer selection | Required (B2B) / Optional (B2C cash toggle) | ❌ — free text only |
| GST type auto-detected | ✅ | ❌ |
| HSN on line items | ✅ | ❌ |
| GST % on line items | ✅ | ❌ |
| Tax summary shown | ✅ | ❌ |
| In GSTR-1 data | ✅ | ❌ |
| In main Sales Report | ✅ | ❌ |
| In Cash Memo Report | ❌ | ✅ |
| Payment recordable | ✅ | ❌ |
| Return type | Credit Note (reverses accounts + stock) | Stock Return (stock only) |
| Number series | INV- | CM- |
| Draft supported | ✅ | ❌ |
| Available when | Always | Only when outlet setting is ON |

---

## 7. Invoice Detail Page

**Route:** `/sales/invoices/[id]`

Opened from the list by clicking an invoice number.

### Content

- Invoice header: Company name + GSTIN (from Settings), outlet address, invoice number, date
- Customer block: Name, GSTIN (if B2B), billing address, Place of Supply
- GST type indicator (CGST+SGST or IGST)
- Line items table with HSN, qty, rate, discount, GST%, amount
- Tax summary (per slab)
- Grand total
- Bank details (from outlet settings — for payment reference)
- Notes / Terms
- E-Way Bill number field (shown if E-Invoicing is enabled in Settings)

### Actions on detail

| Action | Condition |
|---|---|
| Download PDF | Always |
| Share (WhatsApp / Email / Copy link) | Posted only |
| Record Payment | Posted + outstanding > 0 |
| Raise Return (Credit Note) | Posted only |
| Cancel | Posted + no payments recorded yet |

---

## 8. Accounting Entries Reference

### On Post — No.1 Invoice

| Account | Debit | Credit |
|---|---|---|
| Customer (Debtor) | Grand Total | — |
| Sales Account | — | Taxable Value |
| Output GST CGST | — | CGST amount |
| Output GST SGST | — | SGST amount |

For inter-state (IGST): replace CGST + SGST rows with a single Output GST IGST credit.

### On Post — No.2 Bill

No entries. Zero accounting impact.

---

## 9. Status Flow

```
No.1 Invoice:
  Draft → Posted → Partially Paid → Paid
                 → Return Raised → Fully Returned
                 → Cancelled

No.2 Bill:
  Posted → Return Raised → Cancelled
  (No Draft state)
```

---

## 10. Settings That Control This Screen

| Setting | Location | Effect on Invoice Screen |
|---|---|---|
| Allow Raw Cash Bills | M10 → Outlet Settings → Billing | OFF (default): No.2 mode hidden entirely. ON: bill type selector appears. |
| Negative Stock Policy | M10 → Operational (global) + per outlet | Block / Warn / Allow on Post for both bill types |
| Credit Limit Behaviour | M10 → Operational | Block / Warn / Ignore on No.1 bills at Post |
| Allow Price Override | M09 → per user | ON: user can edit auto-filled selling price. OFF: rate is read-only. |
| Invoice Series Prefix | M10 → Outlet Settings | Prefix for INV- series. CM- series prefix configured separately. |
| Default Warehouse | M10 → Outlet Settings | Where stock is checked and deducted |
| Batch Tracking | M10 → Outlet Settings | When ON: FIFO batch consumption on Post. No user action needed. |
| GST Filing Frequency | M10 → Company Settings | Monthly / Quarterly. Controls which period GSTR-1 data is filed under. |

---

## 11. Number Series

| Bill Type | Format | Example | Resets |
|---|---|---|---|
| No.1 Invoice | INV-[FY]-[####] | INV-2526-0042 | Start of each financial year |
| No.2 Cash Memo | CM-[FY]-[####] | CM-2526-0018 | Start of each financial year |
| Credit Note | CN-[FY]-[####] | CN-2526-0005 | Start of each financial year |

Both series are per outlet. Two outlets can both have INV-2526-0001 — they are distinct.
