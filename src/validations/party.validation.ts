import { z } from "zod";

export const partySchema = z.object({
  type: z.enum(["VENDOR", "CUSTOMER"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  state: z.string().min(2, "State is required"),
  contactInfo: z.string().optional(),
  creditPeriod: z.number().min(0),
  creditLimit: z.number().optional(),
  openingBalance: z.number(),
  priceListId: z.string().optional(),
});

export type PartyFormValues = z.infer<typeof partySchema>;
