"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
  Landmark,
  BookOpen,
  BarChartBig,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useOutletStore } from "@/store/use-outlet-store";
import { logoutAndClearData } from "@/lib/logout";

const navigation = [
  {
    group: "OVERVIEW",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "SALES",
    items: [
      {
        name: "Sales Transactions",
        href: "/dashboard/sales/transactions",
        icon: ReceiptIndianRupee,
      },
      {
        name: "Quotations & Delivery",
        href: "/dashboard/sales/quotations-and-delivery",
        icon: Quote,
      },
    ],
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
        name: "Warehouses",
        href: "/dashboard/master-data/warehouses",
        icon: Building2,
      },
    ],
  },
  {
    group: "PROCUREMENT",
    items: [
      {
        name: "Purchases",
        href: "/dashboard/purchases",
        icon: ShoppingCart,
      },
    ],
  },
  {
    group: "PARTIES",
    items: [
      {
        name: "Customers",
        href: "/dashboard/sales/customers",
        icon: Users,
      },
      {
        name: "Vendors",
        href: "/dashboard/purchase/vendors",
        icon: Truck,
      },
    ],
  },
  {
    group: "REPORTS",
    items: [
      {
        name: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
  //   {
  //     group: "FINANCE",
  //     items: [{ name: "Accounts", href: "/dashboard/accounts", icon: Building2 }],
  //   },
  {
    group: "FINANCIALS",
    items: [
      {
        name: "Accounts",
        href: "/dashboard/financials/accounts",
        icon: CreditCard,
      },
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
      //   { name: "Settings", href: "/dashboard/settings", icon: Settings },
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
  const t = useTranslations("nav");
  const currentOutlet = useOutletStore((state) => state.currentOutlet);

  return (
    <aside
      className={cn(
        "bg-surface-base border-r border-border-default flex flex-col fixed left-0 bottom-0 top-14 transition-all duration-300 z-30",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 text-current">
        {navigation.map((group) => {
          const groupKey = group.group
            .toLowerCase()
            .replace(/ & /g, "And")
            .replace(/ /g, "");
          const groupNameKey = `groups.${groupKey}`;
          return (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-text-disabled tracking-[0.15em] mb-3">
                  {t(groupNameKey as any)}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                // Map item names to keys
                const itemNameMap: Record<string, string> = {
                  Dashboard: "dashboard",
                  "Sales Transactions": "salesTransactions",
                  "Quotations & Delivery": "quotations",
                  Categories: "categories",
                  Products: "products",
                  "Price Lists": "priceLists",
                  Inventory: "inventory",
                  Locations: "locations",
                  Warehouses: "warehouses",
                  Purchases: "purchases",
                  Customers: "customers",
                  Vendors: "vendors",
                  Reports: "reports",
                  Accounts: "accounts",
                  "General Ledger": "ledger",
                  "P&L Statement": "pnl",
                  "Balance Sheet": "balanceSheet",
                  "GST Reports": "gstReports",
                  Settings: "settings",
                  "Audit Logs": "auditLogs",
                  "Roles Matrix": "roles",
                };
                const itemKey =
                  itemNameMap[item.name] ||
                  item.name.toLowerCase().replace(/ /g, "");
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
                    title={isCollapsed ? t(`items.${itemKey}` as any) : ""}
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
                    {!isCollapsed && (
                      <span>{t(`items.${itemKey}` as any)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-default flex flex-col gap-2">
        {!isCollapsed && currentOutlet && currentOutlet.id !== "ALL" && (
          <div className="space-y-2 mb-2">
            <p className="px-3 text-[10px] font-bold text-text-disabled tracking-[0.15em]">
              {t("outletSettings")}
            </p>
            <Link
              href={`/dashboard/admin/outlets/${currentOutlet.id}/edit`}
              className={cn(
                "flex items-center px-3 py-2 rounded-default text-sm transition-all relative",
                pathname.includes(`outlet/${currentOutlet.id}`)
                  ? "bg-brand-light text-brand font-semibold shadow-[inset_-2px_0_0_#1a56db]"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
              )}
            >
              <Store className="w-5 h-5 mr-3 text-emerald-600" />
              <span className="truncate">{currentOutlet.name}</span>
            </Link>
          </div>
        )}

        {!isCollapsed && (
          <Button
            variant="ghost"
            onClick={() => {
              useOutletStore.getState().reset();
              logoutAndClearData();
            }}
            className="w-full justify-start text-text-secondary hover:bg-red-50 hover:text-red-600 gap-3"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("signOut")}</span>
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
