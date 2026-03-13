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
  role: z.nativeEnum(Role),
  passwordRaw: z.string().min(6, "Password must be at least 6 characters"),
  outletIds: z.array(z.string()),
});

export type UserFormValues = z.infer<typeof userSchema>;
