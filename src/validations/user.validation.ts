import { z } from "zod";

export enum Role {
  ADMIN = "ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  SALES = "SALES",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
}

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(Role),
  passwordRaw: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  outletIds: z.array(z.string()),
});

export type UserFormValues = z.infer<typeof userSchema>;
