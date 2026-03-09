import { getLocations } from "@/actions/locations";
import Link from "next/link";
import { Building2, Store, Plus } from "lucide-react";

export default async function LocationsPage() {
  const { warehouses, outlets } = await getLocations();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Locations Management
          </h2>
          <p className="text-slate-500 mt-1">
            Manage physical warehouses and sales outlets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Warehouses Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Warehouses</h3>
            </div>
            <Link
              href="/dashboard/master-data/locations/warehouse/new"
              className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {warehouses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No warehouses configured.
              </div>
            ) : (
              warehouses.map((w) => (
                <div
                  key={w.id}
                  className="p-4 hover:bg-slate-50 flex justify-between items-start transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-slate-900">{w.name}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 max-w-sm truncate">
                      {w.address || "No address specified"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <div className="bg-slate-100 px-2 py-1 rounded inline-block">
                      {w._count.outlets} Linked Outlets
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Outlets Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Sales Outlets</h3>
            </div>
            <Link
              href="/dashboard/master-data/locations/outlet/new"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {outlets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No outlets configured.
              </div>
            ) : (
              outlets.map((o) => (
                <div
                  key={o.id}
                  className="p-4 hover:bg-slate-50 flex justify-between items-start transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{o.name}</h4>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-mono">
                        {o.invoicePrefix}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {o.warehouses.map((w) => w.name).join(", ") ||
                        "No linked warehouses"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <span className="bg-slate-100 px-2 py-1 rounded inline-block">
                      Stock: {o.negativeStockPolicy}
                    </span>
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
