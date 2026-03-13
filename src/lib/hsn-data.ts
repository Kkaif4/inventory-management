export const HSN_GST_MAP: Record<string, number> = {
  "7318": 18,
  "8205": 18,
  "8207": 18,
  "8467": 18,
  "8508": 18,
  "3214": 18,
  "3506": 18,
  "2523": 28,
  "7214": 18,
  "7308": 18,
  "8481": 18,
  "3917": 18,
  "1234": 5,
};

export function getGstRateByHsn(hsnCode: string): number | null {
  const prefix = hsnCode.substring(0, 4);
  return HSN_GST_MAP[prefix] ?? HSN_GST_MAP[hsnCode] ?? null;
}
