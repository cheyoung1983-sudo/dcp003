import React from 'react';
import Link from 'next/link';
import { SearchX, Home, ArrowLeft, Microscope, Terminal, Calculator, Smartphone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/60 space-y-6 text-center sm:text-left">
        {/* Header Badge & Icon */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <SearchX className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60 inline-block">
              HTTP 404 &bull; Route Missing
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Bench Resource Not Located
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              The requested laboratory endpoint or route could not be resolved.
            </p>
          </div>
        </div>

        {/* Informative text */}
        <p className="text-sm text-slate-600 leading-relaxed">
          The page or route you are attempting to access does not exist on this Spokane Laboratory portal node. Please navigate back to one of the active diagnostic benches:
        </p>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <Link
            href="/"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 shadow-xs shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Laboratory Store</div>
              <div className="text-[11px] text-slate-400">Main portal & store</div>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 shadow-xs shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Hardware Diag Port</div>
              <div className="text-[11px] text-slate-400">WebUSB telemetry monitor</div>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 shadow-xs shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Repair Calculator</div>
              <div className="text-[11px] text-slate-400">Triage quote estimator</div>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 shadow-xs shrink-0">
              <Microscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Device Intake</div>
              <div className="text-[11px] text-slate-400">Submit ticket for repair</div>
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold shadow-lg shadow-slate-900/15 transition-all w-full sm:w-auto"
          >
            <Home className="w-4 h-4 text-slate-300" />
            <span>Return to Laboratory Home</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 text-center sm:text-left">
          <p className="text-[11px] text-slate-400">
            Display & Cell Pros LLC &bull; 920 N Washington St, Spokane, WA 99201
          </p>
        </div>
      </div>
    </div>
  );
}
