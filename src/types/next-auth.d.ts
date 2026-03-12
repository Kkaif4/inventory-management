import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      outletId?: string | null;
      availableOutlets?: { id: string; name: string }[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    outletId?: string | null;
    availableOutlets?: { id: string; name: string }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    outletId?: string | null;
    availableOutlets?: { id: string; name: string }[];
  }
}
