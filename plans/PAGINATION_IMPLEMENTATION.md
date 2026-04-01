# Server-Side Pagination Implementation Guide

## Overview
All paginated list pages (Vendors, Customers, Products) now use server-side pagination with URL-based state management.

## Pattern Used Across All Pages

### 1. **Page Component (RSC)** - e.g., `page.tsx`
```typescript
export default async function Page({ searchParams }) {
  const outletId = await getCurrentSessionOutlet();

  // Parse query params
  const pagination = parsePaginationParams(searchParams);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  // Call paginated server action
  const res = await getEntityPaginated(outletId, {
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
    // ... other filters
  });

  const result = res as any;
  if (!result.success || !result.data) {
    // Error UI
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <EntityClient
        initialData={result.data.data}
        initialPagination={result.data.pagination}
        outletId={outletId}
      />
    </Suspense>
  );
}
```

### 2. **Client Component** - e.g., `entity-client.tsx`
```typescript
"use client";

export function EntityClient({
  initialData,
  initialPagination,
  outletId
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  // Sync data when pagination changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    // ... preserve other params
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, ...deps]);

  return (
    <div>
      {/* Filters */}
      <DataTable
        data={data}
        manualPagination  {/* Important! */}
      />

      {/* Pagination Controls - Shared Component */}
      {initialPagination && (
        <PaginationControls
          page={initialPagination.page}
          totalPages={initialPagination.totalPages}
          limit={initialPagination.limit}
          total={initialPagination.total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          isPending={isPending}
        />
      )}
    </div>
  );
}
```

### 3. **Server Action** - e.g., `get*Paginated()`
```typescript
export async function getEntityPaginated(outletId, params) {
  return withErrorHandler(async (): Promise<PaginatedResult<Entity>> => {
    await validateSessionOutletAccess(outletId);

    const { page, limit } = parsePaginationParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    // Build WHERE clause from filters
    const where = { outletId, /* ... filters */ };

    // Parallel queries
    const [total, entities] = await Promise.all([
      prisma.entity.count({ where }),
      prisma.entity.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pagination = calculatePagination(total, page, limit);
    return { data: entities, pagination };
  });
}
```

## URL Query Parameters

```
/dashboard/vendors?page=2&limit=25&search=acme&status=ACTIVE&state=Maharashtra&hasOverdue=true
```

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | 1 | Resets to 1 on filter change |
| `limit` | number | 10 | Options: [10, 25, 50, 100] |
| `search` | string | - | 500ms debounced |
| `[filter]` | string | - | Entity-specific filters |

## Shared Components

### `PaginationControls`
- **Location**: `src/components/ui/pagination-controls.tsx`
- **Props**: `page`, `totalPages`, `limit`, `total`, `onPageChange`, `onLimitChange`, `isPending`
- **Features**:
  - Desktop: Full pagination with page buttons
  - Mobile: Simplified (prev/next + page count)
  - Items-per-page selector
  - "Showing X-Y of Z" results count

### `DataTable` (Modified)
- **New prop**: `manualPagination?: boolean`
- When `true`: Disables internal pagination, renders only `getCoreRowModel()`
- Caller renders `<PaginationControls>` separately

## Database Indexes (Performance)

```prisma
model Party {
  @@index([outletId, type, isActive])
  @@index([outletId, type, name])
  @@index([outletId, type, outstandingBalance])
}

model Transaction {
  @@index([outletId, type, status])
  @@index([outletId, type, date])
  @@index([outletId, type, partyId])
}

model Product {
  @@index([outletId, isArchived])
  @@index([outletId, categoryId, isArchived])
}
```

## Implemented Pages

✅ **Vendors** - `/dashboard/purchase/vendors`
✅ **Customers** - `/dashboard/sales/customers`
✅ **Products** - `/dashboard/master-data/products`

## Key Features

- ✅ URL-based state (bookmarkable, shareable)
- ✅ Server-side pagination (only current page fetched)
- ✅ Parallel count + select queries for performance
- ✅ Debounced search (500ms)
- ✅ Filter reset to page 1 on change
- ✅ Mobile-responsive pagination controls
- ✅ Type-safe with full TypeScript support
- ✅ DRY architecture with reusable components

## Testing Pagination

```bash
# Navigate with page parameter
/dashboard/vendors?page=2&limit=25

# Filter and verify page resets to 1
/dashboard/vendors?page=5&search=acme
# → Should navigate to ?page=1&search=acme

# Items per page selector
# Change limit from 10 to 25
# → Should navigate to ?page=1&limit=25
```

## Remaining Implementations (Optional)

To apply this pattern to other pages:

1. **Transactions/Invoices** - `src/app/dashboard/sales/transactions/`
   - Follow same pattern as Vendors
   - Add `getSalesInvoicesPaginated()` action

2. **Purchases** (Tabbed) - `src/app/dashboard/purchases/`
   - Add `tab` parameter to URL
   - Fetch only active tab's data
   - Apply pattern to each purchase tab

See `PAGINATION_IMPLEMENTATION.md` for step-by-step guide.
