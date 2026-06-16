"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { updateProduct } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { Package, Save, Loader2, Info } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

import { useSession } from "next-auth/react";
import { PRODUCT_UNITS } from "@/lib/constants";
import { getGstRateByHsn } from "@/lib/hsn-data";
import {
  ProductEditFormValues,
  productEditSchema,
} from "@/validations/product.validation";

interface ProductWithVariants {
  id: string;
  name: string;
  brand: string | null;
  hsnCode: string;
  gstRate: number;
  baseUnit: string;
  purchaseUnit: string | null;
  conversionRatio: number;
  categoryId: string;
  hasSerialNumbers?: boolean;
  warrantyMonths?: number;
  variants: {
    id: string;
    sku: string;
    minStockLevel: number;
    purchasePrice: number;
    sellingPrice: number;
    pricingMethod: string;
    markupPercent: number | null;
  }[];
}

export function ProductEditClient({
  product,
}: {
  product: ProductWithVariants;
}) {
  const router = useRouter();
  const t = useTranslations("products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  const { data: session } = useSession();

  useEffect(() => {
    getCategories().then((res) => {
      if (res.success) {
        setCategories(res.data!);
      } else {
        toast.error(t("toasts.loadCategoriesFailed") + ": " + res.error?.message);
      }
    });
  }, []);

  const getCategoryName = (id?: string | null) =>
    id ? categories.find((c) => c.id === id)?.name : undefined;
  const getUnitLabel = (val?: string | null): string =>
    val ? (PRODUCT_UNITS.find((u) => u.value === val)?.label ?? "") : "";
  const getGstLabel = (val: any) => {
    const s = String(val);
    if (s === "0") return "0% (Exempt)";
    return s ? `${s}%` : `${val}%` || undefined;
  };

  const form = useForm<ProductEditFormValues>({
    resolver: zodResolver(productEditSchema) as any,
    defaultValues: {
      name: product.name,
      brand: product.brand || "",
      hsnCode: product.hsnCode,
      gstRate: product.gstRate,
      baseUnit: product.baseUnit,
      purchaseUnit: product.purchaseUnit || "",
      conversionRatio: product.conversionRatio || 1,
      categoryId: product.categoryId,
      hasSerialNumbers: product.hasSerialNumbers || false,
      warrantyMonths: product.warrantyMonths || 0,
      variants: product.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        minStockLevel: Number(v.minStockLevel),
        purchasePrice: Number(v.purchasePrice),
        sellingPrice: Number(v.sellingPrice),
        pricingMethod: (v.pricingMethod as "MANUAL" | "MARKUP") || "MANUAL",
        markupPercent: v.markupPercent ? Number(v.markupPercent) : null,
      })),
    },
  });

  const {
    handleSubmit,
    control,
    watch,
  } = form;

  const { fields } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: ProductEditFormValues) => {
    try {
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
      setIsSubmitting(true);
      const res = await updateProduct(product.id, {
        name: data.name,
        brand: data.brand || null,
        hsnCode: data.hsnCode || null,
        gstRate: data.gstRate,
        baseUnit: data.baseUnit,
        purchaseUnit: data.purchaseUnit || null,
        conversionRatio: data.conversionRatio || 1,
        categoryId: data.categoryId,
        userId: session.user.id,
        hasSerialNumbers: data.hasSerialNumbers,
        warrantyMonths: data.warrantyMonths,
        variants: data.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          minStockLevel: v.minStockLevel,
          purchasePrice: v.purchasePrice,
          sellingPrice: v.sellingPrice,
          pricingMethod: v.pricingMethod,
          markupPercent: v.markupPercent,
        })),
      });

      if (res.success) {
        toast.success(t("toasts.updated"));
        router.push("/dashboard/master-data/products");
      } else {
        toast.error(t("toasts.updateFailed") + ": " + res.error?.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              {t("editProduct")}
            </h2>
            <p className="text-sm text-text-muted">
              {t("editSubtitle", { name: product.name })}
            </p>
          </div>
        </div>
        <Link href="/dashboard/master-data/products">
          <Button variant="secondary" className="hover:bg-surface-hover">
            {t("form.goBack")}
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-surface border-border/50 shadow-none">
            <CardHeader className="border-b border-border/50 pb-4 bg-surface-elevated/20">
              <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                {t("form.productInfoSection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("form.productNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("form.productNamePlaceholder")} {...field} />
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
                      <FormLabel>{t("form.brandLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.brandPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.categoryLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.categoryPlaceholder")}>
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
                      <FormLabel>{t("form.hsnLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.hsnPlaceholder")}
                          {...field}
                          value={field.value || ""}
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
                      <FormLabel>{t("form.gstRateLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={
                          field.value !== undefined ? String(field.value) : ""
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.gstRatePlaceholder")}>
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
                      <FormLabel>{t("form.baseUnitLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.baseUnitPlaceholder")}>
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
                      <FormLabel>{t("form.purchaseUnitLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.purchaseUnitPlaceholder")}>
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
                  <div className="md:col-span-2 flex items-center p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-indigo-400 mr-3" />
                    <p className="text-xs font-medium text-indigo-300 italic">
                      {t("form.landedCostNote", {
                        purchase: getUnitLabel(watch("purchaseUnit")),
                        base: getUnitLabel(watch("baseUnit")),
                      })}
                    </p>
                  </div>
                )}

                {watch("purchaseUnit") && (
                  <FormField
                    control={control}
                    name="conversionRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand font-bold">
                          {t("form.conversionRatioLabel", { unit: getUnitLabel(watch("purchaseUnit")) })}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="border-brand/30 focus-visible:ring-brand/20"
                          />
                        </FormControl>
                        <p className="text-[10px] text-text-muted italic">
                          {t("form.conversionHelp", {
                            base: getUnitLabel(watch("baseUnit")),
                            purchase: getUnitLabel(watch("purchaseUnit")),
                          })}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="md:col-span-2 border-t border-border/50 my-2 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="hasSerialNumbers"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-3 shadow-sm bg-surface-elevated/20">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold">{t("form.hasSerialNumbersLabel")}</FormLabel>
                          <p className="text-[10px] text-text-muted">
                            {t("form.hasSerialNumbersHelp")}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="warrantyMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">{t("form.warrantyMonthsLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder={t("form.warrantyMonthsPlaceholder")}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border/50 shadow-none">
            <CardHeader className="border-b border-border/50 pb-4 bg-surface-elevated/20">
              <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                {t("form.variantSection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-5 border border-border/50 rounded-xl bg-surface-elevated/10 grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <FormField
                      control={control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel className="text-xs font-bold uppercase text-text-muted">
                            {t("form.skuCodeLabel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="bg-surface-muted/50 border-none font-bold"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`variants.${index}.minStockLevel`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-brand">
                            {t("form.minStockAlert")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="border-brand/30 focus-visible:ring-brand/20 font-black text-brand"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`variants.${index}.purchasePrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-text-muted">
                            {t("form.costPriceLabel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                field.onChange(val);
                                const method = watch(
                                  `variants.${index}.pricingMethod`,
                                );
                                if (method === "MARKUP") {
                                  const margin =
                                    watch(`variants.${index}.markupPercent`) ||
                                    0;
                                  const sell =
                                    Math.round(val * (1 + margin / 100) * 100) /
                                    100;
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
                          <FormLabel className="text-xs font-bold uppercase text-text-muted">
                            {t("form.pricingLogicLabel")}
                          </FormLabel>
                          <Select
                            onValueChange={(
                              val: "MANUAL" | "MARKUP" | null,
                            ) => {
                              if (!val) return;
                              field.onChange(val);
                              if (val === "MARKUP") {
                                const cost =
                                  watch(`variants.${index}.purchasePrice`) || 0;
                                const margin =
                                  watch(`variants.${index}.markupPercent`) || 0;
                                const sell =
                                  Math.round(cost * (1 + margin / 100) * 100) /
                                  100;
                                form.setValue(
                                  `variants.${index}.sellingPrice`,
                                  sell,
                                  { shouldTouch: true },
                                );
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue>
                                  {field.value === "MARKUP"
                                    ? t("form.markup")
                                    : t("form.manualEntry")}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MANUAL">
                                {t("form.manualEntry")}
                              </SelectItem>
                              <SelectItem value="MARKUP">{t("form.markup")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watch(`variants.${index}.pricingMethod`) === "MARKUP" ? (
                      <FormField
                        control={control}
                        name={`variants.${index}.markupPercent`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-brand">
                              {t("form.marginLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                className="border-brand/30 bg-brand/5 focus-visible:ring-brand/40 font-black text-brand"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const margin =
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value);
                                  field.onChange(margin);
                                  const cost =
                                    watch(`variants.${index}.purchasePrice`) ||
                                    0;
                                  const sell =
                                    Math.round(
                                      cost * (1 + (margin || 0) / 100) * 100,
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
                            <FormLabel className="text-xs font-bold uppercase text-text-muted">
                              {t("form.sellingPriceLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watch(`variants.${index}.pricingMethod`) === "MARKUP" && (
                      <div className="flex flex-col justify-center bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">
                          {t("form.autoSellingPrice")}
                        </label>
                        <p className="text-sm font-black text-emerald-600">
                          ₹{" "}
                          {(
                            watch(`variants.${index}.sellingPrice`) || 0
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/master-data/products">
              <Button type="button" variant="outline">
                {t("form.goBack")}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("form.updating")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("form.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
