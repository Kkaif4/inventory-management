# Outlet-Scoped Data Fetching Implementation Plan

**Status**: Planning Phase
**Date**: March 10, 2026
**Reviewed By**: [Awaiting Developer Review]

---

## Executive Summary

This document outlines the complete implementation strategy to enforce outlet-scoped data fetching across the inventory management system. The implementation ensures that all data operations are bounded by outlet context, preventing data cross-contamination between branches/outlets and ensuring accurate financial/inventory reporting.

**Key Principle**: "No data without outletId"

---

## Current State Analysis

### ✅ Strengths (Already Implemented)

1. **Database Schema** - Outlet relationships are properly defined:
   - `Product.outletId` (outlet-scoped products)
   - `Category.outletId` (outlet-scoped categories)
   - `Stock.outletId` (outlet-scoped inventory levels)
   - `Party.outletId` (outlet-scoped customers/vendors)
   - `Transaction.outletId` (outlet-scoped transactions)

2. **Frontend State Management**:
   - Zustand store (`use-outlet-store.ts`) with persist middleware
   - localStorage support via `outlet-storage` key
   - Auto-selection of first outlet if available
   - Store structure: `currentOutletId`, `currentOutlet`, `availableOutlets`

3. **Login Flow** (Partially):
   - Session includes `availableOutlets` from NextAuth JWT callback
   - Outlets synced to Zustand store after login
   - Dashboard layout fetches outlets via `getUserOutlets()`

### ⚠️ Critical Gaps

1. **No Outlet Context in Server Actions**
   - `getParties()` - Returns ALL parties (not scoped)
   - `getQuotations()` - Returns ALL quotations (not scoped)
   - `getCurrentStock()` - Returns ALL stock (not scoped)
   - `getInventoryLocations()` - No outlet filter

2. **Missing Outlet Parameter in Action Signatures**
   - Server actions don't accept `outletId` parameter
   - No validation that user has access to requested outlet

3. **No Outlet Context in Client Queries**
   - OutletSwitcher is a placeholder
   - No integration with Zustand store
   - No query invalidation on outlet change

4. **Frontend Not Using Store**
   - Components fetch data without passing `outletId`
   - No refetch on outlet change
   - Missing error handling for "Outlet context not found"

5. **No Authorization Layer**
   - Missing check: `user.outlets.includes(requestedOutletId)`
   - No 403 Forbidden response for unauthorized outlet access

---

## Implementation Roadmap

### Phase 1: Backend Layer (Server Actions) - HIGH PRIORITY

**Objective**: Ensure all queries include outlet filtering

#### 1.1 Update Server Action Signatures

Add `outletId` parameter to all data fetching functions:

```typescript
// Before
export async function getParties() { ... }

// After
export async function getParties(outletId: string) { ... }
```

**Files to Update**:

- ✅ `src/actions/parties/index.ts` - getParties(), getVendorsByProduct()
- ✅ `src/actions/sales/quotations.ts` - getQuotations(), getCustomers()
- ✅ `src/actions/sales/quotation.ts` - getQuotations(), getQuotationById()
- ✅ `src/actions/inventory/index.ts` - getCurrentStock(), getVariantsForSelection()
- ✅ `src/actions/procurement/index.ts` - getPurchaseOrders(), getGRNs(), getBills()
- ✅ `src/actions/accounting/index.ts` - getPartyLedger(), reports
- ✅ `src/actions/locations/index.ts` - getOutletsByUserId() [already scoped]

#### 1.2 Implement Outlet Authorization Middleware

Create a utility to validate outlet access:

```typescript
// src/lib/outlet-auth.ts
export async function validateOutletAccess(userId: string, outletId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { outlets: true },
  });

  if (!user?.outlets.some((o) => o.id === outletId)) {
    throw new Error("403: Outlet access denied");
  }

  return true;
}
```

#### 1.3 Add Outlet Filter to All Queries

Pattern for all getters:

```typescript
export async function getParties(outletId: string) {
  // Validate user access
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await validateOutletAccess(session.user.id, outletId);

  // Query with outlet filter
  return await prisma.party.findMany({
    where: { outletId }, // ADD THIS
    orderBy: { name: "asc" },
    include: {
      /* ... */
    },
  });
}
```

**Affected Entities**:

