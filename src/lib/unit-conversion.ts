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
