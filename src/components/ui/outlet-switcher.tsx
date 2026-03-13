import { useState } from "react";
import { ChevronDown, Check, Globe, AlertTriangle } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import { useOutletStore } from "@/store/use-outlet-store";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function OutletSwitcher() {
  const { data: session } = useSession();
  const { currentOutlet, availableOutlets, setOutlet } = useOutletStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingOutletId, setPendingOutletId] = useState<string | null>(null);

  if (!availableOutlets || availableOutlets.length === 0) {
    return null;
  }

  const selected = currentOutlet || availableOutlets[0];
  const isAdmin = session?.user?.role === "ADMIN" || true; // Assuming admin check

  const handleOutletClick = (id: string) => {
    if (id === selected.id) return;

    // In a real app, track unsaved changes via a global hook or state
    // For now, we always show the warning if there are inputs dirty (logical placeholder)
    setPendingOutletId(id);
    setShowConfirm(true);
  };

  const confirmSwitch = () => {
    if (pendingOutletId) {
      setOutlet(pendingOutletId);
      window.location.reload(); // Hard reload to clear all states as per requirement
    }
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-10 px-3 hover:bg-slate-100 flex items-center gap-2 text-slate-600 outline-none focus-visible:ring-0 border border-transparent hover:border-slate-200 rounded-xl transition-all">
            {selected.id === "ALL" ? (
              <div className="w-5 h-5 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Globe className="w-3 h-3" />
              </div>
            ) : (
              <div
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: selected.color || "#6366f1" }}
              />
            )}
            <span className="font-bold text-xs uppercase tracking-tight">
              {selected.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 mt-2 p-2 rounded-2xl shadow-2xl border-slate-100 bg-white/95 backdrop-blur-sm"
          >
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Select Workplace
              </span>
            </div>

            {isAdmin && (
              <>
                <DropdownMenuItem
                  className={`flex items-center justify-between py-3 px-3 cursor-pointer rounded-xl transition-colors mb-1 ${
                    selected.id === "ALL" ? "bg-slate-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => handleOutletClick("ALL")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase text-slate-900 leading-none">
                        All Outlets
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1">
                        Consolidated View
                      </span>
                    </div>
                  </div>
                  {selected.id === "ALL" && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50 mx-2" />
              </>
            )}

            {availableOutlets.map(
              (outlet: { id: string; name: string; color?: string }) => (
                <DropdownMenuItem
                  key={outlet.id}
                  className={`flex items-center justify-between py-3 px-3 cursor-pointer rounded-xl transition-colors mt-1 ${
                    selected.id === outlet.id
                      ? "bg-emerald-50/50"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => handleOutletClick(outlet.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full ring-4 ring-offset-2 ring-transparent"
                      style={{
                        backgroundColor: outlet.color || "#6366f1",
                        boxShadow:
                          selected.id === outlet.id
                            ? `0 0 10px ${outlet.color || "#6366f1"}44`
                            : "none",
                      }}
                    />
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-bold uppercase leading-none ${
                          selected.id === outlet.id
                            ? "text-emerald-900"
                            : "text-slate-700"
                        }`}
                      >
                        {outlet.name}
                      </span>
                    </div>
                  </div>
                  {selected.id === outlet.id && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden max-w-sm">
          <div className="bg-amber-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black text-amber-900 uppercase tracking-tight">
                Switching Workspace
              </AlertDialogTitle>
              <AlertDialogDescription className="text-amber-800/70 font-medium text-sm">
                Any unsaved changes in your current forms will be lost. The page
                will refresh to load the new context.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-6 pt-0 bg-white flex items-center justify-center gap-3 sm:justify-center">
            <AlertDialogCancel className="rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-bold text-xs uppercase px-8 hover:bg-slate-100 transition-all hover:text-slate-900">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSwitch}
              className="rounded-2xl bg-amber-600 text-white font-bold text-xs uppercase px-8 hover:bg-amber-700 transition-all shadow-xl shadow-amber-100"
            >
              Continue Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
