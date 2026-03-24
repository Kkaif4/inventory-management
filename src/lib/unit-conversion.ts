export function convertToBaseUnit(
  quantity: number,
  conversionRatio: number | null | undefined,
): number {
  const ratio = conversionRatio ?? 1;
  return quantity * ratio;
}

export function convertFromBaseUnit(
  quantity: number,
  conversionRatio: number | null | undefined,
): number {
  const ratio = conversionRatio ?? 1;
  if (ratio === 0) return 0;
  return quantity / ratio;
}

export type UnitType = "BASE" | "PURCHASE" | "SALES";

export function getBaseQuantity(
  quantity: number,
  unit: UnitType,
  conversionRatio: number | null | undefined,
): number {
  if (unit === "BASE") return quantity;
  return convertToBaseUnit(quantity, conversionRatio);
}

export function normalizeToStockQty({
  quantity,
  isPurchase,
  conversionRatio,
}: {
  quantity: number;
  isPurchase: boolean;
  conversionRatio: number | null | undefined;
}): number {
  if (!isPurchase) return quantity; // Sales: 1:1 with base unit
  if (!conversionRatio || conversionRatio <= 0) {
    throw new Error("Invalid conversion ratio for purchase transaction");
  }
  return quantity * conversionRatio;
}
