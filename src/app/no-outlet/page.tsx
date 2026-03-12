import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { NoOutletLogout } from "@/components/auth/no-outlet-logout";
import { cn } from "@/lib/utils";

export default async function NoOutletPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const outlets = (session.user as any).availableOutlets || [];
  if (outlets.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Access Restricted
        </h1>
        <p className="text-slate-400 mb-8">
          Hello{" "}
          <span className="text-white font-medium">{session.user?.name}</span>,
          your account is authenticated but you haven't been assigned to any
          outlets yet.
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-8 text-sm text-slate-300 text-left">
          <p className="font-semibold text-white mb-1">What should I do?</p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Contact your system administrator</li>
            <li>Request access to an outlet</li>
            <li>Once assigned, refresh this page</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/login" className={cn("py-6")}>
            Return to Login
          </Link>

          <NoOutletLogout className="py-2 text-slate-400 hover:text-white transition-colors justify-center" />
        </div>
      </div>
    </div>
  );
}
