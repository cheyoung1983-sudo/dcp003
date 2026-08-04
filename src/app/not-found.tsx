import Link from 'next/link';
import { Wrench, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Wrench className="h-16 w-16 text-blue-500 mb-4 animate-bounce" />
      <h1 className="text-4xl font-extrabold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        The requested diagnostic path or page does not exist in our system laboratory.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
      >
        <Home size={18} /> Return to Home
      </Link>
    </div>
  );
}
