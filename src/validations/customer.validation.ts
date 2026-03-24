import * as z from "zod";

export const customerSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required").max(120, "Name too long"),
    b2b: z.boolean().default(false), // Controls UI flow for GSTIN
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
    city: z.string().optional(),
    state: z.string().min(2, "State is required"),
    pinCode: z.string().optional(),
    creditPeriod: z.coerce.number().min(0).default(30),
    creditLimit: z.coerce.number().min(0).optional(),
    openingBalance: z.coerce.number().default(0),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // B2B must have GSTIN
    if (data.b2b) {
      if (!data.gstin || data.gstin.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GSTIN is required for B2B customers",
          path: ["gstin"],
        });
      } else if (data.gstin.length !== 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GSTIN must be exactly 15 characters",
          path: ["gstin"],
        });
      }
    }
  });

export type CustomerFormValues = z.infer<typeof customerSchema>;
