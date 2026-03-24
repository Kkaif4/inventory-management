import * as z from "zod";

export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required").max(120, "Name too long"),
  gstin: z
    .string()
    .max(15, "GSTIN must be 15 characters")
    .optional()
    .or(z.literal("")),
  pan: z.string().max(10).optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone is required")
    .max(15)
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactInfo: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  state: z.string().min(2, "State is required"),
  creditPeriod: z.coerce.number().min(0).default(30),
  openingBalance: z.coerce.number().default(0),
  isActive: z.boolean().default(true),

  // Bank Details
  bankName: z.string().optional().or(z.literal("")),
  bankAccountName: z.string().optional().or(z.literal("")),
  bankAccountNumber: z.string().optional().or(z.literal("")),
  bankIfsc: z.string().max(11).optional().or(z.literal("")),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
