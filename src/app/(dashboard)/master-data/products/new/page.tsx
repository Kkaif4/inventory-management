"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { PackageX, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const variantSchema = z.object({
  sku: z.string().min(2, "SKU required").max(50),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  pricingMethod: z.enum(["MANUAL", "MARKUP"]),
  markupPercent: z.coerce.number().optional(),
  minStockLevel: z.coerce.number().min(0).default(0),
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  brand: z.string().optional(),
  hsnCode: z.string().min(4, "Invalid HSN Code"),
  gstRate: z.coerce.number(),
  baseUnit: z.string().min(1, "Base unit is required"),
  categoryId: z.string().min(1, "Category is required"),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
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
    control,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      gstRate: 18,
      variants: [
        {
          sku: "",
          purchasePrice: 0,
          sellingPrice: 0,
          pricingMethod: "MANUAL",
          minStockLevel: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      await createProduct(data as any);
      router.push("/dashboard/master-data/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product. Ensure SKU is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <PackageX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Product</h2>
            <p className="text-sm text-slate-500">
              Create a new item with variants.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/master-data/products"
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                {...register("name")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 10mm Drill Bit"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Brand
              </label>
              <input
                {...register("brand")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Bosch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                {...register("categoryId")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Base Unit (UoM) *
              </label>
              <input
                {...register("baseUnit")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. NOS, KGS, PCS"
              />
              {errors.baseUnit && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.baseUnit.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                GST Rate (%) *
              </label>
              <select
                {...register("gstRate")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
              {errors.gstRate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gstRate.message}
                </p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                HSN Code *
              </label>
              <input
                {...register("hsnCode")}
                className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 8467"
              />
              {errors.hsnCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.hsnCode.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Product Variants
            </h3>
            <button
              type="button"
              className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 flex items-center font-medium"
              onClick={() =>
                append({
                  sku: "",
                  purchasePrice: 0,
                  sellingPrice: 0,
                  pricingMethod: "MANUAL",
                  minStockLevel: 0,
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" /> Add Variant
            </button>
          </div>

          {errors.variants?.message && (
            <p className="text-red-500 text-sm mb-4">
              {errors.variants.message}
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => {
              const method = watch(`variants.${index}.pricingMethod`);
              return (
                <div
                  key={field.id}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50 grid grid-cols-1 md:grid-cols-6 gap-4 relative"
                >
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      SKU / Barcode *
                    </label>
                    <input
                      {...register(`variants.${index}.sku` as const)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="Unique ID"
                    />
                    {errors.variants?.[index]?.sku && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.variants[index]?.sku?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Cost Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`variants.${index}.purchasePrice` as const)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Pricing Logic
                    </label>
                    <select
                      {...register(`variants.${index}.pricingMethod` as const)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="MANUAL">Manual Entry</option>
                      <option value="MARKUP">% Markup</option>
                    </select>
                  </div>

                  {method === "MARKUP" ? (
                    <div>
                      <label className="block text-xs font-bold text-blue-600 mb-1">
                        Margin % *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register(
                          `variants.${index}.markupPercent` as const,
                        )}
                        className="w-full px-2 py-1.5 text-sm border border-blue-300 bg-blue-50 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Selling Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.sellingPrice` as const)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Min. Stock Alert
                    </label>
                    <input
                      type="number"
                      {...register(`variants.${index}.minStockLevel` as const)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end sticky bottom-6 z-10 bg-white p-4 shadow-lg rounded-xl border border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center shadow-md disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting
              ? "Creating Master Record..."
              : "Save Product & Variants"}
          </button>
        </div>
      </form>
    </div>
  );
}
