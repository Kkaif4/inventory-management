# FRD — M05: Sales & Billing

**Industrial Equipment & Hardware ERP**
Version 1.0 | Simplified

---

## Module Overview

M05 covers everything from raising a bill to tracking what's owed. It handles two fundamentally different bill types, sales returns, quotation conversion, and customer credit enforcement — all designed to be as simple as possible while keeping the books clean.

**Screens in this module:**

| ID      | Name                                          |
| ------- | --------------------------------------------- |
| M05-S01 | Sales Tab — Invoice & Returns List (unified) |
| M05-S02 | Create / Edit Bill (No.1 and No.2 mode)       |
| M05-S03 | Sales Return                                  |
| M05-S04 | Customer Master                               |
| M05-S05 | Quotation — Create & Convert                 |

---

## Core Concept: No.1 Bill vs No.2 Bill

This is the most important design decision in this module. Every bill raised must be one of two types, selected at the top of the create form before anything else.

### No.1 Bill — Legal / Proper Bill

- Full GST-compliant tax invoice
- Affects **both** inventory and accounts
- Appears in GST reports (GSTR-1)
- Updates customer outstanding balance
- Generates accounting journal entries (Dr Customer, Cr Sales, Cr Output GST)
- Printed with GSTIN, HSN codes, tax breakup
- Invoice number from the outlet's legal series (e.g. INV-2025-0042)

### No.2 Bill — Raw / Cash Memo

- Internal cash memo — not a legal tax document
- Affects **inventory only** — stock is reduced
- Does **not** affect accounts — no journal entries, no customer ledger update
- Does **not** appear in GST reports
- **No customer selection at all** — buyer details (name, phone) are free-text fields, optional, typed manually. Not linked to the customer master.
- Printed as a plain "Cash Memo" — no GST breakup, no GSTIN printed
- Separate number series (e.g. CM-2025-0018)
- Has its own **separate reports** — No.2 bills never appear in the main sales report, never mix with No.1 bill totals. Only visible in the "Cash Memo Report" under Reports.
- Used for: quick over-the-counter sales, walk-in buyers, informal transactions where a legal invoice is not needed

### What's the same for both

- Line items (product, qty, rate, discount)
- Stock deduction on posting
- Negative stock policy enforcement (Block / Warn / Allow)
- Printable receipt

### Side-by-side comparison

| Behaviour                    | No.1 Bill                 | No.2 Bill                               |
| ---------------------------- | ------------------------- | --------------------------------------- |
| Reduces inventory            | ✅ Yes                    | ✅ Yes                                  |
| Journal entries created      | ✅ Yes                    | ❌ No                                   |
| Customer balance updated     | ✅ Yes                    | ❌ No                                   |
| Shows in GST reports         | ✅ Yes                    | ❌ No                                   |
| Linked to customer master    | ✅ Yes (required for B2B) | ❌ Never — buyer is free text only     |
| Requires customer GSTIN      | For B2B only              | ❌ Never                                |
| HSN / GST breakup printed    | ✅ Yes                    | ❌ No                                   |
| Invoice number series        | INV- series               | CM- series                              |
| Can be converted to No.1     | N/A                       | ❌ No (one-way)                         |
| Payment can be recorded      | ✅ Yes                    | ❌ No                                   |
| Appears in main sales report | ✅ Yes                    | ❌ No — separate Cash Memo Report only |
| Returns supported            | ✅ Credit Note            | ✅ Stock Return only                    |

---

## Module-Level Rules

1. Every bill belongs to exactly one outlet. The outlet context (from the top navbar) determines the invoice series and the warehouse stock is pulled from.
2. Stock is checked against the outlet's default warehouse at the time of posting.
3. A posted bill (either type) cannot be edited. It can only be cancelled with a reason.
4. No.2 bills cannot be converted to No.1 bills after posting.
5. GST type (CGST+SGST vs IGST) is auto-determined by comparing outlet state with customer state. Users never choose this manually. Applies to No.1 bills only.
6. Negative Stock Policy (Block / Warn / Allow) applies equally to both bill types.
7. Credit limit enforcement applies to No.1 bills only.
8. No.2 bills have no link to the customer master. Buyer name and phone are optional free-text fields — they identify no record in the system.
9. No.2 bills never appear in the main Sales Report, GST reports, or any financial statement. They have their own separate Cash Memo Report.

