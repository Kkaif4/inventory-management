import { z } from "zod";

export const transferSchema = z
  .object({
    variantId: z.string().min(1, "Product variant is required"),
    fromLocation: z.string().min(1, "Source location is required"),
    toLocation: z.string().min(1, "Destination location is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  })
  .refine((data) => data.fromLocation !== data.toLocation, {
    message: "Source and destination cannot be the same",
    path: ["toLocation"],
  });

export type TransferFormValues = z.infer<typeof transferSchema>;
