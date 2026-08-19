'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, RefreshCw, Home, Terminal, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime exception for diagnostics
    console.error('[Spokane Bench Runtime Exception]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/60 space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/60">
              System Triage Alert
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Laboratory Runtime Exception
            </h1>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600 leading-relaxed">
          The bench application encountered an unexpected runtime fault during component execution. Session state has been safely isolated.
        </p>

        {/* Technical Fault Card */}
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center gap-1.5 font-sans font-bold">
              <Terminal className="w-3.5 h-3.5 text-rose-400" /> Fault Diagnostic Log
            </span>
            {error.digest && (
              <span className="text-[10px] text-slate-500">Digest: {error.digest}</span>
            )}
          </div>
          <p className="text-rose-300 break-words line-clamp-3">
            {error.message || 'An unhandled exception occurred during component render.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-triage Component</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Return to Portal</span>
          </button>
        </div>

        {/* Support note */}
        <div className="text-center border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-400">
            Spokane Laboratory Operations &bull; Display & Cell Pros LLC
          </p>
        </div>
      </div>
    </div>
  );
}
