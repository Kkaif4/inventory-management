"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createCategory, getCategories } from "@/actions/categories";
import { FolderPlus, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useOutletStore } from "@/store/use-outlet-store";
import { Button } from "@/components/ui/button";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    getCategories().then((res) => setCategories(res));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormValues) => {
    if (!session?.user?.id || !currentOutletId) {
      toast.error("Unauthorized or no active outlet selected.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createCategory({
        name: data.name,
        parentId: data.parentId === "" ? undefined : data.parentId,
        userId: session.user.id,
        outletId: currentOutletId,
      });
      router.push("/dashboard/master-data/categories");
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Category</h2>
            <p className="text-sm text-slate-500">
              Create a new product classification node.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/master-data/categories"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Power Tools"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Parent Category (Optional)
            </label>
            <select
              {...register("parentId")}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Top Level Category --</option>
              {categories.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
      {!currentOutletId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Outlet Required
              </h3>
              <p className="text-slate-500">
                Please select an active outlet from the switcher in the top
                navigation bar before adding categories to the master catalog.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/master-data/categories")}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
