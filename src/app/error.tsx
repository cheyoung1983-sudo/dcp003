'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AI Studio] Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6">
        <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">Something went wrong</h1>
      <p className="text-slate-400 mb-6 max-w-md text-sm">
        {error?.message || 'An unexpected error occurred in the system laboratory.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg"
        >
          <RefreshCw size={16} /> Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-sm border border-slate-700 transition-all"
        >
          <Home size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
}
