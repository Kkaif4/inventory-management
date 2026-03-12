# Outlet-Scoped Data Fetching - Gap Analysis & Risk Report

**Status**: Critical Issues Found ⚠️
**Severity Level**: HIGH
**Date**: March 10, 2026

---

## Executive Summary

**FINDING**: The current system has outlet-scoped database schema but **NO outlet filtering in server actions**, allowing:

- ✗ Cross-outlet data visibility
- ✗ Incorrect financial reporting across branches
- ✗ Inventory corruption between outlets
- ✗ Security boundary violations

**ACTION REQUIRED**: Immediate implementation of outlet-scoped queries before production use.

---

## Critical Issues

### 1. SECURITY VULNERABILITY - Data Access Not Scoped

**Severity**: CRITICAL 🔴

**Current Behavior**:

```typescript
// Current: Returns ALL parties regardless of outlet
export async function getParties() {
  return await prisma.party.findMany({
    where: {}, // ❌ NO OUTLET FILTER
    orderBy: { name: "asc" },
  });
}
```

**Problem**: User from Outlet A can see ALL customers/vendors from Outlet B

**Risk Scenario**:

```
Branch Manager (Outlet A) calls getParties()
  → Receives ALL 500 parties across ALL outlets
  → Can accidentally order from Branch B vendors
  → Can contact Branch B customers
  → Sees competitor pricing info
  → Data leak to unauthorized outlet
```

**Affected Functions**:

- `getParties()` - Returns all vendors/customers
- `getQuotations()` - Returns all quotations globally
- `getCurrentStock()` - Returns all stock entries
- `getInventoryLocations()` - No outlet scoping
- `getPurchaseOrders()` - Returns all POs globally
- `getBills()` - Returns all bills globally
- `getPartyLedger()` - No outlet verification

---

### 2. FUNCTIONAL DEFECT - No Outlet Parameter Passing

**Severity**: HIGH 🟠

**Current Code**:

```typescript
// Dashboard calls action with NO outlet context
export default async function SalesPage() {
  const quotations = await getQuotations(); // ❌ Missing outletId
  return <QuotationsClient quotations={quotations} />;
}
```

**Impact**:

- All data loads are outlet-agnostic
- Cannot filter by current outlet selection
- OutletSwitcher has no effect on data
- Cannot implement multi-outlet separation

---

### 3. AUTHORIZATION MISSING - No Access Validation

**Severity**: CRITICAL 🔴

**Current State**: No check if user has access to requested outlet

**Attack Scenario**:

```typescript
// Malicious user directly calls:
const secret_data = await getParties("outlet_secret_id");

// Response: ✓ Success (if user somehow knows ID)
// Expected: ✗ 403 Forbidden (user doesn't have access)
```

**Missing Code**:

```typescript
// No validation like this exists
if (!user.outlets.includes(requestedOutletId)) {
  throw new Error("403: Unauthorized");
}
```

---

### 4. FRONTEND STATE NOT INTEGRATED

**Severity**: HIGH 🟠

**Current OutletSwitcher**:

```typescript
export function OutletSwitcher() {
  // Hardcoded placeholder - not connected to store
  const outlets = [
    { id: "1", name: "Head Office" },
    { id: "2", name: "Main Warehouse" },
  ];

  const [selected, setSelected] = useState(outlets[0]);
  // ❌ Does nothing with selection
  // ❌ No store integration
  // ❌ No query invalidation
}
```

**Problem**: User can "select" outlet but:

- Selection not persisted to Zustand store
- Selection doesn't affect data fetches
- Query results unchanged
- Multiple outlets show same data

---

### 5. NO QUERY INVALIDATION ON OUTLET CHANGE

**Severity**: MEDIUM 🟡

**Current Issue**:

```typescript
// When user switches outlets, old data remains
const handleOutletChange = (outletId: string) => {
  setOutlet(outletId); // ← Updates store only
  // ❌ NO: Clear old queries
  // ❌ NO: Refetch data with new outletId
  // ❌ NO: Update UI with new data

  // Result: User sees Outlet A data while selected Outlet B
};
```

---

## Data Integrity Risks

### Scenario 1: Financial Reporting Error

```
Branch A has:
  - Revenue: ₹50,00,000
  - Inventory: 5,000 units

Branch B has:
  - Revenue: ₹30,00,000
  - Inventory: 3,000 units

Current getReport() returns:
  - TOTAL Revenue: ₹80,00,000 ✗
  - TOTAL Inventory: 8,000 units ✗

Expected for Branch A:
  - Revenue: ₹50,00,000 ✓
  - Inventory: 5,000 units ✓

Impact: Wrong budget, wrong stock alerts, wrong tax calculations
```

### Scenario 2: Stock Corruption

```
User creates stock adjustment without outlet context:

Original:
  Stock[Outlet A].Variant-001 = 100 units

Adjustment (unscoped):
  UPDATE stock SET quantity = 90 WHERE variantId = '001'

Result:
  Stock[Outlet A].Variant-001 = 90 units ✗
  Stock[Outlet B].Variant-001 = 90 units ✗
  Stock[Outlet C].Variant-001 = 90 units ✗

Each outlet affected without authorization!
```

---

## Compliance & Audit Issues

### Missing Audit Trail

Current audit logs don't verify outlet context:

```typescript
// Audit log created but has no outlet information
const auditLog = {
  userId: "user123",
  action: "UPDATE_STOCK",
  entityId: "variant_001",
  // ❌ MISSING: outletId
  // ❌ MISSING: outletsUserHasAccess
};
```

