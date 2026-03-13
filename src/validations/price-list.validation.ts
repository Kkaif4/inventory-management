import { z } from "zod";

export const priceListFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  isActive: z.boolean(),
  entries: z
    .array(
      z.object({
        variantId: z.string().min(1, "Please select a variant."),
        price: z.number().min(0, "Price must be >= 0"),
      }),
    )
    .min(1, "Add at least one product price."),
  partyIds: z.array(z.string()),
});

export type PriceListFormValues = z.infer<typeof priceListFormSchema>;
