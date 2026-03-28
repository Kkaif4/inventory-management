"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, getNextSkuNumber } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import {
  PackageX,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useOutletStore } from "@/store/use-outlet-store";
import { PRODUCT_UNITS } from "@/lib/constants";
import { AlertTriangle, Info } from "lucide-react";
import { getGstRateByHsn } from "@/lib/hsn-data";
import { getTaxInfoByCategory } from "@/lib/category-tax-map";
import {
  productCreateSchema,
  ProductFormValues,
} from "@/validations/product.validation";
import { useTranslations } from "next-intl";

function buildSkuPrefix(categoryName: string, productName: string): string {
  const cat = categoryName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 2)
    .padEnd(2, "X");
  const name = productName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 3)
    .padEnd(3, "X");
  return `${cat}-${name}`;
}

export default function NewProductPage() {
  const t = useTranslations("products");
  const common = useTranslations("common");
  const router = useRouter();
  const { currentOutletId } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedSku, setShowAdvancedSku] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  const { data: session } = useSession();

  useEffect(() => {
    getCategories().then((res) => {
      if (res.success) {
        setCategories(res.data!);
      } else {
        toast.error(
          t("toasts.loadCategoriesFailed") + ": " + res.error?.message,
        );
      }
    });
  }, []);

  const getCategoryName = (id?: string | null) =>
    id ? categories.find((c) => c.id === id)?.name : undefined;
  const getUnitLabel = (val?: string | null): string =>
    val ? PRODUCT_UNITS.find((u) => u.value === val)?.label || val : "";
  const getGstLabel = (val: any) => {
    const s = String(val);
    if (s === "0") return "0% (Exempt)";
    return s ? `${s}%` : undefined;
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productCreateSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      brand: "",
      hsnCode: "",
      gstRate: 18,
      baseUnit: "PCS",
      purchaseUnit: "",
      conversionRatio: 1,
      categoryId: "",
      parentCategoryId: "",
      variants: [
        {
          sku: "",
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

  // useWatch for reactive SKU generation (avoids stale closure in useEffect)
  const watchedCategoryId = useWatch({ control, name: "categoryId" });
  const watchedName = useWatch({ control, name: "name" });

  // Feature 1: Auto-generate SKU when category + name change
  useEffect(() => {
    if (
      !watchedCategoryId ||
      !watchedName ||
      watchedName.length < 2 ||
      !currentOutletId
    )
      return;
    const categoryName = getCategoryName(watchedCategoryId) ?? "";
    if (!categoryName) return;
    const prefix = buildSkuPrefix(categoryName, watchedName);
    const timer = setTimeout(async () => {
      setIsGeneratingSku(true);
      const res = await getNextSkuNumber(prefix, currentOutletId);
      if (res.success && res.data) {
        form.setValue("variants.0.sku", `${prefix}-${res.data}`, {
          shouldValidate: false,
        });
      }
      setIsGeneratingSku(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [watchedCategoryId, watchedName]);

  // Feature 5: Toggle variants — remove extra variants when switching back to simple mode
  const handleVariantsToggle = (checked: boolean) => {
    setShowVariants(checked);
    if (!checked && fields.length > 1) {
      const indicesToRemove = Array.from(
        { length: fields.length - 1 },
        (_, i) => i + 1,
      );
      remove(indicesToRemove);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (!session?.user?.id || !currentOutletId) {
        toast.error("Missing session or outlet selection");
        throw new Error("Unauthorized or no active outlet selected.");
      }
      setIsSubmitting(true);
      const { parentCategoryId: _ignored, ...productPayload } = data;
      const res = await createProduct({
        ...productPayload,
        brand: data.brand || null,
        hsnCode: data.hsnCode || null,
        purchaseUnit: data.purchaseUnit || null,
        outletId: currentOutletId,
        userId: session.user.id,
      });

      if (res.success) {
        toast.success(t("toasts.created"));
        router.push("/dashboard/master-data/products");
      } else {
        console.error("Create product error:", res.error);
        toast.error(t("toasts.createFailed") + ": " + res.error?.message);
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error(t("toasts.createError"));
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
              {t("addProduct")}
            </h2>
            <p className="text-sm text-text-muted">{t("subtitle")}</p>
          </div>
        </div>
        <Link href="/dashboard/master-data/products">
          <Button variant="secondary" className="hover:bg-surface-hover">
            {common("cancel")}
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Basic Information ── */}
          <Card className="bg-surface border-border/50 shadow-none">
            <CardHeader className="border-b border-border/50 pb-4 bg-surface-elevated/20">
              <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                {t("form.basicInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("form.productNameLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.productNamePlaceholder")}
                          {...field}
                        />
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
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Feature 2: Category ghost-fills HSN + GST */}
                <FormField
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.categoryLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          // Feature 2: Smart Tax & HSN Mapping
                          const catName =
                            categories.find((c) => c.id === val)?.name ?? "";
                          const taxInfo = getTaxInfoByCategory(catName);
                          form.setValue("hsnCode", taxInfo.hsnCode);
                          form.setValue("gstRate", taxInfo.gstRate);
                          if (taxInfo.hsnCode) {
                            toast.info(
                              `Tax auto-set: HSN ${taxInfo.hsnCode} @ ${taxInfo.gstRate}%`,
                            );
                          }
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("form.categoryPlaceholder")}
                            >
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

                {/* Feature 3: Label → "Tax Code (HSN)" */}
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
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e);
                            if (
                              !e.target.value ||
                              e.target.value.trim() === ""
                            ) {
                              form.setValue("gstRate", 0);
                            }
                          }}
                          onBlur={(e) => {
                            if (
                              !e.target.value ||
                              e.target.value.trim() === ""
                            ) {
                              form.setValue("gstRate", 0);
                              return;
                            }
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
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("form.gstRatePlaceholder")}
                            >
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

                {/* Feature 3: Label → "How do you sell it?" */}
                <FormField
                  control={control}
                  name="baseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.baseUnitLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("form.baseUnitPlaceholder")}
                            >
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

                {/* Feature 3: Label → "How do you buy it?" */}
                <FormField
                  control={control}
                  name="purchaseUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.purchaseUnitLabel")}</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("form.purchaseUnitPlaceholder")}
                            >
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

                {watch("purchaseUnit") && (
                  <FormField
                    control={control}
                    name="conversionRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("form.conversionRatioLabel", {
                            unit: getUnitLabel(watch("purchaseUnit") || "BASE"),
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder={t("form.conversionRatioPlaceholder")}
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

                {watch("purchaseUnit") && watch("baseUnit") && (
                  <div className="md:col-span-1 lg:col-span-1 flex items-center p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-indigo-400 mr-3" />
                    <p className="text-xs font-medium text-indigo-300">
                      {t("form.conversionNote", {
                        purchase: watch("purchaseUnit") ?? "",
                        ratio: watch("conversionRatio") || 1,
                        base: watch("baseUnit") ?? "",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Feature 5: Progressive Disclosure Toggle ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-border/50 rounded-xl">
            <Switch
              checked={showVariants}
              onCheckedChange={handleVariantsToggle}
              id="variants-toggle"
            />
            <label
              htmlFor="variants-toggle"
              className="text-sm text-text-primary cursor-pointer select-none"
            >
              {t("form.variantsToggle")}
            </label>
          </div>

          {/* ── Pricing Section (simple mode, showVariants=false) ── */}
          {!showVariants && (
            <Card className="bg-surface border-border/50 shadow-none">
              <CardHeader className="border-b border-border/50 pb-4 bg-surface-elevated/20">
                <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Feature 4: Cost Price auto-syncs Selling Price */}
                  <FormField
                    control={control}
                    name="variants.0.purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          {t("form.costPriceLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              const newVal = Number(e.target.value);
                              const oldVal = field.value;
                              field.onChange(e);
                              // Feature 4: Auto-sync selling price
                              const currentSelling = watch(
                                "variants.0.sellingPrice",
                              );
                              if (
                                currentSelling === 0 ||
                                currentSelling === oldVal
                              ) {
                                form.setValue(
                                  "variants.0.sellingPrice",
                                  newVal,
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
                    name="variants.0.sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          {t("form.sellingPriceLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Feature 3: Label → "Notify when stock is lower than..." */}
                  <FormField
                    control={control}
                    name="variants.0.minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          {t("form.minAlertLabel")}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Feature 1: Advanced SKU toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSku((prev) => !prev)}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {showAdvancedSku ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    Advanced (SKU / Barcode)
                  </button>

                  {showAdvancedSku && (
                    <div className="mt-3 max-w-xs">
                      <FormField
                        control={control}
                        name="variants.0.sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              {t("form.skuLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  isGeneratingSku
                                    ? "Generating..."
                                    : t("form.skuPlaceholder")
                                }
                                disabled={isGeneratingSku}
                                {...field}
                              />
                            </FormControl>
                            <p className="text-[10px] text-text-muted italic">
                              Auto-generated from category &amp; product name.
                              You can edit it.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Feature 5: Full Variants table (showVariants=true) ── */}
          {showVariants && (
            <Card className="bg-surface border-border/50 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4 bg-surface-elevated/20">
                <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                  {t("form.productVariants")}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10"
                  onClick={() =>
                    append({
                      sku: "",
                      purchasePrice: 0,
                      sellingPrice: 0,
                      pricingMethod: "MANUAL",
                      markupPercent: 0,
                      minStockLevel: 0,
                      specifications: {},
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> {t("form.addVariant")}
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

                        {/* Feature 1: SKU always visible in full variant mode */}
                        <FormField
                          control={control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-xs">
                                {t("form.skuLabel")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    index === 0 && isGeneratingSku
                                      ? "Generating..."
                                      : t("form.skuPlaceholder")
                                  }
                                  disabled={index === 0 && isGeneratingSku}
                                  {...field}
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
                              <FormLabel className="text-xs">
                                {t("form.costPriceLabel")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => {
                                    const newVal = Number(e.target.value);
                                    const oldVal = field.value;
                                    field.onChange(e);
                                    if (method === "MARKUP") {
                                      const margin =
                                        watch(
                                          `variants.${index}.markupPercent`,
                                        ) || 0;
                                      const sell =
                                        Math.round(
                                          newVal * (1 + margin / 100) * 100,
                                        ) / 100;
                                      form.setValue(
                                        `variants.${index}.sellingPrice`,
                                        sell,
                                      );
                                    } else if (method === "MANUAL") {
                                      // Feature 4: Auto-sync selling price
                                      const currentSelling = watch(
                                        `variants.${index}.sellingPrice`,
                                      );
                                      if (
                                        currentSelling === 0 ||
                                        currentSelling === oldVal
                                      ) {
                                        form.setValue(
                                          `variants.${index}.sellingPrice`,
                                          newVal,
                                        );
                                      }
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
                                      watch(
                                        `variants.${index}.purchasePrice`,
                                      ) || 0;
                                    const margin =
                                      watch(
                                        `variants.${index}.markupPercent`,
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
                                  }
                                }}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue>
                                      {field.value === "MARKUP"
                                        ? t("form.markup")
                                        : field.value === "MANUAL"
                                          ? t("form.manualEntry")
                                          : undefined}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MANUAL">
                                    {t("form.manualEntry")}
                                  </SelectItem>
                                  <SelectItem value="MARKUP">
                                    {t("form.markup")}
                                  </SelectItem>
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
                                <FormLabel className="text-xs text-brand">
                                  {t("form.marginLabel")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    className="border-brand/30 bg-brand/5 focus-visible:ring-brand/40"
                                    value={field.value ?? ""}
                                    onBlur={field.onBlur}
                                    onChange={(e) => {
                                      field.onChange(
                                        Number(e.target.value) || null,
                                      );
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
                                  {t("form.sellingPriceLabel")}
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
                              {t("form.autoSellingPrice")}
                            </label>
                            <p className="text-sm font-black text-emerald-400">
                              ₹{" "}
                              {(
                                watch(`variants.${index}.sellingPrice`) || 0
                              ).toFixed(2)}
                            </p>
                          </div>
                        )}

                        {/* Feature 3: Label → "Notify when stock is lower than..." */}
                        <FormField
                          control={control}
                          name={`variants.${index}.minStockLevel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                {t("form.minAlertLabel")}
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
          )}

          {/* Feature 5: Submit button → "Add to Inventory" */}
          <div className="flex justify-end sticky bottom-6 z-10 bg-surface/80 backdrop-blur-xl p-4 shadow-2xl shadow-indigo-900/10 rounded-xl border border-border/60">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 px-8"
              size="lg"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? t("form.savingButton") : t("form.saveButton")}
            </Button>
          </div>
        </form>
      </Form>

      {!currentOutletId && (
        <div className="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {t("form.outletRequiredTitle")}
              </h3>
              <p className="text-slate-500">
                {t("form.outletRequiredDescription")}
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/master-data/products")}
              variant="outline"
              className="w-full py-6 rounded-2xl font-bold"
            >
              {t("form.goBack")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
