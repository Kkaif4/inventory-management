"use client";

import { getParties } from "@/actions/parties";
import Link from "next/link";
import { Plus, IndianRupee, Loader2 } from "lucide-react";
import { useOutletStore } from "@/store/use-outlet-store";
import { useState, useEffect } from "react";

export default function PartiesPage() {
  const { currentOutletId } = useOutletStore();
  const [parties, setParties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOutletId) {
      setIsLoading(true);
      getParties(currentOutletId)
        .then(setParties)
        .finally(() => setIsLoading(false));
    }
  }, [currentOutletId]);

  if (!currentOutletId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Party Directory</h2>
          <p className="text-slate-500 mt-1">
            Manage Customers and Vendors (Creditors & Debtors).
          </p>
        </div>
        <Link
          href="/dashboard/master-data/parties/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Party
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="px-6 py-4 font-medium">Entity Name</th>
                <th className="px-6 py-4 font-medium w-32">Type</th>
                <th className="px-6 py-4 font-medium w-48">GSTIN / Region</th>
                <th className="px-6 py-4 font-medium text-right w-48">
                  Credit Details
                </th>
                <th className="px-6 py-4 font-medium text-right w-40">
                  Opening Bal.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {parties.map((party) => (
                <tr
                  key={party.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {party.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {party.contactInfo || "No contact info"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        party.type === "CUSTOMER"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}
                    >
                      {party.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 font-mono text-xs">
                      {party.gstin || "Unregistered"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {party.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-slate-700">
                      {party.creditPeriod} Days
                    </div>
                    {party.creditLimit ? (
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-end">
                        Limit: <IndianRupee className="w-3 h-3 mx-0.5" />
                        {party.creditLimit.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 mt-0.5">
                        No Limit Setup
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" />
                    {party.openingBalance.toLocaleString()}
                    <span className="text-xs text-slate-400 ml-1 font-normal">
                      {party.openingBalance > 0
                        ? party.type === "CUSTOMER"
                          ? "Dr."
                          : "Cr."
                        : ""}
                    </span>
                  </td>
                </tr>
              ))}
              {parties.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No parties found in the directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