---

## M05-S01 — Sales Tab: Invoice & Returns (Unified List)

**Route:** `/sales`
**Access:** Sales, Admin, Accountant

### Purpose

Single tab showing all bills and returns together. No separate menus for "Invoices" and "Credit Notes" — everything lives here. The user filters by type if needed.

### Tab-level toggle

At the top of the list, a segmented control:

```
[ All ]  [ GST Invoice ]  [ Informal Invoice ]  [ Returns ]
```

Default: All.

### Filters

| Filter     | Type            | Options                                 |
| ---------- | --------------- | --------------------------------------- |
| Search     | Text            | Invoice number, customer name           |
| Date Range | DateRangePicker | Default: this month                     |
| Status     | Multi-select    | Draft, Posted, Cancelled, Return Raised |
| Customer   | SearchSelect    | Async                                   |

### Table Columns

| Column     | Notes                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Bill No.   | Monospace. INV- prefix for No.1, CM- prefix for No.2, CN- prefix for returns. Links to detail. |
| Type       | Small badge:**No.1** (blue) or **No.2** (amber) or **Return** (red)          |
| Date       | DD/MM/YYYY                                                                                     |
| Customer   | Linked customer name for No.1. For No.2: shows Buyer Name (free text) if entered, else "—"    |
| Items      | Count of line items                                                                            |
| Total (₹) | Grand total                                                                                    |
| Status     | Draft / Posted / Cancelled / Return Raised                                                     |
| Actions    | View, Cancel, Raise Return, Record Payment (No.1 only)                                         |

### Row Actions by status

| Status        | Available Actions                                        |
| ------------- | -------------------------------------------------------- |
| Draft         | Edit, Post, Cancel                                       |
| Posted (No.1) | View, Raise Return, Record Payment, Download PDF         |
| Posted (No.2) | View, Raise Return (stock return only), Download receipt |
| Cancelled     | View only                                                |

---

## M05-S02 — Create / Edit Bill

**Route:** `/sales/new` | `/sales/[id]/edit` (draft only)
**Access:** Sales, Admin

### Step 0 — Bill Type Selection (first thing on the form)

Before any other field is shown, the user picks the bill type. This cannot be changed after the first line item is added.

```
Select Bill Type:
  ● No.1 Bill — Legal tax invoice (affects accounts + stock)
  ○ No.2 Bill — Cash memo (affects stock only)
```

The entire form changes based on this selection. Fields that are irrelevant to No.2 are hidden entirely — not greyed out, hidden.

---

### Header Fields

