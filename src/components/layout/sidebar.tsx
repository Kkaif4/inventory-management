"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  ShoppingCart,
  ReceiptIndianRupee,
  Settings,
  FileText,
  Shield,
  LogOut,
  Boxes,
  Store,
  Users,
  TrendingUp,
  Receipt,
  Quote,
  CreditCard,
  Truck,
  Monitor,
  Landmark,
  BookOpen,
  BarChartBig,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    group: "OVERVIEW",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "PRODUCTS & STOCK",
    items: [
      {
        name: "Categories",
        href: "/dashboard/master-data/categories",
        icon: Boxes,
      },
      {
        name: "Products",
        href: "/dashboard/master-data/products",
        icon: Store,
      },
      {
        name: "Price Lists",
        href: "/dashboard/master-data/price-lists",
        icon: ReceiptIndianRupee,
      },
      { name: "Inventory", href: "/dashboard/inventory", icon: Boxes },
      {
        name: "Warehouses & Outlets",
        href: "/dashboard/master-data/locations",
        icon: Building2,
      },
    ],
  },
  {
    group: "PROCUREMENT",
    items: [
      {
        name: "Purchase Requests",
        href: "/dashboard/purchases/requests",
        icon: FileText,
      },
      {
        name: "Purchase Orders",
        href: "/dashboard/purchases/orders",
        icon: ShoppingCart,
      },
      {
        name: "Purchase Bills",
        href: "/dashboard/purchases/bills",
        icon: Receipt,
      },
      {
        name: "Purchase Returns",
        href: "/dashboard/purchases/returns",
        icon: CreditCard,
      },
      {
        name: "Vendor Metrics",
        href: "/dashboard/purchases/vendor-metrics",
        icon: TrendingUp,
      },
    ],
  },
  {
    group: "SALES",
    items: [
      {
        name: "Quotations",
        href: "/dashboard/sales/quotations",
        icon: Quote,
      },
      {
        name: "Proforma Invoices",
        href: "/dashboard/sales/proforma-invoices",
        icon: Receipt,
      },
      {
        name: "Delivery Challans",
        href: "/dashboard/sales/challans",
        icon: Truck,
      },
      {
        name: "Direct POS Sale",
        href: "/dashboard/sales/pos",
        icon: Monitor,
      },
      {
        name: "Sales Invoices",
        href: "/dashboard/sales/invoices",
        icon: ReceiptIndianRupee,
      },
      {
        name: "Sales Returns",
        href: "/dashboard/sales/returns",
        icon: CreditCard,
      },
      {
        name: "Customers",
        href: "/dashboard/sales/customers",
        icon: Users,
      },
    ],
  },
  {
    group: "FINANCE",
    items: [{ name: "Accounts", href: "/dashboard/accounts", icon: Building2 }],
  },
  {
    group: "FINANCIALS",
    items: [
      {
        name: "General Ledger",
        href: "/dashboard/financials/ledger",
        icon: BookOpen,
      },
      {
        name: "P&L Statement",
        href: "/dashboard/financials/pnl",
        icon: BarChartBig,
      },
      {
        name: "Balance Sheet",
        href: "/dashboard/financials/balance-sheet",
        icon: Landmark,
      },
      {
        name: "GST Reports",
        href: "/dashboard/financials/gst",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    group: "ADMIN",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      {
        name: "Audit Logs",
        href: "/dashboard/settings/audit-logs",
        icon: FileText,
      },
      { name: "Roles Matrix", href: "/dashboard/settings/roles", icon: Shield },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-surface-base border-r border-border-default flex flex-col fixed left-0 bottom-0 top-14 transition-all duration-300 z-30",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 text-current">
        {navigation.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-text-disabled tracking-[0.15em] mb-3">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 rounded-default text-sm transition-all relative",
                    isActive
                      ? "bg-brand-light text-brand font-semibold shadow-[inset_-2px_0_0_#1a56db]"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isCollapsed ? "mx-auto" : "mr-3",
                      isActive
                        ? "text-brand"
                        : "text-text-muted group-hover:text-text-secondary",
                    )}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border-default flex flex-col gap-2">
        {!isCollapsed && (
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-start text-text-secondary hover:bg-red-50 hover:text-red-600 gap-3"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        )}

        <button
          onClick={toggleSidebar}
          className="w-full p-2 flex items-center justify-center text-text-muted hover:bg-surface-elevated rounded-default transition-colors border-none bg-transparent cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
