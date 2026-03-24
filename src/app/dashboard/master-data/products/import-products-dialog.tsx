"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type Step = "UPLOAD" | "PREVIEW" | "PROGRESS" | "RESULT";

// Fixed header keys using normal casing (user-visible, what they see in CSV/Excel)
// The backend normalizeRow() function converts these to camelCase
const FIELD_KEYS = [
  "Product Group Name",
  "Brand",
  "HSN Code",
  "GST Rate",
  "Base Unit",
  "Purchase Unit",
  "Conversion Ratio",
  "Category L1",
  "Category L2",
  "Category L3",
  "Variant SKU",
  "Variant Spec",
  "Purchase Price",
  "Selling Price",
  "Pricing Method",
  "Markup Percent",
  "Min Stock Level",
  "Warehouse Name",
  "Current Stock",
  "Batch Date",
  "Batch Cost Per Unit",
];

// Mapping from normal casing to camelCase for internal use
const HEADER_TO_CAMEL_CASE: Record<string, string> = {
  "Product Group Name": "productGroupName",
  Brand: "brand",
  "HSN Code": "hsnCode",
  "GST Rate": "gstRate",
  "Base Unit": "baseUnit",
  "Purchase Unit": "purchaseUnit",
  "Conversion Ratio": "conversionRatio",
  "Category L1": "categoryL1",
  "Category L2": "categoryL2",
  "Category L3": "categoryL3",
  "Variant SKU": "variantSku",
  "Variant Spec": "variantSpec",
  "Purchase Price": "purchasePrice",
  "Selling Price": "sellingPrice",
  "Pricing Method": "pricingMethod",
  "Markup Percent": "markupPercent",
  "Min Stock Level": "minStockLevel",
  "Warehouse Name": "warehouseName",
  "Current Stock": "currentStock",
  "Batch Date": "batchDate",
  "Batch Cost Per Unit": "batchCostPerUnit",
};

