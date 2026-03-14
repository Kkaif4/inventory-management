"use client";

import { useSession } from "next-auth/react";
import { logoutAndClearData } from "@/lib/logout";
import { useState, useEffect } from "react";
import { Building2, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { OutletSwitcher } from "@/components/ui/outlet-switcher";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOutletStore } from "@/store/use-outlet-store";
import { getUserOutlets } from "@/actions/users";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setAvailableOutlets } = useOutletStore();

  // Load collapse state and fetch outlets
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");

    const fetchOutlets = async () => {
      try {
        const res = await getUserOutlets();
        if (res.success) {
          setAvailableOutlets(res.data!);
        } else {
          toast.error("Failed to load outlets: " + res.error?.message);
        }
      } catch (error) {
        console.error("Failed to fetch outlets:", error);
      }
    };

    if (
      session?.user?.availableOutlets &&
      session.user.availableOutlets.length > 0
    ) {
      setAvailableOutlets(session.user.availableOutlets as any);
    } else if (session?.user?.id) {
      fetchOutlets();
    }
  }, [session, setAvailableOutlets]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    useOutletStore.getState().reset();
                    logoutAndClearData();
                  }}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 relative">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

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