**Audit Question**: "Who changed stock for Outlet B?"
**Answer**: "Can't tell - no outlet recorded"

---

## Performance Impact

### Without Indexes

```
Query: SELECT * FROM party WHERE outletId = 'outlet_1'
  - Full table scan: 10,000 records
  - Time: 2.5 seconds
  - Not production-ready

Query: SELECT * FROM stock WHERE outletId = 'outlet_1' AND variantId = 'var_123'
  - Full table scan: 100,000 records
  - Time: 5+ seconds
  - Dashboard loads very slowly
```

### With Proper Indexes

```
Same queries with indexes:
  - Time: 10-50ms
  - Reduces load by 50-250x
```

---

## Required Fixes - Priority Order

### IMMEDIATE (This Sprint)

1. ✅ Create `src/lib/outlet-auth.ts` utility
   - Validates user → outlet access
   - Throws 403 if unauthorized

2. ✅ Update ALL server action signatures
   - Add `outletId: string` parameter
   - Example: `getParties(outletId: string)`

3. ✅ Add WHERE clause to all queries
   - `where: { outletId }`
   - EVERY query that reads data

4. ✅ Add validation to CRUD operations
   - Create: Validate outlletId parameter
   - Update: Validate entity belongs to outlet
   - Delete: Verify user has outlet access

### SHORT TERM (Week 2-3)

5. ✅ Implement OutletSwitcher integration
   - Connect to Zustand store
   - Persist selection to localStorage

6. ✅ Update all data-fetching components
   - Extract `currentOutletId` from store
   - Pass to server actions
   - Handle missing outlet error

7. ✅ Add query invalidation
   - Clear old queries on outlet change
   - Refetch with new outletId
   - Update UI reactively

### MEDIUM TERM (Week 4)

8. ✅ Create database indexes
   - Index on `outletId`
   - Composite indexes for common filters
   - Performance improvement: 50-250x

9. ✅ Add comprehensive testing
   - Unit: Authorization logic
   - Integration: Multi-outlet scenarios
   - E2E: User journeys per outlet

---

## Files That MUST Be Updated

### Server Actions (CRITICAL)

- [ ] `src/actions/parties/index.ts` (5 functions)
- [ ] `src/actions/sales/quotations.ts` (3 functions)
- [ ] `src/actions/sales/quotation.ts` (3 functions)
- [ ] `src/actions/inventory/index.ts` (4 functions)
- [ ] `src/actions/procurement/index.ts` (5 functions)
- [ ] `src/actions/accounting/index.ts` (3 functions)
- [ ] `src/actions/dashboard.ts` (2 functions)
- [ ] `src/actions/reports/index.ts` (3+ functions)

### Frontend Components (HIGH)

- [ ] `src/components/ui/outlet-switcher.tsx` (Add store integration)
- [ ] `src/app/dashboard/layout.tsx` (Use new OutletSwitcher)
- [ ] All dashboard page.tsx files (Pass outletId to actions)

### New Files (Required)

- [ ] `src/lib/outlet-auth.ts` (Authorization utility)
- [ ] `src/hooks/use-outlet.ts` (Hook to get outlet or throw)

### Database (MEDIUM)

- [ ] Prisma schema indexes
- [ ] Migration file for indexes

---

## Testing Requirements

### Authorization Tests

```
✗ User from Outlet A CAN access Outlet A data
✗ User from Outlet A CANNOT access Outlet B data
✗ 403 returned for unauthorized outlet
✗ User with multiple outlets can access each
✗ User with no outlets gets appropriate error
```

### Data Scoping Tests

```
✗ getParties('outlet1') returns only outlet1 parties
✗ getQuotations('outlet2') returns only outlet2 quotations
✗ Stock queries filtered by outletId
✗ Reports grouped by outlet
```

### Integration Tests

```
✗ User logs in → outlets loaded → can select outlet
✗ Select outlet → data refetches → shows new outlet data
✗ Switch outlets → old data cleared → new data loaded
```

---

## Estimated Effort

| Task                       | Effort     | Risk     |
| -------------------------- | ---------- | -------- |
| Create auth utility        | 2 hrs      | Low      |
| Update 20 server actions   | 16 hrs     | High     |
| Update 30+ components      | 20 hrs     | High     |
| Testing & validation       | 12 hrs     | High     |
| Index creation & migration | 4 hrs      | Medium   |
| **TOTAL**                  | **54 hrs** | **High** |

---

## Rollout Plan

### NOT SUITABLE FOR: Incremental deployment

**Why**: Partial implementation creates confusion and false security

### REQUIRED: Complete implementation before ANY production use

### Approach:

1. Implement all backend changes in parallel
2. Test in staging with real data
3. Deploy all at once to production
4. Monitor error rates closely

---

## Sign-Off Required

This implementation plan requires review and approval from:

- [ ] **Backend Developer** - Validate server action changes
- [ ] **Database Admin** - Approve indexing strategy
- [ ] **Security Officer** - Review authorization logic
- [ ] **Product Owner** - Approve rollout timeline
- [ ] **QA Lead** - Confirm testing coverage

---

## Questions for Review

1. **Timeline**: Can this be completed within 1-2 weeks?
2. **Breaking Changes**: Is it acceptable to change all action signatures?
3. **Rollback Plan**: What if production sees errors?
4. **Monitoring**: What metrics should we alert on?
5. **User Communication**: How do we communicate "outlet selection matters"?

---

**Document Version**: 1.0
**Status**: Awaiting Developer Review & Sign-Off
**Next Action**: Schedule 30-minute planning meeting with team leads
