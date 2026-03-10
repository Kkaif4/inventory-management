import { getGSTSummary } from "@/actions/reports";
import { FileBarChart, Calculator, Landmark, ShieldCheck } from "lucide-react";

export default async function GSTSummaryPage() {
  // Hardcoded dates for initial summary view
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date();

  const data = await getGSTSummary(startDate, endDate);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">GST Summary</h2>
            <p className="text-sm text-slate-500">
              Input vs Output Tax reconciliation.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
          Current Period
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />
            Input GST (ITC)
          </h3>
          <div className="text-4xl font-black text-slate-900 font-mono">
            ₹{data.inputGST.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tax paid on utility, purchases, and inward supplies. This amount can
            be claimed as Input Tax Credit.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <Landmark className="w-4 h-4 mr-2 text-orange-500" />
            Output GST
          </h3>
          <div className="text-4xl font-black text-slate-900 font-mono">
            ₹{data.outputGST.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tax collected on sales and outward supplies. This is your liability
            to the government.
          </p>
        </div>
      </div>

      <div
        className={`p-8 rounded-2xl border-2 flex flex-col items-center justify-center space-y-3 shadow-lg
        ${
          data.outputGST > data.inputGST
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-indigo-600 border-indigo-500 text-white"
        }
      `}
      >
        <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          {data.outputGST > data.inputGST
            ? "Estimated Net Tax Payable"
            : "Excess Credit Balance"}
        </div>
        <div className="text-5xl font-black font-mono">
          ₹{Math.abs(data.outputGST - data.inputGST).toLocaleString()}
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg text-xs font-medium">
          GSTR-3B Preliminary Calculation
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["GSTR-1 (Sales)", "GSTR-3B (Returns)", "ITC Register"].map(
          (report) => (
            <button
              key={report}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-between"
            >
              {report}
              <FileBarChart className="w-4 h-4 text-slate-400" />
            </button>
          ),
        )}
      </div>
    </div>
  );
}