```
Party (Customer/Vendor)
    ├─ priceList
    ├─ transactions (filtered by outletId)
    └─ suppliedProducts

Product
    ├─ variants
    ├─ category
    └─ stocks (filtered by outletId)

Category
    └─ products (filtered by outletId)

Stock
    ├─ outlet (already scoped)
    ├─ variant
    └─ warehouse

Transaction
    ├─ items
    ├─ party
    ├─ outlet (already scoped)
    └─ user (createdBy)
```

#### 1.4 Update CRUD Operations

Ensure Create/Update/Delete include outletId:

```typescript
export async function createParty(data: {
  outletId: string; // ADD THIS
  type: "VENDOR" | "CUSTOMER";
  name: string;
  // ... other fields
}) {
  const session = await getServerSession(authOptions);
  await validateOutletAccess(session.user.id, data.outletId);

  return await prisma.party.create({
    data: { ...data, outletId: data.outletId },
  });
}
```

---

### Phase 2: Frontend Integration Layer - MEDIUM PRIORITY

**Objective**: Pass outlet context from store to all server actions

#### 2.1 Update OutletSwitcher Component

```typescript
// src/components/ui/outlet-switcher.tsx
"use client";

import { useOutletStore } from "@/store/use-outlet-store";
import { useTransition } from "react";

export function OutletSwitcher() {
  const { currentOutletId, availableOutlets, setOutlet } = useOutletStore();
  const [isPending, startTransition] = useTransition();

  const handleOutletChange = (outletId: string) => {
    startTransition(() => {
      setOutlet(outletId);
      // Invalidate queries here (if using React Query)
    });
  };

  return (
    // Dropdown showing availableOutlets
    // onClick: handleOutletChange(outlet.id)
  );
}
```

#### 2.2 Create Outlet Context Hook

```typescript
// src/hooks/use-outlet.ts
export function useOutlet() {
  const { currentOutletId } = useOutletStore();

  if (!currentOutletId) {
    throw new Error("Outlet context not found. Please select an outlet.");
  }

  return currentOutletId;
}
```

#### 2.3 Update Data-Fetching Components

Pattern: All client components calling server actions must pass outletId:

```typescript
// Before
const parties = await getParties();

// After
const outletId = useOutlet();
const parties = await getParties(outletId);
```

**Components to Update**:

- `src/app/dashboard/master-data/parties/page.tsx`
- `src/app/dashboard/sales/quotations/page.tsx`
- `src/app/dashboard/sales/sales-invoice/page.tsx`
- `src/app/dashboard/inventory/page.tsx`
- `src/app/dashboard/purchases/page.tsx`
- `src/app/dashboard/reports/page.tsx`
- `src/app/dashboard/accounting/page.tsx`

#### 2.4 Implement Query Invalidation on Outlet Change

If using React Query (future consideration):

```typescript
const handleOutletChange = (outletId: string) => {
  setOutlet(outletId);

  // Invalidate all queries
  queryClient.invalidateQueries({
    predicate: (query) => {
      // Invalidate if query key includes old outletId
      return (
        Array.isArray(query.queryKey) &&
        query.queryKey.includes(previousOutletId)
      );
    },
  });
};
```

---

### Phase 3: Error Handling & Validation - MEDIUM PRIORITY

**Objective**: Graceful error handling when outlet context is missing

#### 3.1 Client-Side Error Boundary

```typescript
// src/components/outlet-required.tsx
"use client";

import { useOutletStore } from "@/store/use-outlet-store";
import { ReactNode } from "react";

export function OutletRequired({ children }: { children: ReactNode }) {
  const { currentOutletId, availableOutlets } = useOutletStore();

  if (!currentOutletId && availableOutlets.length > 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-semibold">
          Please select an outlet to proceed
        </p>
        <OutletSwitcher />
      </div>
    );
  }

  if (availableOutlets.length === 0) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">No outlets assigned to your account</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

#### 3.2 Server-Side Validation Response

```typescript
// Standard error response for missing outlet context
{
  error: "OUTLET_CONTEXT_REQUIRED",
  message: "Please select an outlet to proceed",
  statusCode: 400
}