export function ImportProductsDialog({
  open,
  onOpenChange,
  outletId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
}) {
  const [step, setStep] = useState<Step>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [hasLegacyColumn, setHasLegacyColumn] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // Tab 1: Products (with dummy data demonstrating variants)
    // Columns: Product Group Name, Brand, HSN Code, GST Rate, Base Unit, Purchase Unit, Conversion Ratio,
    // Category L1, Category L2, Category L3, Variant SKU, Variant Spec, Purchase Price, Selling Price,
    // Pricing Method, Markup Percent, Min Stock Level, Warehouse Name, Current Stock, Batch Date, Batch Cost Per Unit
    const exampleRows = [
      [
        "Adjustable Wrench",
        "Taparia",
        "82041200",
        12,
        "Piece",
        "Box",
        20,
        "Tools",
        "Hand Tools",
        "Wrenches",
        "TAP-WRN-10",
        "10 Inch Adjustable",
        280,
        340,
        "MANUAL",
        "",
        20,
        "Main Distribution Center",
        85,
        "06/02/2026",
        280,
      ],
      [
        "Adjustable Wrench",
        "Taparia",
        "82041200",
        12,
        "Piece",
        "Box",
        20,
        "Tools",
        "Hand Tools",
        "Wrenches",
        "TAP-WRN-12",
        "12 Inch Adjustable",
        340,
        410,
        "MANUAL",
        "",
        20,
        "Main Distribution Center",
        75,
        "06/02/2026",
        340,
      ],
      [
        "Measuring Tape",
        "Freemans",
        "90178010",
        18,
        "Piece",
        "Box",
        20,
        "Tools",
        "Measuring Tools",
        "Tapes",
        "FRM-MT-5",
        "5 Meter Tape",
        110,
        "",
        "MARKUP",
        25,
        40,
        "Main Distribution Center",
        200,
        "03/02/2026",
        110,
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([FIELD_KEYS, ...exampleRows]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Tab 2: Instructions
    const instructions = [
      ["Column", "Required", "Description"],
      [
        "Product Group Name",
        "Yes",
        "The overall name of the product. Repeat this on every row for the same product to group variants together.",
      ],
      [
        "Variant SKU",
        "Yes",
        "Globally unique identifier for this specific variant.",
      ],
      [
        "Variant Spec",
        "No",
        "What makes this variant different (e.g. '10 Inch', '500W', 'Blue').",
      ],
      [
        "Brand, HSN Code, GST Rate, Base Unit, Categories...",
        "Yes/No",
        "Product-level fields. These MUST be identical for all rows sharing the same Product Group Name.",
      ],
      [
        "Pricing Method",
        "Yes",
        "MANUAL or MARKUP. Defines how selling price is calculated.",
      ],
      ["Purchase Price", "Yes", "Per variant purchase cost."],
      [
        "Selling Price",
        "Depends",
        "Required if Pricing Method is MANUAL. Leave blank if MARKUP.",
      ],
      [
        "Markup Percent",
        "Depends",
        "Required if Pricing Method is MARKUP. Leave blank if MANUAL.",
      ],
      [
        "Current Stock, Warehouse Name",
        "No",
        "Provides opening stock. Warehouse Name required if Current Stock > 0.",
      ],
      [
        "Batch Date",
        "Depends",
        "Only needed if batch tracking is ENABLED for this outlet and Current Stock > 0. Format: DD/MM/YYYY",
      ],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

    XLSX.writeFile(workbook, "product_import_template_v2.xlsx");
  };

  const convertExcelDateToString = (excelDate: any): string => {
    if (!excelDate) return "";
    if (typeof excelDate === "string") return excelDate; // Already a string

    // If it's a number, convert from Excel serial date
    if (typeof excelDate === "number") {
      // Excel serial date: Day 1 = Jan 1, 1900
      // Account for Excel's leap year bug (1900 is not a leap year but Excel thinks it is)
      // Dates after Feb 28, 1900 need to be adjusted by -1
      let adjustedDate = excelDate;
      if (excelDate > 60) {
        adjustedDate = excelDate - 1; // Adjust for the leap year bug
      }

      const excelEpoch = new Date(1900, 0, 0); // Dec 31, 1899 (day 0)
      const jsDate = new Date(
        excelEpoch.getTime() + adjustedDate * 24 * 60 * 60 * 1000,
      );

      const day = String(jsDate.getDate()).padStart(2, "0");
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const year = jsDate.getFullYear();

      return `${day}/${month}/${year}`;
    }

    return "";
  };

  const processFileForPreview = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      if (rawRows.length === 0) {
        toast.error("The selected file is empty.");
        return;
      }

      // Check for legacy column (old productName header)
      const firstRowKeys = Object.keys(rawRows[0]).map((k) =>
        k.trim().toLowerCase(),
      );
      const hasLegacy = firstRowKeys.includes("productname");
      setHasLegacyColumn(hasLegacy);

      // Map rows - convert normal casing headers to camelCase for internal use
      const rows = rawRows.map((row) => {
        const mapped: Record<string, any> = {};

        FIELD_KEYS.forEach((key) => {
          // Get the camelCase version of the key
          const camelKey = HEADER_TO_CAMEL_CASE[key];

          // Try to find the value in the row
          let value: any = null;

          // First, try exact key match (normal casing)
          if (row[key] !== undefined && row[key] !== "") {
            value = row[key];
          }
          // If looking for Product Group Name, also try legacy productName
          else if (
            key === "Product Group Name" &&
            (hasLegacy || row["Product Name"] !== undefined)
          ) {
            value = row["Product Name"] || row["productName"] || "";
          }
          // For other keys, the Excel headers should match exactly

          // Special handling for Batch Date - convert Excel serial numbers to DD/MM/YYYY
          if (key === "Batch Date" && value !== null && value !== "") {
            value = convertExcelDateToString(value);
          }

          // Store with camelCase key for consistent access in preview and backend
          mapped[camelKey] = value !== "" ? value : null;
        });
        return mapped;
      });

      setParsedData(rows);
      setStep("PREVIEW");
      setExpandedGroups(new Set()); // Start collapsed
    } catch (err: any) {
      toast.error("Failed to parse file: " + err.message);
    }
  };

  const toggleGroup = (groupName: string) => {
    const next = new Set(expandedGroups);
    if (next.has(groupName)) next.delete(groupName);
    else next.add(groupName);
    setExpandedGroups(next);
  };

  // Convert camelCase back to normal casing for API submission
  const convertToNormalCasing = (
    rows: Record<string, any>[],
  ): Record<string, any>[] => {
    const camelToNormal: Record<string, string> = Object.fromEntries(
      Object.entries(HEADER_TO_CAMEL_CASE).map(([normal, camel]) => [
        camel,
        normal,
      ]),
    );

    return rows.map((row) => {
      const normalized: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        const normalKey = camelToNormal[key] || key;
        normalized[normalKey] = value;
      });
      return normalized;
    });
  };

  const executeImport = async () => {
    if (!parsedData.length) return;
    setStep("PROGRESS");
    setIsRunning(true);

    try {
      // Convert back to normal casing for backend processing
      const rowsForApi = convertToNormalCasing(parsedData);

      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId, rows: rowsForApi }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            if (data.done) {
              setIsRunning(false);
              setStep("RESULT");
            } else if (data.error) {
              toast.error(data.error);
              setIsRunning(false);
              setStep("UPLOAD");
              return;
            } else {
              setProgress(data);
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Import failed");
      setIsRunning(false);
      setStep("UPLOAD");
    }
  };

  const downloadErrorReport = () => {
    if (!progress?.errors?.length) return;
    const errorRows = progress.errors.map((e: any) => ({
      Row: e.row,
      SKU: e.sku,
      Field: e.field,
      Message: e.message,
    }));
    const worksheet = XLSX.utils.json_to_sheet(errorRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Errors");
    XLSX.writeFile(workbook, "import_errors.xlsx");
  };

  const reset = () => {
    setStep("UPLOAD");
    setFile(null);
    setProgress(null);
    setParsedData([]);
    setHasLegacyColumn(false);
    setIsRunning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Group data for preview
  const groupedPreview = parsedData.reduce(
    (acc, row) => {
      const key = (row.productGroupName || "Unnamed Product").trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const totalGroups = Object.keys(groupedPreview).length;
  const totalStockEntries = parsedData.filter(
    (r) => (r.currentStock || 0) > 0,
  ).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isRunning) {
          reset();
          onOpenChange(val);
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Import Products
          </DialogTitle>
          <DialogDescription>
            {step === "UPLOAD" &&
              "Upload a CSV or Excel file using the standard template."}
            {step === "PREVIEW" &&
              "Review your matched products and variants before importing."}
            {step === "PROGRESS" && "Importing data into the system."}
            {step === "RESULT" && "Import complete."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 overflow-y-auto flex-1 px-1">
          {/* UPLOAD */}
          {step === "UPLOAD" && (
            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 hover:bg-surface-elevated transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-text-muted mb-3" />
                {file ? (
                  <p className="text-sm font-semibold text-green-600">
                    {file.name}
                  </p>
                ) : (
                  <p className="text-sm font-medium">
                    Click to select CSV / Excel file
                  </p>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </div>

              <button
                onClick={downloadTemplate}
                className="text-xs text-text-muted underline underline-offset-2 w-full text-center hover:text-text-primary"
              >
                <Download className="w-3 h-3 inline mr-1" />
                Download template with multi-variant format
              </button>
            </div>
          )}

          {/* PREVIEW */}
          {step === "PREVIEW" && (
            <div className="space-y-4">
              {hasLegacyColumn && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
                  <FileWarning className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-900">
                    <strong>Legacy Column Detected:</strong> Your sheet uses the
                    old <code>productName</code> column. We automatically mapped
                    it to <code>productGroupName</code> for this import. Please{" "}
                    <button
                      onClick={downloadTemplate}
                      className="underline font-semibold cursor-pointer"
                    >
                      download our new template
                    </button>{" "}
                    for future imports.
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Import Summary
                </h4>
                <div className="text-xs font-semibold text-slate-600 flex gap-4">
                  <span>📦 {totalGroups} product groups</span>
                  <span>🔄 {parsedData.length} total variants</span>
                  <span>📦 {totalStockEntries} stock entries</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden flex flex-col max-h-[40vh]">
                <div className="bg-slate-100 px-4 py-2 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product Group Breakdown
                </div>
                <div className="overflow-y-auto divide-y">
                  {Object.entries(groupedPreview).map(
                    ([groupName, groupData]) => {
                      const rows = groupData as any[];
                      const isExpanded = expandedGroups.has(groupName);
                      return (
                        <div key={groupName} className="text-sm">
                          <button
                            onClick={() => toggleGroup(groupName)}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 text-left transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="font-semibold text-slate-900">
                                {groupName}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full font-medium text-slate-600">
                                {rows.length} variant{rows.length !== 1 && "s"}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">
                              {rows[0].brand} · {rows[0].categoryL1}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="bg-slate-50 border-t p-3 pl-9 overflow-x-auto">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="text-slate-500 pb-2">
                                    <th className="font-medium pb-2 pr-4">
                                      SKU
                                    </th>
                                    <th className="font-medium pb-2 pr-4">
                                      Spec
                                    </th>
                                    <th className="font-medium pb-2 pr-4 text-right">
                                      Price
                                    </th>
                                    <th className="font-medium pb-2 text-right">
                                      Stock
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {rows.map((r, i) => (
                                    <tr key={i}>
                                      <td className="py-2 pr-4 font-medium text-slate-700">
                                        {r.variantSku || "Missing SKU"}
                                      </td>
                                      <td className="py-2 pr-4 text-slate-600 truncate max-w-[150px]">
                                        {r.variantSpec || "-"}
                                      </td>
                                      <td className="py-2 pr-4 text-right">
                                        ₹{r.purchasePrice || 0}
                                      </td>
                                      <td className="py-2 text-right flex items-center justify-end gap-1">
                                        {(r.currentStock || 0) > 0 ? (
                                          <>
                                            <span className="font-semibold text-emerald-600">
                                              {r.currentStock}
                                            </span>
                                            <span className="text-slate-400 text-[10px]">
                                              @{r.warehouseName || "?"}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-slate-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PROGRESS */}
          {step === "PROGRESS" && (
            <div className="py-8 flex flex-col items-center gap-6">
              <div className="text-center space-y-1">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <h3 className="text-lg font-bold mt-3">
                  Importing products...
                </h3>
                <p className="text-sm text-text-muted">
                  Please keep this window open.
                </p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Progress</span>
                  <span>
                    {progress
                      ? `${progress.processed} / ${progress.total} products`
                      : "Initializing..."}
                  </span>
                </div>
                <Progress
                  value={
                    progress
                      ? (progress.processed / Math.max(progress.total, 1)) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{progress?.created || 0} Products Added</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>{progress?.variantsCreated || 0} Variants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  <span>{progress?.stockEntries || 0} Stock Entries</span>
                </div>
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>{progress?.errors?.length || 0} Skipped</span>
                </div>
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === "RESULT" && (
            <div className="py-6 flex flex-col items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Done!
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Import completed successfully
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full bg-surface-elevated p-4 rounded-xl border text-sm">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase">
                    Products
                  </p>
                  <p className="font-black">
                    {progress?.created || 0} Added / {progress?.updated || 0}{" "}
                    Updated
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-muted uppercase">
                    Variants
                  </p>
                  <p className="font-black">
                    {progress?.variantsCreated || 0} Added /{" "}
                    {progress?.variantsUpdated || 0} Updated
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase">
                    Stock Entries
                  </p>
                  <p className="font-black">{progress?.stockEntries || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-muted uppercase">
                    Batches
                  </p>
                  <p className="font-black">{progress?.batches || 0}</p>
                </div>
              </div>

              {progress?.errors?.length > 0 && (
                <div className="w-full p-3 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-2 relative group overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {progress.errors.length} errors during import
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-red-200 text-red-700 hover:bg-red-50 py-0 h-7"
                      onClick={downloadErrorReport}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="text-[10px] text-red-800/80 bg-red-100/50 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {progress.errors
                      .map(
                        (e: any, i: number) =>
                          `Row ${e.row} [${e.sku}]: ${e.message}`,
                      )
                      .join("\n")}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          {step === "UPLOAD" && (
            <div className="flex gap-2 w-full justify-end">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                disabled={!file}
                onClick={processFileForPreview}
                className="rounded-xl px-8"
              >
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
          {step === "PREVIEW" && (
            <div className="flex gap-2 w-full justify-between items-center px-1">
              <Button
                variant="ghost"
                onClick={() => setStep("UPLOAD")}
                className="text-slate-500 hover:text-slate-700"
              >
                Back Config
              </Button>
              <Button
                onClick={executeImport}
                className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700"
              >
                Start Import
                <Upload className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
          {step === "RESULT" && (
            <div className="w-full flex justify-end">
              <Button
                className="rounded-xl px-10"
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
