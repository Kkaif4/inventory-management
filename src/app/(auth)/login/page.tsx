"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Building2, ShieldAlert, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/dashboard";

  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setGlobalError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        if (
          res.error === "CredentialsSignin" ||
          res.error === "Invalid email or password"
        ) {
          setGlobalError("Invalid email or password");
        } else {
          setGlobalError(
            res.error || "An unexpected error occurred during sign in",
          );
        }
      } else if (!res) {
        setGlobalError("Could not connect to the authentication server");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setGlobalError(
        "An unexpected error occurred. Please check the server logs.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full" />

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl px-8 py-10 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 justify-center mb-10 group"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-white">
            Industrial<span className="text-indigo-400">ERP</span>
          </span>
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm">
            Authorized personnel access only
          </p>
        </div>

        {globalError && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/10 text-red-300 p-4 rounded-xl border border-red-500/20 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            {globalError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                    Work Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
                      <Input
                        placeholder="admin@erp.com"
                        className="pl-12 pr-4 py-6 bg-slate-950/50 border-white/5 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-white placeholder:text-slate-600 rounded-xl"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 ml-1 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                    Access Token
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-12 pr-4 py-6 bg-slate-950/50 border-white/5 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 text-white placeholder:text-slate-600 rounded-xl"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 ml-1 text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-6 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Securing Session...
                </>
              ) : (
                "Establish Connection"
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Forgot credentials?{" "}
          <span className="text-indigo-400 underline cursor-pointer hover:text-indigo-300">
            Contact Admin
          </span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
