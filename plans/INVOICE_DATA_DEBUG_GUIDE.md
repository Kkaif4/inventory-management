# Invoice Data Debug Guide

## Problem
Transactions page showing "No records found" even after creating invoices.

**Data Count:** 0 (but invoices should exist)

---

## What We Added: Comprehensive Logging

### Server-Side Logs
Added detailed logging throughout the flow to track data:

#### 1. Page Load (`SalesTransactionsPage`)
```typescript
[SalesTransactionsPage] Page loaded:
  - currentOutletId: outlet_id_123
  - searchParams: { tab: 'invoices' }
  - tab: invoices, search: "", status: ALL
```

#### 2. Invoice Fetch (`getSalesInvoicesPaginated`)
```typescript
[getSalesInvoicesPaginated] Fetching invoices:
  - outletId: outlet_id_123
  - page: 1, limit: 10
  - search: none
  - status: ALL
  
[getSalesInvoicesPaginated] WHERE clause: { AND: [...] }

[getSalesInvoicesPaginated] Results: 5 total, 5 on this page
[getSalesInvoicesPaginated] First invoice: { id: '...', txnNumber: 'INV-001', ... }
```

#### 3. Invoice Creation (`createSalesInvoice`)
```typescript
[createSalesInvoice] Creating invoice:
  - outletId: outlet_id_123
  - txnNumber: INV-001
  - billType: NO1
  - items: 3

[createSalesInvoice] ✅ Invoice created successfully:
  - invoiceId: invoice_id_123
  - txnNumber: INV-001
  - status: POSTED
  - outletId: outlet_id_123
```

#### 4. Client-Side Logs (`SalesTransactionsClient`)
```typescript
[TransactionsClient] Tab: invoices, Data count: 5, Initial pagination: { page: 1, limit: 10, total: 5, ... }
```

---

## How to Debug

### Step 1: Check Server Console/Logs

When you load the transactions page:

1. **Open Next.js Dev Console** (Terminal where you ran `npm run dev`)
2. Look for logs starting with:
   - `[SalesTransactionsPage]`
   - `[getSalesInvoicesPaginated]`
   - `[TransactionsClient]`

3. **Expected output:**
   ```
   [SalesTransactionsPage] Page loaded:
     - currentOutletId: clg9g6d7q0000n4n9g8g9h7q2
   
   [getSalesInvoicesPaginated] Fetching invoices:
     - outletId: clg9g6d7q0000n4n9g8g9h7q2
     - page: 1, limit: 10
   
   [getSalesInvoicesPaginated] Results: 5 total, 5 on this page
   ```

---

### Step 2: Create an Invoice & Watch Logs

1. **Create a new invoice** via `/dashboard/sales/invoices/new`
2. Watch the server console for:

   ```
   [createSalesInvoice] Creating invoice:
     - outletId: clg9g6d7q0000n4n9g8g9h7q2
     - txnNumber: INV-001
   
   [createSalesInvoice] ✅ Invoice created successfully:
     - invoiceId: clh8d7k2p0000m7q8n4g5h2j1
     - txnNumber: INV-001
     - status: POSTED
     - outletId: clg9g6d7q0000n4n9g8g9h7q2
   ```

3. **Go back to transactions page** and watch for:
   ```
   [getSalesInvoicesPaginated] Results: 6 total, 6 on this page
   ```

---

### Step 3: Use the Debug Action (Development Only)

We created a debug action to inspect the database directly.

**File:** `src/actions/debug/index.ts`

**Usage:** Call from a server component or API route:

```typescript
import { debugTransactionsForOutlet } from "@/actions/debug";

const result = await debugTransactionsForOutlet("outlet_id_123");
```

**Output in console:**
```
🔍 [DEBUG] Transactions for outlet: outlet_id_123

Outlet: { id: 'outlet_id_123', name: 'Main Store' }

All transactions for outlet (last 20):
┌─────────┬──────────────┬───────────┬────────────┬──────────────┐
│ (index) │ type         │ txnNumber │ date       │ grandTotal   │
├─────────┼──────────────┼───────────┼────────────┼──────────────┤
│ 0       │ 'SALES_INVOICE' │ 'INV-001' │ 2026-04-01 │ 5000         │
│ 1       │ 'SALES_INVOICE' │ 'INV-002' │ 2026-03-30 │ 3500         │
└─────────┴──────────────┴───────────┴────────────┴──────────────┘

Counts by type:
  SALES_INVOICE: 5
  CREDIT_NOTE/STOCK_RETURN: 0

System-wide stats:
  Total outlets: 3
  Total SALES_INVOICE transactions: 12
```

---

## Diagnostic Checklist

### Issue: Data Count = 0

Check in this order:

#### ✓ 1. Are Invoices Being Created?
**Log to check:**
```
[createSalesInvoice] ✅ Invoice created successfully
```

**If NOT present:**
- Invoice creation is failing silently
- Check form submission errors
- Check for validation errors

