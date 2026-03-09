"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Building2, ShieldAlert, Mail, Lock } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        if (
          res.error === "CredentialsSignin" ||
          res.error === "Invalid email or password"
        ) {
          setError("Invalid email or password");
        } else {
          setError(res.error || "An unexpected error occurred during sign in");
        }
      } else if (!res) {
        setError("Could not connect to the authentication server");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please check the server logs.");
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

        {error && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/10 text-red-300 p-4 rounded-xl border border-red-500/20 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
              Work Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder="admin@erp.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
              Access Token
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Securing Session...
              </>
            ) : (
              "Establish Connection"
            )}
          </button>
        </form>

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
