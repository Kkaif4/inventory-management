import Link from "next/link";
import {
  Building2,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Package,
  ArrowRight,
  Database,
  Truck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Industrial<span className="text-indigo-400">ERP</span>
            </span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all flex items-center gap-2 transition-transform active:scale-95"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden text-center max-w-5xl mx-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] -z-10 rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-sm animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Version 1.2 Now Live
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-[1.1]">
          Orchestrate Your <br />
          Industrial Empire
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one platform for inventory tracking, secondary sales, and
          double-entry accounting designed for modern manufacturing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-slate-300 font-semibold rounded-xl border border-white/10 hover:bg-slate-800 transition-all hover:border-white/20 active:scale-95">
            Book a Demo
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Package className="w-6 h-6 text-emerald-400" />}
            title="Inventory Ledger"
            description="Real-time multi-location stock tracking with FIFO valuation and auto-reorder alerts."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
            title="GST Compliance"
            description="Automated CGST/SGST/IGST calculations with GSTR-1 and GSTR-3B ready reports."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
            title="Audit System"
            description="Comprehensive immutable logs for every administrative action and financial entry."
          />
        </div>
      </section>

      {/* Secondary Stats */}
      <section className="py-20 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-3xl font-bold mb-1">24/7</div>
            <div className="text-slate-500 text-sm">Real-time Sync</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">99.9%</div>
            <div className="text-slate-500 text-sm">Data Integrity</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">100+</div>
            <div className="text-slate-500 text-sm">Active Warehouses</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">Auto</div>
            <div className="text-slate-500 text-sm">Report Gen</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm uppercase tracking-widest bg-slate-950">
        &copy; 2024 Industrial ERP Solutions. Built for scale.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/[0.08] transition-all group border-gradient-h text-left">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
