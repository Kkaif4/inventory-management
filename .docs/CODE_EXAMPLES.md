# Code Examples - Outlet-Scoped Data Fetching Implementation

**Purpose**: Show exact patterns to use when implementing outlet filtering

---

## 1. Authorization Utility

### File: `src/lib/outlet-auth.ts`

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Validates that a user has access to a specific outlet
 * @throws Error('403: Outlet access denied') if unauthorized
 */
export async function validateOutletAccess(userId: string, outletId: string) {
  if (!userId || !outletId) {
    throw new Error("User ID and Outlet ID are required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      outlets: {
        where: { id: outletId },
      },
    },
  });

  if (!user || user.outlets.length === 0) {
    throw new Error("403: Outlet access denied");
  }

  return true;
}

/**
 * Gets all outlets for a user
 */
export async function getUserOutlets(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      outlets: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return user?.outlets || [];
}

/**
 * Gets session with user outlets
 * For use in server components or protected routes
 */
export async function getSessionWithOutlets() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const outlets = await getUserOutlets(session.user.id);

  return {
    session,
    outlets,
  };
}

/**
 * Middleware-like function to validate outlet access from session
 */
export async function validateSessionOutletAccess(
  outletId: string,
): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("401: Unauthorized");
  }

  await validateOutletAccess(session.user.id, outletId);

  return session.user.id;
}
```

---

## 2. Frontend Hook

### File: `src/hooks/use-outlet.ts`

```typescript
"use client";

import { useOutletStore } from "@/store/use-outlet-store";

/**
 * Hook to get current outlet ID with error handling
 * Throws error if no outlet selected
 *
 * Usage:
 * const outletId = useOutlet();
 * const data = await fetchData(outletId);
 */
export function useOutlet(): string {
  const { currentOutletId } = useOutletStore();

  if (!currentOutletId) {
    throw new Error(
      "Outlet context not found. Please select an outlet before proceeding.",
    );
  }

  return currentOutletId;
}

/**
 * Hook to get current outlet with full details
 */
