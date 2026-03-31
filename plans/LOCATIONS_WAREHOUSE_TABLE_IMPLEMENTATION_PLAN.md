# Warehouses Page - Warehouse Table Implementation Plan

## Overview

Transform the `/master-data/locations` page into `/master-data/warehouses` - a single TanStack Table for warehouses only with pagination, search, and action capabilities. Outlets are managed separately under `/settings/outlets` and are not part of this page.

## Key Clarifications

1. **Rename**: "Locations" → "Warehouses" everywhere (page title, breadcrumbs, sidebar, file names, action names)
2. **Outlets**: NOT being removed from codebase - they just don't live on this page. Outlet management lives under `/settings/outlets`
3. **Settings Tab**: Shows the **active outlet's configuration** (from global outlet switcher), NOT the warehouse's own settings

---

## Current State

- **File**: `src/app/dashboard/master-data/locations/page.tsx`
- **Structure**:
  - KPI overview section (warehouses, outlets, stocks, status)
  - Two-column grid layout
  - Left: Warehouses section (card-based)
  - Right: Outlets section (card-based)
- **Actions**: Edit/Delete on each card
- **No pagination**: Shows all records

---

## Target State

- **Route**: `/dashboard/master-data/warehouses` (renamed from locations)
- Single warehouse table using TanStack Table
- Server-side pagination with URL params
- Search functionality
- View (click to view details), Edit, Delete actions
- Simplified header (remove outlets KPIs)
- Two-tab detail page: "Warehouse Info" + "Outlet Settings"

---

## Implementation Plan

### Phase 1: Rename Actions File

**File**: `src/actions/locations/index.ts` → `src/actions/warehouses/index.ts`

> Note: Keep the original file during migration, then delete after new file is in place

1. Copy `src/actions/locations/index.ts` to `src/actions/warehouses/index.ts`
2. Add new function `getWarehousesPaginated(outletId, params)`:
   - Accept pagination params (page, limit, search)
   - Count total warehouses for pagination
   - Query with pagination (skip/take)
   - Include outlet info and stock count
   - Return `{ data: warehouses[], pagination: PaginationMeta }`
3. Update revalidation paths to point to `/dashboard/master-data/warehouses`

### Phase 2: Rename & Restructure Page Directory

**From**: `src/app/dashboard/master-data/locations/`
**To**: `src/app/dashboard/master-data/warehouses/`

1. Rename directory
2. Update all internal imports within the directory
3. Update all external imports referencing this path

### Phase 3: Server Page Component

**File**: `src/app/dashboard/master-data/warehouses/page.tsx`

1. Keep as async server component
2. Parse pagination params from URL
3. Call `getWarehousesPaginated` from new actions file
4. Pass data to client component
5. Update breadcrumbs to show "Warehouses" instead of "Locations"
6. Update page title and translations

### Phase 4: Client Component (New)

**File**: `src/app/dashboard/master-data/warehouses/_components/warehouses-client.tsx`

1. Create `WarehousesClient` component:
   - Accept `warehouses`, `pagination`, `outletId`
   - Implement columns using TanStack Table `ColumnDef`
   - Handle search, pagination state
   - Handle row click for view
   - Edit/Delete actions with confirmation dialogs

2. Column definitions:
   | Column | Header | Content |
   |--------|--------|---------|
   | name | Warehouse Name | Warehouse name with address below |
   | outlet | Outlet | Outlet badge |
   | stocks | SKU Points | Stock count badge |
   | isDefault | Default | Badge if default |
   | actions | Actions | View, Edit, Delete buttons |

3. Action handlers:
   - `handlePageChange(page)` - Update URL params
   - `handleLimitChange(limit)` - Update URL params
   - `handleSearch(search)` - Debounced search
   - `handleView(warehouse)` - Navigate to detail page
   - `handleEdit(warehouse)` - Navigate to edit page
   - `handleDelete(warehouse)` - Confirmation dialog + delete

### Phase 5: Warehouse Detail Page (View)

**File**: `src/app/dashboard/master-data/warehouses/warehouse/[id]/page.tsx` (NEW)

> Note: The `warehouse/[id]/edit/` directory already exists - only need to create the parent page.tsx

