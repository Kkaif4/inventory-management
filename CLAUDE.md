# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Inventory Management System** — A Next.js-based ERP/inventory management platform built with:
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js Server Actions, PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js with NextAuth Prisma Adapter
- **State**: Zustand, React Hook Form (with Zod validation)
- **Key Libraries**: XLSX (Excel import), bcryptjs (password hashing), sonner (toast notifications)

## Architecture & Design Patterns

### Multi-Outlet Multi-Tenancy
Each `Outlet` is an independent point of sale/fulfillment center with its own:
- Stock ledger and inventory
- Negative stock policy (WARN/BLOCK/ALLOW)
- Invoice numbering series
- Linked warehouses for stock fulfillment
- Inventory valuation method (NONE or FIFO)

Key files:
- `src/lib/outlet-auth.ts` — Validates user access to outlets, session management
- `src/store/use-outlet-store.ts` — Client-side outlet context
- `src/hooks/use-outlet.ts` — Hook to get current outlet

### Server Actions & Error Handling
All data mutations use Next.js Server Actions wrapped with `withErrorHandler()`. Pattern:
```typescript
// src/actions/category/index.ts
export async function createCategory(data: CategoryInput) {
  return withErrorHandler(async () => {
    await validateSessionOutletAccess(data.outletId);
    // transaction logic...
  });
}
```
Returns `{ success: boolean; data?: T; error?: AppError }`.

Error handling:
- `src/lib/error-handler.ts` — Central error handling with Prisma error mapping
- `src/lib/exceptions.ts` — AppError class and error codes
- Server Actions always catch and return StandardResponse, never throw to client

### Inventory & Stock Management

**Stock Movement Service** (`src/domains/inventory/stock-service.ts`):
- Central atomic function `moveStock()` for all stock transactions
- Handles Stock balance updates, StockLedger creation, and FIFO batch tracking
- Types: PURCHASE, SALE, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT_INC, ADJUSTMENT_DEC
- Checks outlet's `negativeStockPolicy` and `inventoryValuationMethod`

**FIFO Batch Tracking**:
- Enabled via `outlet.inventoryValuationMethod = "FIFO"`
- Creates `CustomBatch` records on purchase (positive qty)
- Consumes batches FIFO on sales (negative qty)
- `BatchMovement` records audit each consumption
- `StockLedger.costPerUnit` captures weighted average cost after FIFO deduction

**Unit Conversion**:
- Purchase: Use `normalizeToStockQty()` with `isPurchase: true, conversionRatio`
- Sales: Always 1:1 with base unit (no conversion)
- Located in `src/lib/unit-conversion.ts`

### Form & Validation Pattern
1. Define Zod schema in `src/validations/*.validation.ts`
2. Use `zodResolver()` with `react-hook-form`
3. Outlet config forms are in:
   - Admin: `src/app/dashboard/admin/outlets/`
   - Master Data: `src/app/dashboard/master-data/locations/outlet/`

### Database Transactions
Prisma `$transaction()` is used for atomic operations that span multiple models. Example in stock-service.ts where a single transaction creates Stock, StockLedger, CustomBatch, and BatchMovement records.

## Directory Structure

```
src/
  ├── actions/        # Server Actions organized by domain (sales/, inventory/, etc.)
  ├── app/            # Next.js App Router (layout, pages, API routes)
  ├── components/     # React components (UI, forms, layouts)
  ├── domains/        # Business logic services (inventory/, accounting/, etc.)
  ├── generated/      # Prisma client (auto-generated, don't edit)
  ├── hooks/          # Custom React hooks
  ├── lib/            # Utilities (auth, error handling, constants, validators)
  ├── store/          # Zustand stores
  ├── types/          # TypeScript type definitions
  └── validations/    # Zod schemas for form validation
prisma/
  ├── schema.prisma   # Database schema
  ├── migrations/     # Database migrations
  └── seed.ts         # Seed script
```

## Common Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma studio   # Open Prisma Studio GUI for data inspection
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma db push  # Sync schema to DB (use for quick local changes only)
npm run seed         # Run seed.ts to populate test data
```

### TypeScript
```bash
npx tsc --noEmit    # Check types without emitting
```

## Key Implementation Details

### Outlet Settings Affect System Behavior
Always check outlet configuration when implementing features:
- `negativeStockPolicy` — Controls whether stock can go negative
- `inventoryValuationMethod` — "NONE" (standard) or "FIFO" (batch tracking)
- `batchTrackingEnabled` — Legacy flag, superseded by inventoryValuationMethod
- `allowRawCashBills` — Enables informal/untaxed billing

### Validation Pattern for Outlet Fields
When adding new outlet properties:
1. Add field to `Outlet` model in `prisma/schema.prisma`
2. Add to `outletSchema` in `src/validations/outlet.validation.ts`
3. Update both outlet form pages (admin + master-data locations)
4. Update `getLocations()` and `updateOutlet()` server actions

### Common TypeScript Issues

**React Hook Form + zodResolver Type Mismatch**: If using enum fields in Zod with react-hook-form, use `as any` cast on entire defaultValues to bypass module resolution issues:
```typescript
const form = useForm<OutletFormValues>({
  resolver: zodResolver(outletSchema),
  defaultValues: { ... } as any,
});
```

**useSearchParams in Client Components**: Requires Suspense boundary wrapper. Pattern:
```typescript
function PageInner() { /* uses useSearchParams */ }
export default function Page() {
  return <Suspense><PageInner /></Suspense>;
}
```

## Testing & Debugging

- **Build errors with diagnostics**: Run `npm run build` to see all TypeScript errors
- **Database issues**: Check Prisma Studio (`npx prisma studio`) to inspect data
- **Session/Auth issues**: Validate outlet access with `validateSessionOutletAccess()` in server actions
- **Stock calculations**: Use `stock-service.ts` for all inventory movements; never update Stock directly

## Recent Work & Known Issues

### FIFO Implementation (Completed)
- Added `inventoryValuationMethod` enum field to Outlet
- StockLedger now records `costPerUnit` for FIFO cost tracking
- Batch exhaustion filtering optimized with index on `(variantId, warehouseId, receivedDate)`
- Multiple outlet form pages updated to support new field

### Outlet Form TypeScript Challenges
- Type inference issues with react-hook-form when combining multiple Zod union/enum types
- Solution: Use `as any` cast on defaultValues object to bypass strict type checking
- All 4 outlet configuration pages (admin new/edit, master-data locations new/edit) must be kept in sync

## Performance Considerations

- Stock queries use indexes: `@@index([variantId, warehouseId, receivedDate])` on CustomBatch
- Warehouse selection in outlet forms filters via `selectedWarehouseIds` (client-side)
- Large product imports use XLSX library with streaming when possible
- Outlet selection is cached in Zustand store to avoid repeated queries
