# Party Management Implementation Plan

**Status**: Ready for implementation
**Scope**: Sidebar reorganization + Customer and Vendor screens (list, create/edit, detail, ledger)

---

## Sidebar Reorganization

**File**: `src/components/layout/sidebar.tsx`

- Create a new `PARTIES` navigation group
- Move Customers from the `SALES` group to `PARTIES` (remove from SALES to avoid duplication)
- Add Vendors to `PARTIES`
- Icons: `Users` (Customers), `Truck` (Vendors)
- Verify icons render correctly in collapsed sidebar mode

---

## Customer Management

### 1. List Page — `/dashboard/sales/customers`

**Filters:**
- Search: name, phone, GSTIN
- Type: B2B / B2C
- Status: Active / Inactive
- Has Overdue toggle
- State dropdown (Indian states)

**Columns:**
| Column | Notes |
|---|---|
| Name | |
| Type | B2B / B2C badge |
| Phone | |
| GSTIN | B2B customers only |
| State | |
| Credit Limit | ₹ |
| Outstanding | ₹ — total unpaid |
| Overdue | ₹ — separate from Outstanding; past due date only |
| Status | Active / Inactive badge |
| Actions | |

**Row actions:** View, Edit, New Invoice, Record Payment, Ledger

**Business rule:** Inactive customers must be **hidden from the invoice creation SearchSelect** — enforced at the query level, not just on this list page.

---

### 2. Create Page — `/dashboard/sales/customers/new` (full page)

**Section 1 — Basic Info:**
- Name (required)
- Type: B2B / B2C (required)
- GSTIN (required if B2B) — validate on blur, auto-fill State from prefix (digits 1–2), show green/red badge
- PAN
- Phone (required)
- Email
- Contact Person

**Section 2 — Address:**
- Address lines
- City
- State (required)
- PIN

**Section 3 — Credit / Balance:**
- Credit Period (days)
- Credit Limit (₹)
- Opening Balance (₹) — editable only until the first invoice is posted

---

### 3. Edit — `/dashboard/sales/customers/[id]/edit` (SlideOver, lg)

Same fields as Create.

**Opening Balance field:**
- Rendered as read-only with a tooltip if `openingBalanceLocked = true`
- Server action must **throw** if an opening balance edit is attempted after `openingBalanceLocked = true` — UI enforcement alone is insufficient

---

### 4. Detail Page — `/dashboard/sales/customers/[id]`

**Header:** Name, type badge, GSTIN, State, phone, email, contact person
**Actions:** Edit, New Invoice, Record Payment

**Summary cards (4):**
1. Total Billed (this FY)
2. Total Received (this FY)
3. Outstanding
4. Overdue

**Open Invoices table:**
| Column | Notes |
|---|---|
| Invoice No | |
| Date | |
| Due Date | |
| Total | ₹ |
| Paid | ₹ |
| Outstanding | ₹ |
| Days Overdue | Integer; display in red |
| Actions | Pay button, View button |

**Invoice History:** Collapsible section — all invoices including paid and cancelled

**Payment History:** RCP- series receipts — Date, Mode, Amount, Reference, Against Invoice

---

### 5. Customer Ledger — `/dashboard/sales/customers/[id]/ledger`

**Filters:**
- Date Range (default: current financial year)
- Entry Type (multi-select): OPENING, INVOICE, PAYMENT, CREDIT_NOTE, ADJUSTMENT

**Columns:**
| Column | Notes |
|---|---|
| Date | |
| Description | Links to source document |
| Type | Badge |
| Debit (₹) | Invoice = Debit (increases what they owe) |
| Credit (₹) | Payment / Credit Note = Credit (reduces what they owe) |
| Balance (₹) | Running balance — computed on-the-fly, never stored |

**Summary strip:**
- Opening Balance
- Total Invoiced
- Total Received
- Closing Balance
- Overdue

**Actions:** Export to Excel, Print Statement (Customer Account Statement PDF), Record Payment

---

## Vendor Management

### 1. List Page — `/dashboard/purchase/vendors`

**Filters:**
- Search: name, phone, GSTIN
- Has Overdue toggle
- State dropdown (Indian states)
- *(No Type filter — vendors are not split B2B/B2C)*

**Columns:**
| Column | Notes |
|---|---|
| Name | |
| GSTIN | |
| State | |
| Credit Period | e.g. "30 days" |
| Outstanding | ₹ — what WE owe THEM (payable direction) |
| Overdue | ₹ — past due date only |
| Status | Active / Inactive badge |
| Actions | |

**Row actions:** View, Edit, New PO, Record Payment, Ledger

**Business rule:** Inactive vendors must be **hidden from the PO creation SearchSelect** — enforced at query level.

---

### 2. Create Page — `/dashboard/purchase/vendors/new` (full page)

**Section 1 — Basic Info:**
- Name (required)
- GSTIN — validate on blur, auto-fill State from prefix
- PAN
- Phone (required)
- Email
- Contact Person

**Section 2 — Address:**
- Address lines
- City
- State (required — needed for GST type on bills)
- PIN

**Section 3 — Credit / Balance:**
- Credit Period (days)
- Opening Balance (₹) — editable only until the first purchase bill is posted

**Section 4 — Bank Details:**
- Bank Name
- Account Holder
- Account Number
- IFSC (validate: 11-character format — 4 alpha + 0 + 6 alphanumeric)
- *(Used as reference when recording payments — not used for automated transfers)*

