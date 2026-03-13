import * as z from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  state: z.string().min(1, "State is required"),
  contactName: z.string().min(1, "Contact person is required"),
  contactPhone: z.string().min(10, "Valid phone number required"),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
