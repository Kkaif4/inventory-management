export const dynamic = "force-dynamic";
import { getLocations } from "@/actions/locations";
import Link from "next/link";
import {
  Building2,
  Plus,
  MapPin,
  Boxes,
  Users,
  ArrowRight,
  Edit2,
  Phone,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DeleteLocationButton } from "../_components/delete-location-button";

export default async function WarehousesPage() {
  const res = await getLocations();
  const warehouses = res.data?.warehouses || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin: Warehouse Management"
        subtitle="Manage logical storage zones and physical distribution hubs."
        breadcrumbs={[{ label: "Admin" }, { label: "Warehouses" }]}
      />

      <div className="flex justify-end px-2">
        <Link
          href="/dashboard/admin/warehouses/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" /> Register New Warehouse
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.length === 0 ? (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">
              No warehouses established yet.
            </p>
          </div>
        ) : (
          warehouses.map((w) => (
            <div
              key={w.id}
              className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-1">
                  <Link
                    href={`/dashboard/admin/warehouses/${w.id}/edit`}
                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-2xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <DeleteLocationButton
                    id={w.id}
                    type="warehouse"
                    name={w.name}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 uppercase leading-none">
                  {w.name}
                </h4>
                <div className="flex items-center text-sm text-slate-400 font-medium pt-1">
                  <MapPin className="w-3.5 h-3.5 mr-2" />
                  {w.address || "Main Distribution Hub"} ({w.state || "—"})
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-slate-50 space-y-2">
                <div className="flex items-center text-[11px] font-black text-slate-500 uppercase">
                  <User className="w-3 h-3 mr-2" />
                  {w.contactName || "No Manager Assigned"}
                </div>
                {w.contactPhone && (
                  <div className="flex items-center text-[10px] font-bold text-slate-400">
                    <Phone className="w-3 h-3 mr-2" />
                    {w.contactPhone}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-xs font-bold text-slate-600">
                    <Boxes className="w-4 h-4 mr-1.5 text-slate-400" />
                    {w._count?.stocks || 0} SKUs
                  </div>
                  <div className="text-[10px] font-black px-2 py-1 bg-white border border-slate-100 rounded-lg text-slate-400">
                    {w._count?.outlets || 0} LINKS
                  </div>
                </div>
                <button className="text-blue-600 text-xs font-black flex items-center hover:translate-x-1 transition-transform">
                  View Stock <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
