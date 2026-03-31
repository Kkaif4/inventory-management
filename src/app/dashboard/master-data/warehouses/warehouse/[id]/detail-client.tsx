"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Store, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutletStore } from "@/store/use-outlet-store";

interface Warehouse {
  id: string;
  name: string;
  address?: string | null;
  state?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  isDefault?: boolean;
  outlet?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    stocks: number;
  };
}

interface WarehouseDetailClientProps {
  warehouse: Warehouse;
}

type TabType = "warehouse-info" | "outlet-settings";

export function WarehouseDetailClient({
  warehouse,
}: WarehouseDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("warehouse-info");
  const currentOutlet = useOutletStore((state) => state.currentOutlet);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/master-data/warehouses"
            className="text-slate-500 hover:text-slate-700 mb-2 inline-flex items-center text-sm"
          >
            ← Back to Warehouses
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {warehouse.name}
          </h1>
        </div>
        <Link
          href={`/dashboard/master-data/warehouses/warehouse/${warehouse.id}/edit`}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          Edit Warehouse
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("warehouse-info")}
            className={`py-3 px-1 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "warehouse-info"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Warehouse Info
          </button>
          <button
            onClick={() => setActiveTab("outlet-settings")}
            className={`py-3 px-1 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "outlet-settings"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Outlet Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Warehouse Info Tab */}
        {activeTab === "warehouse-info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2">
                  Warehouse Name
                </label>
                <p className="text-lg font-bold text-slate-900">
                  {warehouse.name}
                </p>
              </div>

              {/* Outlet Assignment */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2 flex items-center gap-2">
                  <Store className="w-3 h-3" />
                  Assigned Outlet
                </label>
                {warehouse.outlet ? (
                  <p className="text-lg font-bold text-slate-900">
                    {warehouse.outlet.name}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">Not assigned</p>
                )}
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Address
                </label>
                <p className="text-slate-900">
                  {warehouse.address || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
              </div>

              {/* State */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2">
                  State
                </label>
                <p className="text-slate-900">
                  {warehouse.state || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
              </div>

              {/* Contact Name */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2 flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Contact Name
                </label>
                <p className="text-slate-900">
                  {warehouse.contactName || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
              </div>

              {/* Contact Phone */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Contact Phone
                </label>
                <p className="text-slate-900">
                  {warehouse.contactPhone || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </p>
              </div>

              {/* SKU Points */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2">
                  SKU Points
                </label>
                <p className="text-lg font-bold text-amber-600">
                  {warehouse._count?.stocks || 0} SKUs
                </p>
              </div>

              {/* Default Status */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-2">
                  Default Warehouse
                </label>
                <p className="text-slate-900">
                  {warehouse.isDefault ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      Yes
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Outlet Settings Tab */}
        {activeTab === "outlet-settings" && (
          <div className="space-y-6">
            {currentOutlet ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest block mb-4">
                    Current Outlet
                  </label>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {currentOutlet.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Selected from outlet switcher in header
                      </p>
                    </div>
                    {currentOutlet.color && (
                      <div
                        className="w-12 h-12 rounded-lg border border-slate-200"
                        style={{ backgroundColor: currentOutlet.color }}
                      />
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> This tab shows the currently active outlet
                    from the outlet selector. For full outlet configuration details
                    (address, GSTIN, invoice settings, policies), please go to the
                    outlet settings page.
                  </p>
                </div>

                <Link
                  href="/settings/outlets"
                  className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Go to Outlet Settings
                </Link>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-bold mb-4">
                  No outlet selected
                </p>
                <p className="text-slate-500 text-sm">
                  Switch to an outlet using the outlet selector in the header to
                  view its active status and access settings.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
