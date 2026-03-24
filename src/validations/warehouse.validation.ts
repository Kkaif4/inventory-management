import * as z from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  state: z.string().min(1, "State is required"),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
