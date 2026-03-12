export const dynamic = "force-dynamic";
import { getCategories } from "@/actions/categories";

import { Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Helper to format the hierarchy path for display
  const getHierarchyPath = (category: any) => {
    const path = [category.name];
    let current = category.parent;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Product Categories
          </h2>
          <p className="text-slate-500 mt-1">
            Manage the multi-level product taxonomy.
          </p>
        </div>
        <Link
          href="/dashboard/master-data/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="px-6 py-4 font-medium">Category Hierarchy</th>
                <th className="px-6 py-4 font-medium w-1/4">Name</th>
                <th className="px-6 py-4 font-medium text-center w-32">
                  Sub-categories
                </th>
                <th className="px-6 py-4 font-medium text-center w-32">
                  Products
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {categories.map((cat) => {
                const hierarchyPath = getHierarchyPath(cat);
                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-slate-500 text-xs">
                        {hierarchyPath.map((segment, idx) => (
                          <span key={idx} className="flex items-center">
                            <span
                              className={
                                idx === hierarchyPath.length - 1
                                  ? "font-semibold text-slate-900 text-sm"
                                  : ""
                              }
                            >
                              {segment}
                            </span>
                            {idx < hierarchyPath.length - 1 && (
                              <ChevronRight className="w-3 h-3 mx-1" />
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {cat._count.children}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {cat._count.products}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No categories defined.
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
