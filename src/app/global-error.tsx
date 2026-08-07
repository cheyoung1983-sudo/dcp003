'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | any;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AI Studio] Global Error:', error);
  }, [error]);

  const getErrorMessage = () => {
    if (!error) return 'A critical error occurred while loading the application.';
    if (typeof error === 'string') return error;
    if (error.message && typeof error.message === 'string' && error.message !== '[object Event]') {
      return error.message;
    }
    if (error.type) return `System event trigger (${error.type}).`;
    return 'An unexpected application load event occurred. Please refresh.';
  };

  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">System Error</h1>
          <p className="text-sm text-slate-400">
            {getErrorMessage()}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}

