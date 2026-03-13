/**
 * Predefined units for products and inventory management.
 */
export const PRODUCT_UNITS = [
  { value: "PCS", label: "Pieces (PCS)" },
  { value: "BOX", label: "Box (BOX)" },
  { value: "SET", label: "Set (SET)" },
  { value: "UNIT", label: "Unit (UNIT)" },
  { value: "KG", label: "Kilogram (KG)" },
  { value: "G", label: "Gram (G)" },
  { value: "M", label: "Meter (M)" },
  { value: "FT", label: "Feet (FT)" },
  { value: "PKT", label: "Packet (PKT)" },
  { value: "ROL", label: "Roll (ROL)" },
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number]["value"];