// Standard error response for unauthorized outlet access
{
  error: "OUTLET_ACCESS_DENIED",
  message: "You do not have access to this outlet",
  statusCode: 403
}
```

---

### Phase 4: Database Indexing - LOW PRIORITY

**Objective**: Optimize queries for outlet-scoped filtering

#### 4.1 Add Indexes

```sql
-- Party table
CREATE INDEX idx_party_outlet ON Party(outletId);
CREATE INDEX idx_party_outlet_type ON Party(outletId, type);

-- Stock table
CREATE INDEX idx_stock_outlet_variant ON Stock(outletId, variantId);
CREATE INDEX idx_stock_outlet_warehouse ON Stock(outletId, warehouseId);

-- Transaction table
CREATE INDEX idx_transaction_outlet_date ON Transaction(outletId, date DESC);
CREATE INDEX idx_transaction_outlet_type ON Transaction(outletId, type);

-- Product table
CREATE INDEX idx_product_outlet ON Product(outletId);

-- Category table
CREATE INDEX idx_category_outlet ON Category(outletId);
```

#### 4.2 Update Prisma Schema

Add `@@index` directives:

```prisma
model Party {
  // ... fields
  @@index([outletId])
  @@index([outletId, type])
}

model Stock {
  // ... fields
  @@unique([variantId, warehouseId, outletId])
  @@index([outletId, variantId])
  @@index([outletId, warehouseId])
}

model Transaction {
  // ... fields
  @@index([outletId, date(sort: Desc)])
  @@index([outletId, type])
}
```

---

## Implementation Details by Domain

### Sales Module

**Files**:

- `src/actions/sales/quotations.ts`
- `src/actions/sales/quotation.ts`
- `src/actions/sales/sales-invoice.ts`
- `src/app/dashboard/sales/**`

**Changes**:

```typescript
// Quotations
export async function getQuotations(outletId: string) {
  await validateOutletAccess(userId, outletId);
  return await prisma.transaction.findMany({
    where: {
      type: "QUOTATION",
      outletId, // ADD THIS
    },
    include: {
      /* ... */
    },
  });
}

