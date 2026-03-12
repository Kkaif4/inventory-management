export const dynamic = "force-dynamic";
import { getLocations } from "@/actions/locations";

import Link from "next/link";
import {
  Building2,
  Store,
  Plus,
  MapPin,
  Boxes,
  Users,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Edit2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DeleteLocationButton } from "./_components/delete-location-button";

export default async function LocationsPage() {
  const { warehouses, outlets } = await getLocations();

  const totalStocks = warehouses.reduce(
    (acc, w) => acc + (w._count?.stocks || 0),
    0,
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Locations Management"
        subtitle="Manage the logical and physical storage infrastructure of your enterprise."
        breadcrumbs={[{ label: "Master Data" }, { label: "Locations" }]}
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Warehouses
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {warehouses.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <Store className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Active Outlets
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {outlets.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
            <Boxes className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Stock Points
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {totalStocks}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Network Status
          </p>
          <p className="text-3xl font-black text-white mt-1">Operational</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Warehouses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Warehouses
              </h3>
            </div>
            <Link
              href="/dashboard/master-data/locations/warehouse/new"
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Warehouse
            </Link>
          </div>

          <div className="space-y-4">
            {warehouses.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">
                  No warehouses established yet.
                </p>
              </div>
            ) : (
              warehouses.map((w) => (
                <div
                  key={w.id}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900">
                        {w.name}
                      </h4>
                      <div className="flex items-center text-sm text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 mr-2 text-slate-400" />
                        {w.address || "Main Distribution Hub"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Link
                        href={`/dashboard/master-data/locations/warehouse/${w.id}/edit`}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteLocationButton
                        id={w.id}
                        type="warehouse"
                        name={w.name}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <Boxes className="w-3.5 h-3.5 mr-1.5" />
                        {w._count?.stocks || 0} SKU Points
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {w._count?.outlets || 0} Linked Outlets
                      </div>
                    </div>
                    <button className="text-blue-600 text-xs font-black flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ArrowRight className="w-3 h-3 ml-1.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Outlets Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Store className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Sales Outlets
              </h3>
            </div>
            <Link
              href="/dashboard/master-data/locations/outlet/new"
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Outlet
            </Link>
          </div>

          <div className="space-y-4">
            {outlets.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">
                  No points of sale configured.
                </p>
              </div>
            ) : (
              outlets.map((o) => (
                <div
                  key={o.id}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-black text-slate-900">
                          {o.name}
                        </h4>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-black border border-emerald-100">
                          {o.invoicePrefix}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1">
                        Sourced via:{" "}
                        {o.warehouses.map((w) => w.name).join(", ") ||
                          "Direct Supply"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/dashboard/master-data/locations/outlet/${o.id}/edit`}
                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <DeleteLocationButton
                          id={o.id}
                          type="outlet"
                          name={o.name}
                        />
                      </div>
                      {o.negativeStockPolicy === "BLOCK" ? (
                        <div className="flex items-center text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Strict Block
                        </div>
                      ) : o.negativeStockPolicy === "WARN" ? (
                        <div className="flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                          <AlertCircle className="w-3 h-3 mr-1" /> Warn Only
                        </div>
                      ) : (
                        <div className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                          Allow Negative
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        {o._count?.users || 0} Users assigned
                      </div>
                    </div>
                    <button className="text-emerald-600 text-xs font-black flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Quick Manage <ArrowRight className="w-3 h-3 ml-1.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
