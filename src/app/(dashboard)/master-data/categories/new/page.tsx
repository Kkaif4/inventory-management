"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createCategory, getCategories } from "@/actions/categories";
import { FolderPlus, Save } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
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
    try {
      setIsSubmitting(true);
      await createCategory({
        name: data.name,
        parentId: data.parentId === "" ? undefined : data.parentId,
      });
      router.push("/dashboard/master-data/categories");
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category");
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
              {categories.map((c) => (
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
    </div>
  );
}
