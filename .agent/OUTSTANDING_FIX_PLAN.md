# Fix Plan: Customer Outstanding and Payment Behavior

## Phase 4: Implementation Strategy

### Overview
Fix customer outstanding to be calculated (not denormalized) based on actual invoice dues, with FIFO payment allocation and overpayment handling.

### Key Changes Required

#### 1. Schema Update
**File:** `prisma/schema.prisma`

Add field to Party model:
```prisma
model Party {
  // ... existing fields
  creditBalance Float @default(0)  // Overpayment/advance amount
}
```

Migration: Create migration for this field.

#### 2. New Utility Functions
**File:** `src/actions/sales/customers.ts` (add these)

```typescript
// Calculate total outstanding from actual invoices
async function calculateOutstandingBalance(partyId: string): Promise<number>
  - Sum all SALES_INVOICE with status NOT IN ['CANCELLED', 'DRAFT']
  - Get invoice.grandTotal
  - Subtract sum of payments for each invoice
  - Return total outstanding (must be >= 0)

// Get unpaid invoices ordered by date (FIFO)
async function getUnpaidInvoices(partyId: string): Promise<Invoice[]>
  - Fetch all SALES_INVOICE (except DRAFT/CANCELLED)
  - Calculate outstanding for each = grandTotal - sum(payments)
  - Filter to outstanding > 0
  - Order by date ASC (oldest first)
  - Return with outstanding amount
```

#### 3. Update Invoice Creation
**File:** `src/actions/sales/sales-invoice.ts`

In `createSalesInvoice`, after creating invoice (line 156):
```typescript
// Add this after invoice creation, inside $transaction
if (!isNo2 && data.partyId) {
  await tx.party.update({
    where: { id: data.partyId },
    data: {
      outstandingBalance: {
        increment: grandTotal
      }
    }
  });
}
```

#### 4. Refactor Payment Recording
**File:** `src/actions/sales/payment.ts`

Replace lines 110-120 with new logic:

```typescript
// FIFO Allocation Strategy:
// 1. Get all unpaid invoices for this customer (oldest first)
// 2. Apply payment to oldest first until paid or payment exhausted
// 3. If payment > total due: store excess as creditBalance
// 4. Always prevent outstanding from going negative

const unpaidInvoices = await tx.transaction.findMany({
  where: {
    type: "SALES_INVOICE",
    partyId: invoice.partyId,
    status: { in: ["POSTED", "PARTIALLY_PAID"] },
    outletId: data.outletId
  },
  orderBy: { date: "asc" },
  select: {
    id: true,
    grandTotal: true,
    payments: { select: { amount: true } }
  }
});

// Calculate total outstanding across ALL invoices
let totalOutstanding = 0;
for (const inv of unpaidInvoices) {
  const paid = inv.payments.reduce((a, b) => a + b.amount, 0);
  const outstanding = inv.grandTotal - paid;
  if (outstanding > 0) {
    totalOutstanding += outstanding;
  }
}

// Validate payment won't make outstanding negative
if (data.amount > totalOutstanding + 0.005) {
  // Instead of error, store excess as credit
  const excessAmount = data.amount - totalOutstanding;
  await tx.party.update({
    where: { id: invoice.partyId },
    data: {
      creditBalance: { increment: excessAmount }
    }
  });
  // Process only up to total outstanding
  data.amount = totalOutstanding;
}

// Now decrement outstanding by actual payment
if (invoice.partyId) {
  await tx.party.update({
    where: { id: invoice.partyId },
    data: {
      outstandingBalance: {
        decrement: data.amount
      }
    }
  });
}

// Guard: Ensure outstanding never goes negative
const party = await tx.party.findUnique({
  where: { id: invoice.partyId },
  select: { outstandingBalance: true }
});
if (party && party.outstandingBalance < -0.005) {
  // This should never happen, but catch it
  await tx.party.update({
    where: { id: invoice.partyId },
    data: { outstandingBalance: 0 }
  });
}
```

#### 5. Update Customer Details View
**File:** `src/actions/sales/customers.ts` - `getCustomerDetails()`

In the summary section (around line 192), recalculate outstanding:
```typescript
// Don't use party.outstandingBalance, calculate it fresh
const calculatedOutstanding = roundToTwo(
  allInvoices
    .filter(inv => !["CANCELLED", "DRAFT"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.outstanding, 0)
);

summary: {
  // ... existing
  outstandingBalance: calculatedOutstanding,  // Recalculated, not cached
  // ... existing
}
```

### Testing Strategy

#### Test 1: Invoice Creation Updates Outstanding
```typescript
1. Create customer with outstanding = 0
2. Create invoice for ₹1000
3. Assert customer.outstandingBalance = 1000
```

#### Test 2: Full Payment Reduces Outstanding
```typescript
1. Create invoice ₹1000, outstanding = 1000
2. Record payment ₹1000
3. Assert customer.outstandingBalance = 0
```

#### Test 3: Partial Payment Reduces Outstanding
```typescript
1. Create invoice ₹1000
2. Record payment ₹600
3. Assert customer.outstandingBalance = 400
4. Assert invoice status = PARTIALLY_PAID
```

#### Test 4: Overpayment Creates Credit Balance
```typescript
1. Create invoice ₹1000, outstanding = 1000
2. Record payment ₹1200
3. Assert customer.outstandingBalance = 0 (not negative)
4. Assert customer.creditBalance = 200
5. Assert payment only records ₹1000
```

#### Test 5: FIFO Invoice Allocation
```typescript
1. Create invoice A: ₹1000 (outstanding = 1000)
2. Create invoice B: ₹500 (outstanding = 500)
3. Record payment ₹1200
4. Assert Invoice A: paid = 1000 (fully paid)
5. Assert Invoice B: paid = 200 (outstanding = 300)
6. Assert customer.outstandingBalance = 300
```

#### Test 6: Outstanding Never Negative
```typescript
1. Create customer
2. Attempt to record payment without invoice
3. Assert fails or creates appropriate credit
4. Assert outstandingBalance >= 0
```

### Implementation Order

1. Create Prisma migration for `creditBalance` field
2. Add utility functions to `customers.ts`
3. Update `createSalesInvoice` to increment outstanding
4. Refactor `recordInvoicePayment` with FIFO logic
5. Update `getCustomerDetails` to recalculate outstanding
6. Create test cases
7. Verify existing tests still pass

### Risk Mitigation

- All changes are in transactions to prevent partial updates
- Outstanding is recalculated to verify consistency
- Guards prevent negative outstanding
- Overpayment is explicitly tracked (credit balance)
- FIFO order ensures oldest invoices paid first