---

### 3. Edit — `/dashboard/purchase/vendors/[id]/edit` (SlideOver, lg)

Same fields as Create, including Bank Details section.

**Opening Balance field:**
- Read-only with tooltip if `openingBalanceLocked = true`
- Server action must throw if opening balance edit is attempted after lock

---

### 4. Detail Page — `/dashboard/purchase/vendors/[id]`

**Header:** Name, GSTIN, State, phone, email, contact person
**Actions:** Edit, New PO, Record Payment

**Summary cards (4):**
1. Total Purchased (this FY)
2. Total Paid (this FY)
3. Outstanding (we owe)
4. Overdue

**Open Bills table:**
| Column | Notes |
|---|---|
| Bill No | |
| Vendor Invoice No | |
| Bill Date | |
| Due Date | |
| Total | ₹ |
| Paid | ₹ |
| Outstanding | ₹ |
| Days Overdue | Integer; display in red |
| Actions | Pay button, View button |

**Purchase History:** Collapsible section — all bills

**Payment History:** PMT- series — Date, Mode, Amount, Reference, Against Bill

---

### 5. Vendor Ledger — `/dashboard/purchase/vendors/[id]/ledger`

**⚠️ CRITICAL: Orientation is REVERSED vs Customer Ledger**

| Event | Customer Ledger | Vendor Ledger |
|---|---|---|
| Invoice / Bill posted | **Debit** (they owe more) | **Credit** (we owe more) |
| Payment / Receipt | **Credit** (debt reduces) | **Debit** (liability reduces) |

If both ledgers are built from the same template without flipping orientation, vendor balances will have the wrong sign.

**Filters:**
- Date Range (default: current financial year)
- Entry Type (multi-select): OPENING, PURCHASE_BILL, PAYMENT, DEBIT_NOTE, ADJUSTMENT

**Columns:**
| Column | Notes |
|---|---|
| Date | |
| Description | Links to source document |
| Type | Badge |
| Debit (₹) | Payment made = Debit (reduces liability) |
| Credit (₹) | Purchase Bill = Credit (increases liability) |
| Balance (₹) | Running balance — computed on-the-fly, never stored |

**Summary strip:**
- Opening Balance
- Total Purchased
- Total Paid
- Closing Balance
- Overdue

**Actions:** Export to Excel, Print Statement, Record Payment

---

## What Does NOT Exist

- **Auto-Pay** for vendors — not in FRD, do not implement. The correct action is "Record Payment" (manual entry).

---

## Opening Balance Lock — Both Parties

`openingBalanceLocked` must be set to `true` when:
- **Customer**: first invoice is posted against this customer
- **Vendor**: first purchase bill is posted against this vendor

Enforcement must happen in **two places**:
1. UI: field renders as read-only with explanatory tooltip
2. Server action: throws an error if edit is attempted with lock active

---

## Verification Checklist

### Sidebar
- [ ] PARTIES group visible with correct icons
- [ ] Customers no longer appears under SALES
- [ ] Vendors link points to `/dashboard/purchase/vendors`
- [ ] Collapsed sidebar shows icons correctly

### Customers
- [ ] GSTIN search returns matching customer
- [ ] Creating B2C customer hides GSTIN field; State still required
- [ ] GSTIN validation derives correct state (e.g. `27` → Maharashtra)
- [ ] Opening balance field becomes read-only after first invoice is posted
- [ ] Server action rejects opening balance edit after lock
- [ ] Inactive customer does not appear in invoice creation SearchSelect
- [ ] `Outstanding` and `Overdue` are separate columns with different values
- [ ] Customer ledger running balance equals `outstandingBalance` on summary cards
- [ ] Ledger Debit/Credit direction: invoice adds to balance, payment reduces it
- [ ] Export Excel produces correct ledger for selected date range
- [ ] Duplicate customer name in same outlet is rejected

### Vendors
- [ ] Auto-Pay does NOT exist — verify it is not implemented
- [ ] Opening balance locks after first purchase bill is posted
- [ ] Server action rejects opening balance edit after lock
- [ ] Inactive vendor does not appear in PO creation SearchSelect
- [ ] IFSC validated (11-character format)
- [ ] Vendor ledger orientation is REVERSED vs customer ledger:
  - Purchase bill = Credit (balance increases)
  - Payment = Debit (balance decreases)
- [ ] Vendor ledger running balance equals `outstandingBalance` on summary cards
- [ ] Duplicate vendor name in same outlet is rejected

---

## Implementation Sequence

1. **Sidebar** — `src/components/layout/sidebar.tsx`
2. **Schema / Prisma** — ensure `openingBalanceLocked` field exists on Party model for both customer and vendor types
3. **Server actions** — customers (`src/actions/sales/customers.ts`), vendors (`src/actions/purchase/vendors.ts`)
4. **List pages** — customers, vendors (with correct column sets and filter sets)
5. **Create / Edit forms** — Section 1–3 for customers, Section 1–4 for vendors
6. **Detail pages** — customers/[id], vendors/[id]
7. **Ledger pages** — customers/[id]/ledger (Debit=Invoice), vendors/[id]/ledger (Credit=Bill)
8. **SearchSelect guard** — inactive party filter at query level for invoice and PO creation
9. **Opening balance lock** — UI + server action enforcement for both party types