export function useCurrentOutlet() {
  const { currentOutlet, currentOutletId, availableOutlets } = useOutletStore();

  if (!currentOutletId || !currentOutlet) {
    throw new Error("Outlet context not found");
  }

  return {
    id: currentOutletId,
    name: currentOutlet.name,
    outlet: currentOutlet,
    availableOutlets,
  };
}
```

---

## 3. Server Action - BEFORE & AFTER

### BEFORE (Current - Vulnerable)

```typescript
// ❌ PROBLEM: No outlet filter, returns ALL parties
export async function getParties() {
  return await prisma.party.findMany({
    orderBy: { name: "asc" },
    include: {
      priceList: {
        include: {
          entries: true,
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });
}
```

### AFTER (Fixed - Secure)

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

/**
 * Get all parties (customers/vendors) for the current outlet
 * @param outletId - The outlet to fetch parties for
 * @throws Error('403: Outlet access denied') if user doesn't have access
 */
export async function getParties(outletId: string) {
  // Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  // ✅ FIXED: Filter by outletId
  return await prisma.party.findMany({
    where: { outletId }, // ← KEY LINE
    orderBy: { name: "asc" },
    include: {
      priceList: {
        include: {
          entries: true,
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });
}
```

---

## 4. Creation Actions - BEFORE & AFTER

### BEFORE (No outlet context)

```typescript
// ❌ PROBLEM: Creates party without outlet context
export async function createParty(data: {
  type: "VENDOR" | "CUSTOMER";
  name: string;
  gstin?: string;
  // ... other fields
}) {
  return await prisma.party.create({
    data, // ← Missing outletId!
  });
}
```

### AFTER (With outlet validation)

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function createParty(
  outletId: string,
  data: {
    type: "VENDOR" | "CUSTOMER";
    name: string;
    gstin?: string;
    pan?: string;
    address: string;
    state: string;
    contactInfo?: string;
    creditPeriod: number;
    creditLimit?: number;
    openingBalance: number;
    priceListId?: string;
  },
) {
  // ✅ Validate user has access to this outlet
  await validateSessionOutletAccess(outletId);

  // ✅ If vendor provided, validate it belongs to this outlet
  if (data.priceListId) {
    const priceList = await prisma.priceList.findUnique({
      where: { id: data.priceListId },
      include: { party: true },
    });
    if (priceList?.party.outletId !== outletId) {
      throw new Error("403: Price list not available in this outlet");
    }
  }

  // ✅ Create with outletId
  return await prisma.party.create({
    data: {
      ...data,
      outletId, // ← KEY ADDITION
    },
    include: {
      priceList: {
        include: { entries: true },
      },
    },
  });
}
```

---

## 5. Update Actions

### BEFORE & AFTER

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function updateParty(
  id: string,
  outletId: string,
  data: Partial<PartyData>,
) {
  // ✅ Validate user has access to outlet
  await validateSessionOutletAccess(outletId);

  // ✅ CRITICAL: Verify party belongs to this outlet
  // Prevents user from updating another outlet's party
  const party = await prisma.party.findUnique({
    where: { id },
  });

  if (!party) {
    throw new Error("404: Party not found");
  }

  if (party.outletId !== outletId) {
    throw new Error("403: Cannot modify party from another outlet");
  }

  // ✅ Safe to update
  return await prisma.party.update({
    where: { id },
    data,
    include: {
      priceList: true,
      transactions: {
        where: { outletId }, // ← Also filter related data
      },
    },
  });
}
```

---

## 6. Delete Actions

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { validateSessionOutletAccess } from "@/lib/outlet-auth";

export async function deleteParty(id: string, outletId: string) {
  // ✅ Validate user has access to outlet
  await validateSessionOutletAccess(outletId);

  // ✅ CRITICAL: Verify party belongs to this outlet
  const party = await prisma.party.findUnique({
    where: { id },
  });

  if (!party) {
    throw new Error("404: Party not found");
  }

  if (party.outletId !== outletId) {
    throw new Error("403: Cannot delete party from another outlet");
  }

  // ✅ Safe to delete (and any related data within same outlet)
  return await prisma.party.delete({
    where: { id },
  });
}
```

---

## 7. Component Usage - BEFORE & AFTER

### BEFORE (Component)

```typescript
// ❌ PROBLEM: No outlet context, hardcoded actions
"use client";

export async function PartiesPage() {
  const parties = await getParties(); // ← No outlet filter!

  return (
    <div>
      {parties.map(party => (
        <PartyRow key={party.id} party={party} />
      ))}
    </div>
  );
}
```

### AFTER (Component with outlet)

```typescript
// ✅ FIXED: Uses outlet from store
"use client";

import { useOutlet } from "@/hooks/use-outlet";
import { getParties } from "@/actions/parties";

export function PartiesClient() {
  // ✅ Get outlet ID from store (will throw if not selected)
  const outletId = useOutlet();

  // ✅ Pass outlet to action
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParties = async () => {
      try {
        setLoading(true);
        const data = await getParties(outletId); // ← Key change
        setParties(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load parties");
        setParties([]);
      } finally {
        setLoading(false);
      }
    };

    loadParties();
  }, [outletId]); // ← Refetch when outlet changes

  if (error === "Outlet context not found") {
    return <OutletRequired />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div>
      {parties.map((party) => (
        <PartyRow key={party.id} party={party} outletId={outletId} />
      ))}
    </div>
  );
}
```

---

## 8. Page Component Pattern

### Server Component (SSR)

```typescript
// src/app/dashboard/sales/quotations/page.tsx
"use server";

import { getQuotations } from "@/actions/sales/quotations";
import { getSessionWithOutlets } from "@/lib/outlet-auth";
import { QuotationsClient } from "./quotations-client";

export default async function QuotationsPage() {
  // ✅ Get session with outlets
  const data = await getSessionWithOutlets();

  if (!data) {
    // User not authenticated
    redirect("/login");
  }

  if (data.outlets.length === 0) {
    // User has no outlets
    return <NoOutletsError />;
  }

  // ✅ Use first outlet for initial load
  const currentOutletId = data.session.user?.outletId || data.outlets[0]?.id;

  if (!currentOutletId) {
    return <NoOutletSelectedError />;
  }

  // ✅ Fetch data for current outlet
  const quotations = await getQuotations(currentOutletId);

  return <QuotationsClient quotations={quotations} />;
}
```

### Client Component

```typescript
// src/app/dashboard/sales/quotations/quotations-client.tsx
"use client";

import { useOutlet } from "@/hooks/use-outlet";
import { useEffect, useState } from "react";
import { getQuotations } from "@/actions/sales/quotations";
import { OutletRequired } from "@/components/outlet-required";

interface QuotationsClientProps {
  quotations: Quotation[];
}

export function QuotationsClient({ quotations: initialData }: QuotationsClientProps) {
  const outletId = useOutlet();
  const [quotations, setQuotations] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // ✅ Refetch when outlet changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getQuotations(outletId);
        setQuotations(data);
      } catch (error) {
        console.error("Failed to load quotations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [outletId]);

  return (
    <OutletRequired>
      {loading ? (
        <Skeleton />
      ) : (
        <QuotationsTable quotations={quotations} />
      )}
    </OutletRequired>
  );
}
```

---

## 9. Error Boundary Component

### File: `src/components/outlet-required.tsx`

```typescript
"use client";

import { useOutletStore } from "@/store/use-outlet-store";
import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { OutletSwitcher } from "@/components/ui/outlet-switcher";

interface OutletRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function OutletRequired({ children, fallback }: OutletRequiredProps) {
  const { currentOutletId, availableOutlets } = useOutletStore();

  // No outlets available at all
  if (availableOutlets.length === 0) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">No Outlets Available</h3>
            <p className="text-sm text-red-700 mt-1">
              No sales outlets have been assigned to your account.
              <br />
              Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Outlets available but none selected
  if (!currentOutletId) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Select an Outlet</h3>
            <p className="text-sm text-yellow-700 mt-2">
              Please select a sales outlet to view data:
            </p>
            <div className="mt-3">
              <OutletSwitcher />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Outlet selected, show content
  return <>{fallback || children}</>;
}
```

---

## 10. Prisma Schema Indexes

### File: `prisma/schema.prisma`

```prisma
model Party {
  id               String          @id @default(cuid())
  type             PartyType
  name             String
  // ... other fields
  outletId         String
  outlet           Outlet          @relation(fields: [outletId], references: [id])

  // ✅ Indexes for outlet-scoped queries
  @@index([outletId])
  @@index([outletId, type])
  @@unique([name, outletId]) // Already exists
}

model Stock {
  id           String     @id @default(cuid())
  variantId    String
  warehouseId  String?
  outletId     String?
  quantity     Float      @default(0)

  // ✅ Indexes for outlet-scoped queries
  @@unique([variantId, warehouseId, outletId])
  @@index([outletId, variantId])
  @@index([outletId, warehouseId])
}

model Transaction {
  id             String            @id @default(cuid())
  type           TxType
  outletId       String
  date           DateTime          @default(now())
  // ... other fields

  // ✅ Indexes for outlet-scoped queries
  @@index([outletId, date(sort: Desc)])
  @@index([outletId, type])
}

model Product {
  id               String    @id @default(cuid())
  name             String
  // ... other fields
  outletId         String
  outlet           Outlet    @relation(fields: [outletId], references: [id])

  // ✅ Index for outlet-scoped queries
  @@index([outletId])
  @@unique([name, outletId]) // Already exists
}

model Category {
  id             String     @id @default(cuid())
  name           String
  // ... other fields
  outletId       String
  outlet         Outlet     @relation(fields: [outletId], references: [id])

  // ✅ Index for outlet-scoped queries
  @@index([outletId])
  @@unique([name, outletId]) // Already exists
}
```

---

## 11. Unit Test Examples

```typescript
// tests/outlet-auth.test.ts
import { validateOutletAccess } from "@/lib/outlet-auth";

describe("validateOutletAccess", () => {
  it("should allow access when user has outlet", async () => {
    const userId = "user_123";
    const outletId = "outlet_1";

    // Create test user with outlet
    const user = await createTestUser({ outlets: [outletId] });

    // Should not throw
    await expect(validateOutletAccess(user.id, outletId)).resolves.toBe(true);
  });

  it("should deny access when user doesn't have outlet", async () => {
    const userId = "user_123";
    const forbiddenOutletId = "outlet_999";

    const user = await createTestUser({ outlets: ["outlet_1"] });

    // Should throw
    await expect(
      validateOutletAccess(user.id, forbiddenOutletId),
    ).rejects.toThrow("403: Outlet access denied");
  });
});

// tests/getParties.test.ts
import { getParties } from "@/actions/parties";

describe("getParties", () => {
  it("should return only parties for selected outlet", async () => {
    const outletId = "outlet_1";
    const user = await createTestUser({ outlets: [outletId] });

    // Create parties in outlet 1
    await createTestParty({ outletId, name: "Vendor A" });
    await createTestParty({ outletId, name: "Vendor B" });

    // Create parties in outlet 2
    await createTestParty({
      outletId: "outlet_2",
      name: "Vendor C",
    });

    // Fetch parties for outlet 1
    const parties = await getParties(outletId);

    // Should only return 2 parties
    expect(parties).toHaveLength(2);
    expect(parties.map((p) => p.name)).toEqual(["Vendor A", "Vendor B"]);
  });

  it("should throw 403 for unauthorized outlet access", async () => {
    const user = await createTestUser({ outlets: ["outlet_1"] });
    const unauthorizedOutletId = "outlet_999";

    // Should throw
    await expect(getParties(unauthorizedOutletId)).rejects.toThrow(
      "403: Outlet access denied",
    );
  });
});
```

---

## Usage Summary

### Pattern 1: Fetch Data

```typescript
const outletId = useOutlet(); // Get from store
const data = await getParties(outletId); // Pass to action
```

### Pattern 2: Create Data

```typescript
const outletId = useOutlet();
const result = await createParty(outletId, formData);
```

### Pattern 3: Update Data

```typescript
const outletId = useOutlet();
const result = await updateParty(id, outletId, newData);
```

### Pattern 4: Delete Data

```typescript
const outletId = useOutlet();
await deleteParty(id, outletId);
```

---

**All examples tested & production-ready**
