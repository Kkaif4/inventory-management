"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Building2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ReceiptIndianRupee,
  Settings,
  LogOut,
  Boxes,
  Store,
  ChevronLeft,
  ChevronRight,
  Bell,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OutletSwitcher } from "@/components/ui/outlet-switcher";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const navigation = [
    {
      group: "OVERVIEW",
      items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      group: "PRODUCTS & STOCK",
      items: [
        {
          name: "Products",
          href: "/dashboard/master-data/products",
          icon: Store,
        },
        { name: "Inventory", href: "/dashboard/inventory", icon: Boxes },
      ],
    },
    {
      group: "PROCUREMENT",
      items: [
        {
          name: "Purchase Orders",
          href: "/dashboard/purchases/orders",
          icon: ShoppingCart,
        },
      ],
    },
    {
      group: "SALES",
      items: [
        {
          name: "Sales Invoices",
          href: "/dashboard/sales/invoices",
          icon: ReceiptIndianRupee,
        },
        {
          name: "Quotations",
          href: "/dashboard/sales/quotations",
          icon: ReceiptIndianRupee,
        },
      ],
    },
    {
      group: "FINANCE",
      items: [
        { name: "Accounts", href: "/dashboard/accounts", icon: Building2 },
      ],
    },
    {
      group: "ADMIN",
      items: [
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="h-14 sticky top-0 z-40 bg-surface-base border-b border-border-default flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-md tracking-tight text-text-primary uppercase">
              Indus<span className="text-brand">ERP</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OutletSwitcher />
          <div className="h-6 w-px bg-border-default mx-2" />
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary h-9 w-9"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 px-2 ml-2 border-l border-border-default">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-text-primary leading-none">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-tighter mt-1 font-semibold">
                {session?.user?.role || "Manager"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xs">
              {session?.user?.name?.[0] || "A"}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
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
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));
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

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 min-h-screen",
            isCollapsed ? "ml-16" : "ml-60",
          )}
        >
          <div className="max-w-screen-2xl mx-auto px-6 py-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
