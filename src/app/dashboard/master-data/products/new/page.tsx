"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createProduct } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { PackageX, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";
import { PRODUCT_UNITS } from "@/lib/constants";
import { AlertTriangle, Info } from "lucide-react";
import { getGstRateByHsn } from "@/lib/hsn-data";

const variantSchema = z.object({
  sku: z.string().min(2, "SKU required").max(50),
  categoryId: z.string().min(1, "Classification is required"),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  pricingMethod: z.enum(["MANUAL", "MARKUP"]),
  markupPercent: z.coerce.number().optional(),
  minStockLevel: z.coerce.number().min(0).default(0),
  specifications: z.any().optional().default({}),
});

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  brand: z.string().optional(),
  hsnCode: z.string().min(4, "Invalid HSN Code"),
  gstRate: z.coerce.number(),
  baseUnit: z.string().min(1, "Base unit is required"),
  purchaseUnit: z.string().optional(),
  salesUnit: z.string().optional(),
  conversionRatio: z.coerce.number().min(1).default(1),
  categoryId: z.string().min(1, "Category is required"),
  parentCategoryId: z.string().min(1, "Parent Category is required"),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  const { data: session } = useSession();

  useEffect(() => {
    getCategories().then((res) => setCategories(res));
  }, []);

  const getCategoryName = (id?: string | null) =>
    id ? categories.find((c) => c.id === id)?.name : undefined;
  const getUnitLabel = (val?: string | null) =>
    val ? PRODUCT_UNITS.find((u) => u.value === val)?.label : undefined;
  const getGstLabel = (val: any) => {
    const s = String(val);
    if (s === "0") return "0% (Exempt)";
    return s ? `${s}%` : undefined;
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      brand: "",
      hsnCode: "",
      gstRate: 18,
      baseUnit: "",
      purchaseUnit: "",
      salesUnit: "",
      conversionRatio: 1,
      categoryId: "",
      parentCategoryId: "",
      variants: [
        {
          sku: "",
          categoryId: "",
          purchasePrice: 0,
          sellingPrice: 0,
          pricingMethod: "MANUAL",
          markupPercent: 0,
          minStockLevel: 0,
          specifications: {},
        },
      ],
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (!session?.user?.id || !currentOutletId) {
        throw new Error("Unauthorized or no active outlet selected.");
      }
      setIsSubmitting(true);
      await createProduct({
        ...data,
        outletId: currentOutletId,
        userId: session.user.id,
      });
      router.push("/dashboard/master-data/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <PackageX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Add Product
            </h2>
            <p className="text-sm text-text-muted">
              Create a new item with variants in the master catalog.
            </p>
          </div>
        </div>
        <Link href="/dashboard/master-data/products">
          <Button variant="secondary" className="hover:bg-surface-hover">
            Cancel
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-surface border-border/50 shadow-none">
            <CardHeader className="border-b border-border/50 pb-4 bg-surface-elevated/20">
              <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10mm Drill Bit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bosch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="parentCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category (Product Type) *</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Parent...">
                              {getCategoryName(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Category *</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category...">
                              {getCategoryName(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="hsnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 8467"
                          {...field}
                          onBlur={(e) => {
                            const rate = getGstRateByHsn(e.target.value);
                            if (rate !== null) {
                              form.setValue("gstRate", rate);
                              toast.info(
                                `GST Rate auto-set to ${rate}% for HSN ${e.target.value}`,
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="gstRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Rate (%) *</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select GST Rate">
                              {getGstLabel(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0% (Exempt)</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="baseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Unit (Smallest e.g. PCS) *</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Base Unit">
                              {getUnitLabel(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="purchaseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Unit (Bulk e.g. BOX)</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Purchase Unit">
                              {getUnitLabel(field.value)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watch("purchaseUnit") && watch("baseUnit") && (
                  <div className="md:col-span-1 lg:col-span-1 flex items-center p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-indigo-400 mr-3" />
                    <p className="text-xs font-medium text-indigo-300">
                      <span className="font-bold">Conversion:</span> 1{" "}
                      {watch("purchaseUnit")} will be auto-converted to its base{" "}
                      {watch("baseUnit")} count during inventory updates.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4 bg-surface-elevated/20">
              <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Product Variants
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10"
                onClick={() =>
                  append({
                    sku: "",
                    categoryId: "",
                    purchasePrice: 0,
                    sellingPrice: 0,
                    pricingMethod: "MANUAL",
                    markupPercent: 0,
                    minStockLevel: 0,
                    specifications: {},
                  })
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="p-6">
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
                      className="p-5 border border-border/50 rounded-xl bg-surface-elevated/50 grid grid-cols-1 md:grid-cols-6 gap-4 relative group"
                    >
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute -top-3 -right-3 bg-destructive/10 text-destructive p-2 rounded-full hover:bg-destructive hover:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <FormField
                        control={control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-xs">
                              SKU / Barcode *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Unique ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`variants.${index}.categoryId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Classification *
                            </FormLabel>
                            <Select
                              onValueChange={(val) => field.onChange(val)}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Cat...">
                                    {getCategoryName(field.value)}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`variants.${index}.purchasePrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Cost Price *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  const val = Number(e.target.value);
                                  const method = watch(
                                    `variants.${index}.pricingMethod`,
                                  );
                                  if (method === "MARKUP") {
                                    const margin =
                                      watch(
                                        `variants.${index}.markupPercent`,
                                      ) || 0;
                                    const sell =
                                      Math.round(
                                        val * (1 + margin / 100) * 100,
                                      ) / 100;
                                    form.setValue(
                                      `variants.${index}.sellingPrice`,
                                      sell,
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`variants.${index}.pricingMethod`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Pricing Logic
                            </FormLabel>
                            <Select
                              onValueChange={(
                                val: "MANUAL" | "MARKUP" | null,
                              ) => {
                                if (!val) return;
                                field.onChange(val);
                                if (val === "MARKUP") {
                                  const cost =
                                    watch(`variants.${index}.purchasePrice`) ||
                                    0;
                                  const margin =
                                    watch(`variants.${index}.markupPercent`) ||
                                    0;
                                  const sell =
                                    Math.round(
                                      cost * (1 + margin / 100) * 100,
                                    ) / 100;
                                  form.setValue(
                                    `variants.${index}.sellingPrice`,
                                    sell,
                                    { shouldTouch: true },
                                  );
                                }
                              }}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {field.value === "MARKUP"
                                      ? "% Markup"
                                      : field.value === "MANUAL"
                                        ? "Manual Entry"
                                        : undefined}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MANUAL">
                                  Manual Entry
                                </SelectItem>
                                <SelectItem value="MARKUP">% Markup</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {method === "MARKUP" ? (
                        <FormField
                          control={control}
                          name={`variants.${index}.markupPercent`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-indigo-400">
                                Margin % *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  className="border-indigo-500/30 bg-indigo-500/5 focus-visible:ring-indigo-500/40"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const margin = Number(e.target.value);
                                    const cost =
                                      watch(
                                        `variants.${index}.purchasePrice`,
                                      ) || 0;
                                    const sell =
                                      Math.round(
                                        cost * (1 + margin / 100) * 100,
                                      ) / 100;
                                    form.setValue(
                                      `variants.${index}.sellingPrice`,
                                      sell,
                                      { shouldTouch: true },
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={control}
                          name={`variants.${index}.sellingPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Selling Price *
                              </FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {method === "MARKUP" && (
                        <div className="flex flex-col justify-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Auto Selling Price
                          </label>
                          <p className="text-sm font-black text-emerald-400">
                            ₹{" "}
                            {(
                              watch(`variants.${index}.sellingPrice`) || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}

                      <FormField
                        control={control}
                        name={`variants.${index}.minStockLevel`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Min. Alert
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end sticky bottom-6 z-10 bg-surface/80 backdrop-blur-xl p-4 shadow-2xl shadow-indigo-900/10 rounded-xl border border-border/60">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 px-8"
              size="lg"
            >
              <Save className="w-5 h-5" />
              {isSubmitting
                ? "Creating Master Record..."
                : "Save Product & Variants"}
            </Button>
          </div>
        </form>
      </Form>
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
                navigation bar before adding products to the master catalog.
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/master-data/products")}
              variant="outline"
              className="w-full py-6 rounded-2xl font-bold"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
