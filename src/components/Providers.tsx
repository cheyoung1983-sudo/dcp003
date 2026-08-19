'use client';

import React, { ReactNode } from 'react';
import { Auth0ProviderWithConfig } from './Auth0ProviderWithConfig';
import { ToastProvider } from './Toast';

export interface ProvidersProps {
  children: ReactNode;
}

/**
 * Standardized client provider tree for Next.js App Router & client components.
 * Encompasses Auth0 authentication and global laboratory Toast notifications.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <Auth0ProviderWithConfig>
      <ToastProvider>
        {children}
      </ToastProvider>
    </Auth0ProviderWithConfig>
  );
}

export default Providers;
