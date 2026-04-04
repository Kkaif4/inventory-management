export function parseBatchDate(dateStr: string, rowNumber: number): Date {
  if (!dateStr || typeof dateStr !== "string") {
    throw new Error(
      `Row ${rowNumber}: Batch Date is required when batch tracking enabled and stock > 0.`,
    );
  }

  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) {
    throw new Error(
      `Row ${rowNumber}: Batch Date "${dateStr}" is not in DD/MM/YYYY format.`,
    );
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error(
      `Row ${rowNumber}: Batch Date contains non-numeric values.`,
    );
  }

  if (month < 1 || month > 12) {
    throw new Error(`Row ${rowNumber}: Batch Date has invalid month ${month}.`);
  }

  if (day < 1 || day > 31) {
    throw new Error(`Row ${rowNumber}: Batch Date has invalid day ${day}.`);
  }

  const date = new Date(year, month - 1, day);

  // Rollover check (e.g. 31 Feb → 3 Mar)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error(
      `Row ${rowNumber}: Batch Date "${dateStr}" is invalid — day ${day} does not exist in month ${month}/${year}.`,
    );
  }

  return date;
}

export const getTodayDate = () => new Date().toISOString().split("T")[0];
