export const dynamic = "force-dynamic";
import { getUsers } from "@/actions/users";
import { UsersClient } from "./users-client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { useOutletStore } from "@/store/use-outlet-store";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  const { currentOutlet } = useOutletStore();
  if (!currentOutlet) {
    return;
  }
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
        <p>You do not have permission to view User Management.</p>
      </div>
    );
  }

  const users = await getUsers(currentOutlet.id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">
            Manage system access, roles, and location assignments.
          </p>
        </div>
        <Link
          href="/dashboard/master-data/users/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Link>
      </div>

      <UsersClient users={users as any} />
    </div>
  );
}
