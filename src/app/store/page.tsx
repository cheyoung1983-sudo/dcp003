"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const StoreView = dynamic(() => import('../../components/StoreView').then(m => m.StoreView), {
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      <p className="text-sm font-mono">Loading Storefront...</p>
    </div>
  ),
  ssr: false
});

export default function Store() {
  return (
    <StoreView />
  );
}