| Field              | No.1 Bill                        | No.2 Bill                                | Validation                                             |
| ------------------ | -------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| Bill No. (auto)    | INV-[FY]-[####]                  | CM-[FY]-[####]                           | System-generated. Read-only.                           |
| Date               | Required                         | Required                                 | Default: today                                         |
| Customer           | SearchSelect — required for B2B | **Hidden entirely** — not a field | No.2 has no customer link                              |
| Buyer Name         | Not present                      | Optional free text                       | Max 80 chars. Typed manually, not linked to any record |
| Buyer Phone        | Not present                      | Optional free text                       | No format validation — just a note field              |
| Cash Sale toggle   | Available — hides GSTIN if ON   | Not present — always cash               | Toggle                                                 |
| GSTIN (customer)   | Shown for B2B                    | **Hidden entirely**                | Auto-filled from customer record (No.1 only)           |
| Place of Supply    | Auto from customer state         | **Hidden entirely**                | Editable if needed (No.1 only)                         |
| GST Type indicator | Auto-shown: CGST+SGST or IGST    | **Hidden entirely**                | Read-only pill (No.1 only)                             |
| Notes              | Optional                         | Optional                                 | Max 200 chars                                          |

**No.2 Bill form design — keep it fast:**
The No.2 form is intentionally stripped down. The user sees: Date, two optional free-text fields (Buyer Name, Buyer Phone), Notes, and then immediately the line items. No customer search, no GSTIN, no GST type pill. The goal is to post a quick bill in under 30 seconds.

**GST Type Logic (No.1 only):**
Compare `outlet.state` vs `customer.state`. Same state → CGST+SGST. Different state → IGST. If customer state is missing → show warning: *"Customer state not set — GST type cannot be determined. Update the customer record."* Warning blocks posting.

**Credit Limit Check (No.1 only):**
When a customer is selected, the system checks: `customer.outstanding_balance + this_bill_total > customer.credit_limit`. Behaviour depends on the credit limit setting:

- **Block:** Cannot post. *"Credit limit exceeded. Limit: ₹X. Current outstanding: ₹Y."*
- **Warn:** Shows warning, user can proceed with confirmation.
- **Ignore:** No check.
  Credit limit is never checked for No.2 bills.

---

### Line Items Table

Same structure for both bill types. The difference is what happens when the bill is posted.

| Column        | Type                 | Notes                                                                          |
| ------------- | -------------------- | ------------------------------------------------------------------------------ |
| Product / SKU | SearchSelect (async) | On select: auto-fills rate, HSN, GST%, unit                                    |
| HSN           | Auto-filled          | No.1: shown. No.2: hidden                                                      |
| Unit          | Auto-filled          | From product settings                                                          |
| Qty           | Number               | > 0. Shows stock available inline below the field                              |
| Rate (₹)     | Currency             | Auto-filled from selling price. Editable if user has price override permission |
| Discount %    | Percent              | Optional. 0–100                                                               |
| GST %         | Auto-filled          | No.1: shown. No.2: hidden                                                      |
| Amount        | Auto-calculated      | Read-only                                                                      |
| ×            | Button               | Remove row                                                                     |

**Stock availability display (per line item):**
Shown inline below the qty field in small text.

- 🟢 `48 available` — above min stock
- 🟡 `3 available (low)` — at or below min stock threshold
- 🔴 `Out of stock` — zero available

**Negative Stock Policy enforcement on Post:**

| Policy | Behaviour                                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Block  | Posting prevented if any line item would go below zero. Error shown per item:*"Insufficient stock for [SKU]. Available: X, Requested: Y."* |
| Warn   | Warning shown listing all items that would go negative. User confirms to proceed.                                                            |
| Allow  | No check. Posts freely.                                                                                                                      |

Policy applies equally to No.1 and No.2 bills.

---

### Summary Section

**No.1 Bill — Full tax summary:**

```
Subtotal                    ₹8,500
Discount                     -₹500
Taxable Value               ₹8,000

GST @ 12%   Taxable ₹2,000   CGST ₹120   SGST ₹120
GST @ 18%   Taxable ₹6,000   CGST ₹540   SGST ₹540
                         (or IGST if inter-state)

Total Tax                   ₹1,320
Round Off                     -₹0.40
─────────────────────────────────────
Grand Total                 ₹9,820
```

**No.2 Bill — Simple summary:**

```
Subtotal                    ₹8,500
Discount                     -₹500
─────────────────────────────────────
Total                       ₹8,000
```

No tax lines, no GST breakup. Just the amount the customer pays.

---

### Form Actions

| Action        | Behaviour                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Save Draft    | Saves without affecting stock or accounts. Can be fully edited.                                                                                                 |
| Post Bill     | Stock is deducted. For No.1: journal entries created, customer balance updated. For No.2: stock only. Confirm dialog before posting. Cannot edit after posting. |
| Print Preview | Shows the formatted bill in a modal. No.1 shows a legal invoice format with GST. No.2 shows a plain cash memo.                                                  |
| Download PDF  | Available after posting.                                                                                                                                        |
| Cancel        | Confirmation dialog if form has data.                                                                                                                           |

**On Post — what happens:**

*No.1 Bill:*

1. Stock reduced at outlet's default warehouse
2. Journal entries: Dr Customer Ledger (grand total), Cr Sales Account (taxable value), Cr Output GST CGST/SGST/IGST
3. Customer outstanding balance increases
4. Invoice appears in GSTR-1 data
5. Status → Posted

*No.2 Bill:*

1. Stock reduced at outlet's default warehouse
2. Nothing else. No journal entry. No ledger update. No GST entry.
3. Status → Posted

---

## M05-S03 — Sales Return

**Route:** `/sales/returns/new?ref=[billId]` | `/sales/returns/new`
**Access:** Sales, Admin

### Purpose

Handle goods returned by a customer. Behaviour differs by bill type.

| Aspect           | Return against No.1 Bill                       | Return against No.2 Bill        |
| ---------------- | ---------------------------------------------- | ------------------------------- |
| Name             | Credit Note                                    | Stock Return                    |
| Reference        | Must link to original No.1 invoice             | Must link to original No.2 bill |
| Stock effect     | Stock increases (goods come back)              | Stock increases                 |
| Accounting       | Reversal: Dr Sales, Dr Output GST, Cr Customer | None                            |
| Customer balance | Decreases                                      | No effect                       |
| GST report       | Appears in GSTR-1 credit notes section         | Does not appear                 |
| Number series    | CN-[FY]-[####]                                 | SR-[FY]-[####]                  |

### Return Form

**Header Fields:**

| Field             | Type            | Notes                                                     |
| ----------------- | --------------- | --------------------------------------------------------- |
| Return No. (auto) | Text            | CN- or SR- series, system-generated                       |
| Return Date       | DatePicker      | Default: today                                            |
| Return Type       | Auto-determined | Based on the original bill's type                         |
| Original Bill     | SearchSelect    | Required. Search by bill number. Only posted bills shown. |
| Customer          | Auto-filled     | From original bill                                        |
| Reason            | Textarea        | Required. Min 10 chars.                                   |

**Line Items:**
Pre-filled from the original bill. User edits the return qty for each line (cannot return more than originally billed).

| Column              | Notes                                                               |
| ------------------- | ------------------------------------------------------------------- |
| Product / SKU       | From original bill. Read-only.                                      |
| Original Qty        | What was billed. Read-only.                                         |
| Previously Returned | Any prior returns against this bill. Read-only.                     |
| Return Qty          | Editable. Must be > 0 and ≤ (Original Qty − Previously Returned). |
| Rate                | From original bill. Read-only.                                      |
| GST %               | From original bill. No.1 only.                                      |
| Return Amount       | Auto-calculated.                                                    |

**Warehouse:** Returned stock goes back to the outlet's default warehouse. Editable if needed.

**On Post Return:**

*Credit Note (No.1):*

1. Stock increases at selected warehouse
2. Journal entries reversed
3. Customer outstanding balance decreases
4. Credit Note appears in GSTR-1

*Stock Return (No.2):*

1. Stock increases at selected warehouse
2. Nothing else

**Partial Returns:** Supported. Original bill status updates to `Return Raised`. If all items are returned in full, original bill status becomes `Fully Returned`.

---

## M05-S04 — Customer Master

**Route:** `/customers` | `/customers/new` | `/customers/[id]/edit`
**Access:** Sales, Admin, Accountant (read)

### Customer List

**Columns:**

| Column            | Notes                                   |
| ----------------- | --------------------------------------- |
| Name              | Links to detail                         |
| Type              | B2B / B2C badge                         |
| Phone             |                                         |
| Outstanding (₹)  | Red if overdue amount > 0               |
| Credit Limit (₹) | Shows "No Limit" if set to 0            |
| Status            | Active / Inactive                       |
| Actions           | View, Edit, View Ledger, Record Payment |

**Filters:** Search by name or phone, Status (Active/Inactive), Type (B2B/B2C), Has Overdue (Yes/No).

---

### Customer Form

Simple. Two sections.

**Section 1 — Identity:**

| Field         | Required | Notes                                                           |
| ------------- | -------- | --------------------------------------------------------------- |
| Customer Name | Yes      | Max 120 chars                                                   |
| Customer Type | Yes      | B2B (registered) / B2C (unregistered). Default: B2C             |
| GSTIN         | B2B only | 15-char. Validated on blur. Auto-fills State from GSTIN prefix. |
| PAN           | No       | 10-char. Optional.                                              |
| Phone         | Yes      | 10-digit                                                        |
| Email         | No       | Format validated                                                |

**Section 2 — Address & Terms:**

| Field                | Required | Notes                                                                                |
| -------------------- | -------- | ------------------------------------------------------------------------------------ |
| Address              | Yes      | Full address                                                                         |
| City                 | No       |                                                                                      |
| State                | Yes      | Indian states dropdown. Critical for GST type detection.                             |
| PIN                  | No       | 6-digit                                                                              |
| Credit Period (days) | Yes      | Default: 30. Used for due date calculation on invoices.                              |
| Credit Limit (₹)    | No       | Default: 0 (means no limit). When > 0, the credit limit enforcement setting applies. |
| Opening Balance      | No       | Amount the customer owed as of go-live date. Positive = customer owes us.            |

**B2C Customer:** When type = B2C, GSTIN and PAN fields are hidden. State is still required for GST type detection.

---

### Credit Limit Behaviour

Controlled by the setting in M10 Operational Settings: **Credit Limit Behaviour** = Block / Warn / Ignore.

**How it works on invoice creation:**

1. User selects a customer on a No.1 Bill
2. System fetches: `customer.credit_limit`, `customer.outstanding_balance`
3. As line items are added, system recalculates: `projected_total = outstanding_balance + current_bill_total`
4. If `projected_total > credit_limit` and `credit_limit > 0`:
   - A live indicator appears near the customer field: *"Credit: ₹8,200 used of ₹10,000 limit (82%)"*
   - At 100%+ it turns red: *"⚠ Credit limit will be exceeded by ₹1,500"*
5. On **Post**:
   - **Block:** Hard stop. Cannot post. Error message with limit details.
   - **Warn:** Confirmation dialog. *"This bill will exceed [Customer]'s credit limit by ₹1,500. Post anyway?"* Admin or Sales can confirm.
   - **Ignore:** No check at all.

Credit limit is **never checked** for No.2 Bills.

---

### Customer Detail / Ledger View

When a customer record is opened:

- **Summary cards:** Total Billed (this FY), Total Received, Outstanding, Overdue Amount
- **Ledger table:** Date, Description (Invoice / Payment / Credit Note / Opening), Debit, Credit, Balance
- Each ledger row links to the source document
- **Actions:** Edit, Record Payment, Raise Invoice

---

## M05-S05 — Quotation & Conversion

**Route:** `/sales/quotations` | `/sales/quotations/new` | `/sales/quotations/[id]`
**Access:** Sales, Admin

### Purpose

Create a price quote for a customer. A quotation does nothing — no stock, no accounts. It can be converted to a No.1 Bill with one click. It cannot be converted to a No.2 Bill.

### Quotation vs Invoice — Differences Only

| Aspect          | Quotation                | Invoice                    |
| --------------- | ------------------------ | -------------------------- |
| Stock effect    | None                     | Reduces on posting         |
| Accounting      | None                     | Journal entries on posting |
| Number series   | QTN-[FY]-[####]          | INV- or CM- series         |
| Validity date   | Has an expiry date field | Not applicable             |
| Convert to bill | Yes → No.1 Bill only    | N/A                        |
| GST shown       | Yes (for reference)      | Legally binding            |

### Quotation Form

Same as creating a No.1 Bill except:

- No stock availability warnings (just informational — not blocking)
- Validity Date field added (optional, for expiry tracking)
- No "Post" button — only "Save" and "Send"
- Status: Draft / Sent / Converted / Expired / Cancelled

### Convert to Invoice

Button on the Quotation detail page: **"Convert to No.1 Bill"**

On click:

1. Confirmation dialog: *"Convert QTN-2025-0007 to a tax invoice? A new bill will be created pre-filled from this quotation."*
2. On confirm: navigates to `/sales/new` with all quotation data pre-filled (customer, line items, rates)
3. The bill form opens ready to review and post — user can still edit before posting
4. After the bill is posted, quotation status → **Converted** and shows a link to the resulting bill
5. The original quotation is preserved as a read-only record

**Rules:**

- A quotation can only be converted once. Once converted, the "Convert" button is replaced with a link to the resulting bill.
- An expired quotation can still be converted (rates may need updating — user reviews before posting).
- Cancelled quotations cannot be converted.

---

## Negative Stock Policy — Enforcement Summary

This policy is set in M10 Operational Settings and can be overridden per outlet.

| Policy          | Behaviour on Post (both bill types)                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Block** | System checks all line items before posting. If any item would result in negative stock, posting is blocked. Error lists each item with available vs requested qty. User must reduce qty or the bill cannot be posted. |
| **Warn**  | Same check. If any item would go negative, a warning dialog appears listing those items. User can click "Post Anyway" to proceed. Warning is logged in the audit trail.                                                |
| **Allow** | No check. Bill posts freely. Stock can go negative.                                                                                                                                                                    |

**What "negative stock" means:** qty on hand at the outlet's default warehouse < qty being sold on this bill.

For No.1 Bills, the policy applies at time of posting.
For No.2 Bills, the policy applies at time of posting.
Draft bills are never checked (you can save a draft with any qty).

---

## Accounting Entries (No.1 Bill only)

### On Post Invoice

| Account                  | Debit       | Credit        |
| ------------------------ | ----------- | ------------- |
| Customer (Debtor)        | Grand Total | —            |
| Sales Account            | —          | Taxable Value |
| Output GST — CGST       | —          | CGST amount   |
| Output GST — SGST       | —          | SGST amount   |
| (or IGST if inter-state) |             |               |

### On Post Credit Note (Return)

| Account            | Debit         | Credit      |
| ------------------ | ------------- | ----------- |
| Sales Account      | Taxable Value | —          |
| Output GST — CGST | CGST amount   | —          |
| Output GST — SGST | SGST amount   | —          |
| Customer (Debtor)  | —            | Grand Total |

### No.2 Bill

No accounting entries of any kind. Zero journal impact.

---

## Status Reference

| Document     | Possible Statuses                                               |
| ------------ | --------------------------------------------------------------- |
| No.1 Bill    | Draft → Posted → Return Raised → Fully Returned → Cancelled |
| No.2 Bill    | Draft → Posted → Return Raised → Cancelled                   |
| Credit Note  | Posted → Cancelled                                             |
| Stock Return | Posted → Cancelled                                             |
| Quotation    | Draft → Sent → Converted → Expired → Cancelled              |

---

## Settings That Affect M05

| Setting                | Location                                       | Effect                                                                    |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Negative Stock Policy  | M10 Operational (global) + per outlet override | Controls Block/Warn/Allow on posting                                      |
| Credit Limit Behaviour | M10 Operational                                | Block / Warn / Ignore on No.1 bills only                                  |
| GST Filing Frequency   | M10 Company                                    | Monthly/Quarterly — affects GSTR-1 period options                        |
| Allow Price Override   | M09 per user                                   | When OFF, user cannot change the auto-filled selling price                |
| Invoice Series Prefix  | M10 per outlet                                 | Prefix for INV- series (No.1) and CM- series (No.2) configured separately |
| Default Warehouse      | M10 per outlet                                 | Where stock is checked and deducted for both bill types                   |

---

## Cash Memo Report (No.2 Bills — Separate Report)

**Route:** `/reports/cash-memos`
**Access:** Admin, Accountant

No.2 bills have their own dedicated report. They never appear in the main Sales Report, Trial Balance, or any financial statement.

### What this report shows

| Column      | Notes                                                     |
| ----------- | --------------------------------------------------------- |
| CM Number   | Cash memo number. Links to detail.                        |
| Date        |                                                           |
| Buyer Name  | Free-text name entered at billing, or "—" if not entered |
| Buyer Phone | Free-text phone, or "—"                                  |
| Items       | Count                                                     |
| Total (₹)  | Sum of line items after discount. No tax.                 |
| Outlet      | Which outlet issued it                                    |
| Posted by   | User name                                                 |

### Filters

Date range, Outlet, Posted by (user).

### Totals

Footer row shows: total count of cash memos in period, total value in period.
