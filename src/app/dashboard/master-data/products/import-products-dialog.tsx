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
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type Step = "UPLOAD" | "PROGRESS" | "RESULT";

// Fixed header keys (must match CSV/Excel column names exactly)
const FIELD_KEYS = [
  "productName",
  "brand",
  "hsnCode",
  "gstRate",
  "baseUnit",
  "purchaseUnit",
  "salesUnit",
  "conversionRatio",
  "categoryL1",
  "categoryL2",
  "categoryL3",
  "variantSku",
  "variantSpec",
  "purchasePrice",
  "sellingPrice",
  "pricingMethod",
  "markupPercent",
  "minStockLevel",
  "warehouseName",
  "currentStock",
  "batchDate",
  "batchCostPerUnit",
];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([FIELD_KEYS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "product_import_template.csv");
  };

  const executeImport = async () => {
    if (!file) return;
    setStep("PROGRESS");
    setIsRunning(true);

    try {
      // Parse file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Map by key directly (CSV headers must match FIELD_KEYS)
      const rows = rawRows.map((row) => {
        const mapped: Record<string, any> = {};
        FIELD_KEYS.forEach((key) => {
          mapped[key] = row[key] ?? null;
        });
        return mapped;
      });

      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outletId, rows }),
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
    setIsRunning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Import Products
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with the standard product template
            headers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
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
                Download template with required headers
              </button>
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
                    progress ? (progress.processed / progress.total) * 100 : 0
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
                    {progress?.variantsCreated || 0} Added
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
                <div className="w-full p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {progress.errors.length} rows skipped
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                    onClick={downloadErrorReport}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "UPLOAD" && (
            <Button
              disabled={!file}
              onClick={executeImport}
              className="rounded-xl px-8"
            >
              Import
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
          {step === "RESULT" && (
            <Button
              className="rounded-xl px-10"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
