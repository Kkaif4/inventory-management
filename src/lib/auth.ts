import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@erp.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { outlets: true },
          });

          if (
            !user ||
            !(await bcrypt.compare(credentials.password, user.password))
          ) {
            throw new Error("Invalid email or password");
          }

          if (!user.isActive) {
            throw new Error("Your account has been deactivated");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            outletId: user.outlets?.[0]?.id?.toString() || "",
          };
        } catch (error: any) {
          console.error("Auth Authorize Error:", error);
          if (error.code === "P2022") {
            throw new Error(
              "Database configuration error. Please run 'npx prisma db push'.",
            );
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        try {
          const userWithOutlets = await prisma.user.findUnique({
            where: { id: user.id },
            include: { outlets: true },
          });
          token.outletId = userWithOutlets?.outlets[0]?.id?.toString() || "";
          token.availableOutlets =
            userWithOutlets?.outlets.map((o) => ({
              id: o.id,
              name: o.name,
            })) || [];
        } catch (error: any) {
          console.error("Auth JWT Callback Error:", error);
          token.outletId = "";
          token.availableOutlets = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          outletId: token.outletId as string,
          availableOutlets: token.availableOutlets as any[],
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "default_development_secret_do_not_use_in_production",
};
