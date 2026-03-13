import { Role } from "../../generated/prisma";

export type Permission =
  | "view:purchase_price"
  | "create:invoice"
  | "approve:adjustment"
  | "manage:products"
  | "manage:inventory";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "view:purchase_price",
    "create:invoice",
    "approve:adjustment",
    "manage:products",
    "manage:inventory",
  ],
  ACCOUNTANT: ["view:purchase_price", "create:invoice", "manage:inventory"],
  SALES: ["create:invoice"],
  INVENTORY_MANAGER: ["manage:products", "manage:inventory"],
};

export const PermissionService = {
  can(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  },

  hasRole(userRole: Role, requiredRoles: Role[]): boolean {
    return requiredRoles.includes(userRole);
  },
};
