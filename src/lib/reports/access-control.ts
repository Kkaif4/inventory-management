import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateSessionOutletAccess } from '@/lib/outlet-auth';

type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'SALES' | 'INVENTORY_MANAGER';

/**
 * Report access control matrix
 * Maps report IDs to allowed roles
 */
export const REPORT_ACCESS_MATRIX: Record<string, UserRole[]> = {
  // Sales
  'sales/register': ['ADMIN', 'ACCOUNTANT', 'SALES'],
  'sales/outstanding': ['ADMIN', 'ACCOUNTANT', 'SALES'],
  'sales/items': ['ADMIN', 'ACCOUNTANT', 'SALES', 'INVENTORY_MANAGER'],

  // Purchase
  'purchase/register': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'purchase/outstanding': ['ADMIN', 'ACCOUNTANT'],
  'purchase/grn': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],

  // Inventory
  'inventory/current-stock': ['ADMIN', 'ACCOUNTANT', 'SALES', 'INVENTORY_MANAGER'],
  'inventory/low-stock': ['ADMIN', 'ACCOUNTANT', 'SALES', 'INVENTORY_MANAGER'],
  'inventory/ledger': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'inventory/valuation': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],
  'inventory/slow-moving': ['ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'],

  // GST
  'gst/gstr1': ['ADMIN', 'ACCOUNTANT'],
  'gst/gstr3b': ['ADMIN', 'ACCOUNTANT'],
  'gst/itc': ['ADMIN', 'ACCOUNTANT'],

  // Financial
  'finance/trial-balance': ['ADMIN', 'ACCOUNTANT'],
  'finance/pl': ['ADMIN', 'ACCOUNTANT'],
  'finance/balance-sheet': ['ADMIN', 'ACCOUNTANT'],
  'finance/cash-flow': ['ADMIN', 'ACCOUNTANT'],

  // Cash Memos
  'cash-memos': ['ADMIN', 'ACCOUNTANT', 'SALES'],
};

/**
 * Check if user has access to a specific report
 */
export async function checkReportAccess(reportId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return false;
  }

  const allowedRoles = REPORT_ACCESS_MATRIX[reportId];
  if (!allowedRoles || !allowedRoles.includes(session.user.role as UserRole)) {
    return false;
  }

  // For non-admin users, verify they have at least one outlet
  if (session.user.role !== 'ADMIN') {
    try {
      // This will throw if user has no outlet access
      const outletId = (session.user as any).availableOutlets?.[0]?.id as string;
      if (outletId) {
        await validateSessionOutletAccess(outletId);
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Get list of accessible reports for current user
 */
export async function getAccessibleReports(): Promise<string[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return [];
  }

  return Object.entries(REPORT_ACCESS_MATRIX)
    .filter(([, roles]) => roles.includes(session.user.role as UserRole))
    .map(([reportId]) => reportId);
}

/**
 * Get outlet selector configuration for current user
 * Returns { outlets, canSelect, defaultOutletId }
 */
export async function getOutletSelectorConfig(userId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      outlets: [],
      canSelect: false,
      defaultOutletId: null,
    };
  }

  const role = session.user.role as UserRole;

  if (role === 'ADMIN') {
    // Admin can select any outlet
    const { prisma } = await import('@/lib/prisma');
    const outlets = await prisma.outlet.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return {
      outlets,
      canSelect: true,
      defaultOutletId: null,
    };
  }

  // Non-admin: locked to their assigned outlet(s)
  const { prisma } = await import('@/lib/prisma');
  const userOutlets = await prisma.outlet.findMany({
    where: {
      users: {
        some: { id: userId },
      },
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return {
    outlets: userOutlets,
    canSelect: false,
    defaultOutletId: userOutlets[0]?.id || null,
  };
}

/**
 * Get restricted outlet ID for non-admin users
 * Returns the outlet ID if non-admin (single outlet only)
 * Returns null if admin (can view all)
 */
export async function getRestrictedOutletId(userId: string): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const role = session.user.role as UserRole;

  if (role === 'ADMIN') {
    return null; // Admin can see all outlets
  }

  // Non-admin: return their assigned outlet
  const { prisma } = await import('@/lib/prisma');
  const userOutlets = await prisma.outlet.findMany({
    where: {
      users: {
        some: { id: userId },
      },
    },
    select: { id: true },
    take: 1,
  });

  return userOutlets[0]?.id || null;
}