// Sales Invoice
export async function getSalesInvoices(outletId: string) {
  await validateOutletAccess(userId, outletId);
  return await prisma.transaction.findMany({
    where: {
      type: "SALES_INVOICE",
      outletId, // ADD THIS
    },
  });
}
```

### Inventory Module

**Files**:

- `src/actions/inventory/index.ts`
- `src/app/dashboard/inventory/**`

**Changes**:

```typescript
export async function getCurrentStock(outletId: string) {
  await validateOutletAccess(userId, outletId);
  return await prisma.stock.findMany({
    where: { outletId }, // ADD THIS
    include: {
      variant: { include: { product: true } },
      warehouse: true,
    },
  });
}

export async function createStockAdjustment(
  outletId: string,
  data: StockAdjustmentData,
) {
  await validateOutletAccess(userId, outletId);
  // Ensure stock variant belongs to this outlet
  const stock = await prisma.stock.findUnique({
    where: { id: data.stockId },
  });
  if (stock?.outletId !== outletId) {
    throw new Error("403: Access Denied");
  }
  // ... create adjustment
}
```

### Procurement Module

**Files**:

- `src/actions/procurement/index.ts`
- `src/app/dashboard/purchases/**`

**Changes**:

```typescript
export async function getPurchaseOrders(outletId: string) {
  await validateOutletAccess(userId, outletId);
  return await prisma.transaction.findMany({
    where: {
      type: "PURCHASE_ORDER",
      outletId, // ADD THIS
    },
  });
}

export async function createPurchaseOrder(
  outletId: string,
  data: PurchaseOrderData,
) {
  await validateOutletAccess(userId, outletId);
  // Verify vendor is accessible from this outlet
  const vendor = await prisma.party.findUnique({
    where: { id: data.vendorId },
  });
  if (vendor?.outletId !== outletId) {
    throw new Error("403: Vendor not available in this outlet");
  }
  // ... create PO
}
```

### Reports Module

**Files**:

- `src/actions/reports/index.ts`
- `src/app/dashboard/reports/**`

**Changes**:

```typescript
export async function getInventoryReport(outletId: string) {
  await validateOutletAccess(userId, outletId);
  return await prisma.stock.groupBy({
    by: ["variantId"],
    where: { outletId }, // ADD THIS
    _sum: { quantity: true },
    _avg: { quantity: true },
  });
}

export async function getSalesReport(
  outletId: string,
  dateRange: { from: Date; to: Date },
) {
  await validateOutletAccess(userId, outletId);
  return await prisma.transaction.findMany({
    where: {
      outletId, // ADD THIS
      type: "SALES_INVOICE",
      date: { gte: dateRange.from, lte: dateRange.to },
    },
  });
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test outlet authorization
test('getParties should throw on unauthorized outlet access', async () => {
  const userId = 'user1';
  const unauthorized outletId = 'outlet2';

  await expect(getParties(unauthorizedOutletId))
    .rejects.toThrow('403: Outlet access denied');
});

// Test outlet scoping
test('getParties should only return parties for selected outlet', async () => {
  const outletId = 'outlet1';
  const parties = await getParties(outletId);

  parties.forEach(party => {
    expect(party.outletId).toBe(outletId);
  });
});
```

### Integration Tests

```typescript
// Test full flow
test("User can only see data from their outlets", async () => {
  const user = await createTestUser({
    outlets: ["outlet1", "outlet2"],
  });

  // User should see outlet1 data
  const outlet1Data = await getParties("outlet1");
  expect(outlet1Data.length).toBeGreaterThan(0);

  // User should NOT see outlet3 data
  await expect(getParties("outlet3")).rejects.toThrow("403");
});
```

### E2E Tests

```typescript
// Test complete user journey
test("User logs in, selects outlet, sees only scoped data", async () => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@test.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');

  // Select outlet
  await page.selectOption('select[name="outlet"]', "outlet1");

  // Check data is scoped
  const parties = await page.$$eval(
    '[data-testid="party-row"]',
    (rows) => rows.length,
  );
  expect(parties).toBeGreaterThan(0);
});
```

---

## Risk Assessment

| Risk                      | Impact   | Mitigation                           |
| ------------------------- | -------- | ------------------------------------ |
| Breaking existing queries | HIGH     | Implement gradual rollout per module |
| Missing outlet validation | HIGH     | Comprehensive testing before deploy  |
| Performance degradation   | MEDIUM   | Add indexes; monitor query times     |
| Session outlet mismatch   | MEDIUM   | Sync on every action; validate       |
| Cross-outlet data leak    | CRITICAL | Double-check all where clauses       |

---

## Rollout Strategy

### Week 1-2: Backend Preparation

1. Create `outlet-auth.ts` utility
2. Update server action signatures (non-breaking, add optional param)
3. Add outlet filtering to queries
4. Add authorization checks
5. Deploy and test in staging

### Week 3: Frontend Integration

1. Update OutletSwitcher with store integration
2. Create `use-outlet.ts` hook
3. Update data-fetching components to pass outletId
4. Add error boundaries
5. Test in staging

### Week 4: Database & Monitoring

1. Create migration for indexes
2. Deploy indexes to production
3. Monitor query performance
4. Monitor error rates (403, missing outlet)

---

## Success Criteria

- ✅ All data queries include `WHERE outletId = X`
- ✅ Zero cross-outlet data leaks in testing
- ✅ 100% outlet access validation coverage
- ✅ OutletSwitcher fully functional with store
- ✅ Dashboard loads only scoped data
- ✅ Reports filtered by outlet
- ✅ No 403 errors in valid scenarios
- ✅ <2s latency for outlet-scoped queries (with indexes)

---

## Review Checklist

**For Backend Developer**:

- [ ] Review server action signature changes
- [ ] Validate authorization logic in `outlet-auth.ts`
- [ ] Confirm all where clauses include `outletId`
- [ ] Check for N+1 query problems
- [ ] Verify error response formats

**For Frontend Developer**:

- [ ] Review OutletSwitcher integration
- [ ] Test outlet switching behavior
- [ ] Confirm query invalidation works
- [ ] Validate error boundary displays
- [ ] Check accessibility of outlet selector

**For DevOps/Database**:

- [ ] Review index strategy
- [ ] Plan migration timeline
- [ ] Set up monitoring for outlet-scoped queries
- [ ] Configure query performance alerts

---

## Next Steps

1. **Developer Review**: Share this plan for feedback
2. **Approval**: Get stakeholder sign-off
3. **Planning Meeting**: 30-min sync on timeline
4. **Sprint Planning**: Allocate story points
5. **Implementation**: Start with Phase 1 (Backend)

---

**Document Version**: 1.0
**Last Updated**: March 10, 2026
**Status**: Awaiting Review
