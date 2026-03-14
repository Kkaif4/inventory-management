export const dynamic = "force-dynamic";
import { getLocations } from "@/actions/locations";
import Link from "next/link";
import {
  Store,
  Plus,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Edit2,
  Building2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DeleteLocationButton } from "../_components/delete-location-button";

export default async function OutletsPage() {
  const res = await getLocations();
  const outlets = res.data?.outlets || [];
  const warehouses = res.data?.warehouses || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin: Outlet Management"
        subtitle="Configure points of sale, invoice series, and fulfillment priorities."
        breadcrumbs={[{ label: "Admin" }, { label: "Outlets" }]}
      />

      <div className="flex justify-end px-2">
        <Link
          href="/dashboard/admin/outlets/new"
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
        >
          <Plus className="w-4 h-4 mr-2" /> Establish New Outlet
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.length === 0 ? (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">
              No sales outlets established.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Outlets are required to start billing and inventory tracking.
            </p>
          </div>
        ) : (
          outlets.map((o) => (
            <div
              key={o.id}
              className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <div className="flex items-center space-x-1">
                  <Link
                    href={`/dashboard/admin/outlets/${o.id}/edit`}
                    className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2.5 rounded-2xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <DeleteLocationButton id={o.id} type="outlet" name={o.name} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-xl font-black text-slate-900 uppercase leading-none">
                    {o.name}
                  </h4>
                  <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg font-black tracking-tighter">
                    {o.invoicePrefix}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-400 font-medium pt-1">
                  <MapPin className="w-3.5 h-3.5 mr-2" />
                  {o.state || "Not set"}, India
                </div>
              </div>

              <div className="mt-6 space-y-3 pb-6 border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Default Source
                  </span>
                  <div className="flex items-center text-xs font-black text-slate-700">
                    <Building2 className="w-3 h-3 mr-1.5 text-blue-500" />
                    {o.warehouses.find((w) => w.id === o.defaultWarehouseId)
                      ?.name ||
                      o.warehouses[0]?.name ||
                      "None"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Policy
                  </span>
                  {o.negativeStockPolicy === "BLOCK" ? (
                    <div className="flex items-center text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-tight">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Strict Block
                    </div>
                  ) : o.negativeStockPolicy === "WARN" ? (
                    <div className="flex items-center text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-tight">
                      <AlertCircle className="w-3 h-3 mr-1" /> Warn User
                    </div>
                  ) : (
                    <div className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-tight">
                      Allow Negative
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>{o._count?.users || 0} Assigned</span>
                </div>
                <button className="text-emerald-600 text-xs font-black flex items-center hover:translate-x-1 transition-transform">
                  Manage <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
