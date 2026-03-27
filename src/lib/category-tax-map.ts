export type TaxInfo = { hsnCode: string; gstRate: number };

export const CATEGORY_TAX_MAP: Record<string, TaxInfo> = {
  "hand tools":       { hsnCode: "8205", gstRate: 18 },
  "power tools":      { hsnCode: "8467", gstRate: 18 },
  "drill bits":       { hsnCode: "8207", gstRate: 18 },
  "fasteners":        { hsnCode: "7318", gstRate: 18 },
  "pipes":            { hsnCode: "3917", gstRate: 18 },
  "valves":           { hsnCode: "8481", gstRate: 18 },
  "structural steel": { hsnCode: "7308", gstRate: 18 },
  "steel bars":       { hsnCode: "7214", gstRate: 18 },
  "cement":           { hsnCode: "2523", gstRate: 28 },
  "adhesives":        { hsnCode: "3506", gstRate: 18 },
  "sealants":         { hsnCode: "3214", gstRate: 18 },
  "electrical":       { hsnCode: "",     gstRate: 18 },
  "plumbing":         { hsnCode: "",     gstRate: 18 },
  "safety":           { hsnCode: "",     gstRate: 18 },
};

export function getTaxInfoByCategory(categoryName: string): TaxInfo {
  const key = categoryName.toLowerCase().trim();
  return CATEGORY_TAX_MAP[key] ?? { hsnCode: "", gstRate: 18 };
}
