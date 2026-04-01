# 📄 FRD — Expense Management

_(Based on your implementation doc )_

---

# 1. Purpose

The system should allow users to record and manage **business expenses** that:

- Reduce profit
- Do NOT create inventory
- Are paid via cash or bank

---

# 2. Scope

Covers:

- Expense entry
- GST handling (optional)
- Payment tracking
- Expense categorization
- Reporting

Does NOT cover:

- Purchase (inventory)
- Sales

---

# 3. Core Concept

### Expense vs Purchase

- Expense → no stock
- Purchase → creates stock

---

# 4. Expense Structure

Each expense must have:

- Date
- Category
- Amount
- Payment Mode
- Account (Cash / Bank)
- Description

Optional:

- Vendor
- GST details
- Attachment

---

# 5. Expense Categories

- Mandatory for every expense
- Linked to expense accounts (5xxx series)
- Default categories created per outlet

Examples:

- Rent
- Salary
- Electricity
- Fuel
- Misc

---

# 6. Expense Creation Flow

### Step 1 — Enter Details

- Date
- Category
- Description

---

### Step 2 — Payment Info

- Amount
- Payment Mode (Cash / Bank / UPI / Cheque)
- Account selection

---

### Step 3 — GST (Optional)

If GST invoice available:

- Enter taxable amount
- Select GST rate
- System calculates GST

Else:

- Full amount treated as expense

---

### Step 4 — Save

- Expense is immediately **POSTED**
- No draft system

---

# 7. Accounting Logic

### Without GST

```text
Dr Expense Account
Cr Cash/Bank
```

---

### With GST

```text
Dr Expense (taxable)
Dr Input GST
Cr Cash/Bank (total)
```

---

### On Cancel

- Reverse entries
- Mark as CANCELLED

---

# 8. Payment Handling

- Every expense must be linked to an account
- Cash → deduct from cash
- Bank → deduct from bank

---

# 9. Validation Rules

- Category required
- Amount > 0
- Bank account required if not cash
- GST fields required only if GST enabled
- No invalid payment modes

---

# 10. Expense Status

- POSTED → active
- CANCELLED → reversed

---

# 11. UI Flow

## Expense List

- Filter by date, category, payment mode
- Shows:
  - Amount
  - GST
  - Status
  - Vendor

---

## Create Expense

Sections:

1. Details
2. Payment
3. GST (optional)
4. Vendor
5. Attachment

---

## Expense Detail

- Full breakdown
- Journal entries
- Attachment preview

---

# 12. Reports

### 1. Expense Register

- Full list of expenses

---

### 2. Expense by Category

- Total spend per category

---

### 3. GST on Expenses

- ITC from expenses

---

# 13. Impact on System

### P&L

- Expense categories appear under operating expenses

---

### GST Reports

- Expense GST added to ITC

---

### Cash Flow

- Expenses reduce cash/bank

---

# 14. Key Rules

- Expense always reduces money
- No stock impact
- Must be categorized
- Must be linked to account
- GST optional but structured

---

# 15. Summary

This feature ensures:

- Proper expense tracking
- Accurate accounting
- GST compliance
- Clean reporting