#### ✓ 2. Is the Outlet ID Correct?
**Verify:**
- Current outlet in logs: `currentOutletId: <ID>`
- Created invoice logs: `outletId: <ID>`
- These MUST match

**If they don't match:**
- Session is returning wrong outlet
- Check user's outlet assignment in database

#### ✓ 3. Is the Invoice in the Right Status?
**Check logs:**
```
[getSalesInvoicesPaginated] WHERE clause: { AND: [{ type: 'SALES_INVOICE' }, { outletId: '...' }] }
```

**If no invoices returned but they exist:**
- Invoices might be in wrong status
- Check database: `SELECT status FROM "Transaction" WHERE type='SALES_INVOICE'`

#### ✓ 4. Are There Any Filter Issues?
**Check logs:**
```
[getSalesInvoicesPaginated] Fetching invoices:
  - status: ALL
  - search: none
```

**If status is something other than "ALL":**
- Only invoices with that status show
- Check status in database

---

## Database Queries (PostgreSQL)

If you want to check directly:

```sql
-- Check if invoices exist for YOUR outlet
SELECT COUNT(*) 
FROM "Transaction" 
WHERE type = 'SALES_INVOICE' 
AND "outletId" = 'your_outlet_id';

-- See first 5 invoices
SELECT id, "txnNumber", type, status, "outletId", date, "grandTotal"
FROM "Transaction"
WHERE type = 'SALES_INVOICE'
ORDER BY date DESC
LIMIT 5;

-- Check all outlets
SELECT id, name FROM "Outlet";

-- Count invoices per outlet
SELECT "outletId", COUNT(*) as count
FROM "Transaction"
WHERE type = 'SALES_INVOICE'
GROUP BY "outletId";
```

---

## Log Output Example (Working State)

### User creates invoice `INV-001`:

```
[createSalesInvoice] Creating invoice:
  - outletId: clg9g6d7q0000n4n9g8g9h7q2
  - txnNumber: INV-001
  - billType: NO1
  - items: 2

✅ Transaction created
✅ Stock updated
✅ Accounting entries posted

[createSalesInvoice] ✅ Invoice created successfully:
  - invoiceId: clh8d7k2p0000m7q8n4g5h2j1
  - txnNumber: INV-001
  - status: POSTED
  - outletId: clg9g6d7q0000n4n9g8g9h7q2

revalidatePath("/dashboard/sales/invoices")
revalidatePath("/dashboard/sales/transactions")
```

### User navigates to transactions:

```
[SalesTransactionsPage] Page loaded:
  - currentOutletId: clg9g6d7q0000n4n9g8g9h7q2
  - searchParams: { tab: 'invoices' }
  - tab: invoices, search: "", status: ALL

[getSalesInvoicesPaginated] Fetching invoices:
  - outletId: clg9g6d7q0000n4n9g8g9h7q2
  - page: 1, limit: 10
  - search: none
  - status: ALL

[getSalesInvoicesPaginated] WHERE clause: { 
  AND: [
    { type: 'SALES_INVOICE' }, 
    { outletId: 'clg9g6d7q0000n4n9g8g9h7q2' }
  ] 
}

[getSalesInvoicesPaginated] Results: 6 total, 6 on this page
[getSalesInvoicesPaginated] First invoice: {
  id: 'clh8d7k2p0000m7q8n4g5h2j1',
  txnNumber: 'INV-001',
  date: 2026-04-01T10:30:00Z,
  grandTotal: 5000,
  status: 'POSTED',
  isInformal: false,
  billType: 'NO1',
  party: { id: '...', name: 'Acme Corp' }
}

[Transactions] Final tabData for tab="invoices": 6 records
[Transactions] Outlet: clg9g6d7q0000n4n9g8g9h7q2, Pagination: page=1, limit=10

[TransactionsClient] Tab: invoices, Data count: 6, Initial pagination: {
  page: 1, limit: 10, total: 6, totalPages: 1,
  hasNextPage: false, hasPrevPage: false, skip: 0
}
```

### In browser, transactions page displays 6 invoices ✅

---

## Removing Debug Logs (Production)

Once fixed, remove console.logs from:
- `src/actions/sales/sales-invoice.ts` (lines with `console.log`)
- `src/actions/sales/returns/index.ts` (lines with `console.log`)
- `src/app/dashboard/sales/transactions/page.tsx` (lines with `console.log`)
- `src/app/dashboard/sales/transactions/sales-transactions-client.tsx` (lines with `console.log`)

Keep `src/actions/debug/index.ts` for future troubleshooting (mark as development-only).

---

## Summary

**Added comprehensive logging to diagnose:**
1. ✓ Page load (outlet, tab, params)
2. ✓ Invoice fetch (query, results, pagination)
3. ✓ Invoice creation (outlet, status)
4. ✓ Returns fetch (query, results)
5. ✓ Client-side data sync (props, state)

**Also added:**
- `debugTransactionsForOutlet()` - Query database directly
- Better error messages
- Validation logging

**To diagnose:** Check server console logs when creating and viewing invoices