1. Create warehouse detail page with **two tabs**:

   **Tab 1: Warehouse Info**
   - Display this warehouse's information:
     - Name, Address, State
     - Contact Name, Contact Phone
     - Outlet assignment
     - Default status
     - Stock count
   - "Edit" button to navigate to edit page

   **Tab 2: Outlet Settings**
   - Shows the **currently active outlet's configuration** (from global outlet switcher)
   - NOT this warehouse's settings
   - Displays outlet info from `useOutletStore`
   - Links to `/settings/outlets` for full outlet management

2. Layout:
   - Back link to warehouses list
   - Tab navigation (Warehouse Info | Outlet Settings)
   - Clean detail display

### Phase 6: UI Components

Existing components to use:

1. **PageHeader** - Already exists
2. **TableToolbar** - Already exists, use for search and add button
3. **DataTable** - Already exists, use with `manualPagination`
4. **PaginationControls** - Already exists
5. **ReusableConfirmDialog** - Already exists

---

## File Changes Summary

### New Files

1. `src/actions/warehouses/index.ts` - Warehouses actions with paginated query
2. `src/app/dashboard/master-data/warehouses/_components/warehouses-client.tsx` - Main table client
3. `src/app/dashboard/master-data/warehouses/warehouse/[id]/page.tsx` - Detail view with two tabs

### Modified Files

1. `src/actions/locations/index.ts` - Can be deleted after migration complete
2. `src/app/dashboard/master-data/warehouses/page.tsx` - Update imports and use new table
3. `src/app/dashboard/master-data/warehouses/warehouse/[id]/edit/page.tsx` - Update imports

### Directory Rename

- `src/app/dashboard/master-data/locations/` → `src/app/dashboard/master-data/warehouses/`

### Deleted/Unused Files

> None from this scope. Outlets remain in codebase under `/settings/outlets`

---

## Implementation Sequence

1. **Create new actions** → `src/actions/warehouses/index.ts`
2. **Rename directory** → `src/app/dashboard/master-data/warehouses/`
3. **Create client component** → `warehouses/_components/warehouses-client.tsx`
4. **Update main page** → `warehouses/page.tsx`
5. **Create detail page** → `warehouses/warehouse/[id]/page.tsx` with two tabs
6. **Update edit page imports** → `warehouses/warehouse/[id]/edit/page.tsx`
7. **Test and verify**
8. **Delete old actions file** → `src/actions/locations/index.ts`

---

## Key Decisions

### Search Strategy

- Server-side search via URL params
- Debounced input (300ms) before updating URL
- Search filters warehouse by name (and optionally address)

### Pagination Strategy

- Server-side pagination via Prisma skip/take
- URL params: `?page=1&limit=10&search=term`
- Use existing `PaginationControls` component

### View vs Edit

- Click row → Navigate to detail view page
- Edit button → Navigate to existing edit page
- Detail page has "Edit" button to switch modes

### Delete Flow

- Click delete → Show confirmation dialog
- Confirm → Call `deleteWarehouse` action
- Success → Toast + refresh data
- Failure → Toast with error message

### Two-Tab Detail Page

**Warehouse Info Tab**:

- Shows this specific warehouse's details
- Read-only display with Edit button

**Outlet Settings Tab**:

- Shows the **active outlet** from global switcher
- NOT the warehouse's assigned outlet
- Displays: Outlet name, address, GSTIN, invoice prefix, etc.
- Link to full outlet settings: `/settings/outlets`

---

## Component Structure (Final)

```
warehouses/                                    # Renamed from locations
├── page.tsx                                   # Server component with table
├── _components/
│   └── warehouses-client.tsx                 # NEW: Main client component
└── warehouse/
    └── [id]/
        ├── page.tsx                           # NEW: Detail view (2 tabs)
        └── edit/
            └── page.tsx                       # Existing: Edit page
    └── new/
        └── page.tsx                           # Existing: New warehouse
```

---

## Translation Keys (Update)

Update translations for:

- `locations.title` → `warehouses.title`
- `locations.subtitle` → `warehouses.subtitle`
- `locations.warehouses.*` → `warehouses.*`
- Remove `locations.outlets.*` keys (if not used elsewhere)

---

## Sidebar Update Required

The sidebar navigation needs to be updated:

- Change link from `/dashboard/master-data/locations` to `/dashboard/master-data/warehouses`
- Change label from "Locations" to "Warehouses"

> Note: This is likely in a sidebar/navigation component file, not in this page scope.
