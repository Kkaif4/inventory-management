import * as z from "zod";

export const outletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  invoiceStartingNumber: z.number().min(1),
  gstin: z.string(),
  defaultWarehouseId: z.string().min(1, "Default warehouse is required"),
  negativeStockPolicy: z.enum(["WARN", "BLOCK", "ALLOW"]),
  warehouseIds: z.array(z.string()).min(1, "Must link at least one warehouse"),
  batchTrackingEnabled: z.boolean(),
});

export type OutletFormValues = z.infer<typeof outletSchema>;
