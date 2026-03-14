"use client";

import { useState, useEffect } from "react";
import { Search, Users, Package, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/actions/products";
import { getVendorsByProduct } from "@/actions/parties";
import { useOutletStore } from "@/store/use-outlet-store";
import { toast } from "sonner";

export default function VendorSearchPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { currentOutletId } = useOutletStore();
  if (!currentOutletId) return;

  useEffect(() => {
    getProducts(currentOutletId).then((res) => {
      if (res.success) setProducts(res.data!);
      else toast.error("Failed to load products");
    });
  }, [currentOutletId]);

  const handleSearch = async (variantId: string) => {
    if (!variantId) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setSelectedVariantId(variantId);
    try {
      const res = await getVendorsByProduct(variantId, currentOutletId);
      if (res.success) {
        setResults(res.data!);
      } else {
        toast.error("Search failed: " + res.error?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Vendor Sourcing Tool
        </h2>
        <p className="text-slate-500 mt-1">
          Find and compare vendors based on the products they supply.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest mb-4 ml-1">
          Search by Product / Item
        </label>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <select
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none"
          >
            <option value="">Select a product to find its suppliers...</option>
            {products.map((p) => (
              <optgroup key={p.id} label={p.name}>
                {p.variants.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.sku} ({p.name})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse space-y-4"
              >
                <div className="h-6 bg-slate-100 rounded w-1/2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-20 bg-slate-50 rounded"></div>
              </div>
            ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((vendor) => (
            <div
              key={vendor.id}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/dashboard/master-data/parties/${vendor.id}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                  {vendor.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono tracking-tighter uppercase">
                    {vendor.gstin || "Unregistered"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Credit Period
                  </span>
                  <span className="font-bold text-slate-900">
                    {vendor.creditPeriod} Days
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Region</span>
                  <span className="font-bold text-slate-900">
                    {vendor.state}
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center text-blue-600 font-bold text-xs uppercase tracking-widest">
                    <Package className="w-4 h-4 mr-2" />
                    Item Sourced
                  </div>
                  <Link
                    href="/dashboard/purchases/new"
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center group"
                  >
                    Order Now
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedVariantId ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">
            No registered suppliers found for this item.
          </p>
          <Link
            href="/dashboard/master-data/parties/new"
            className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline"
          >
            Add a new vendor
          </Link>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-inner">
          <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
          <h4 className="text-slate-400 font-bold text-lg">
            Select a product variant above to start sourcing.
          </h4>
          <p className="text-slate-300 text-sm max-w-xs mx-auto mt-2 italic">
            The system will analyze your vendor database to find members who
            supply the selected item.
          </p>
        </div>
      )}
    </div>
  );
}
