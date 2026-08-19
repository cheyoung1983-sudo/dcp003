import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 space-y-5 antialiased">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 border border-slate-800 animate-bounce">
          <ShieldCheck className="w-7 h-7 text-blue-400" />
        </div>
        <div className="absolute -inset-2 bg-blue-500/10 rounded-3xl blur-md -z-10 animate-pulse" />
      </div>

      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-widest">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading Laboratory Module...</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Calibrating Spokane Precision Bench Telemetry
        </p>
      </div>
    </div>
  );
}
