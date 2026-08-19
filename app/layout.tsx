import type { Metadata, Viewport } from 'next';
import React from 'react';
import '@/index.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Display & Cell Pros LLC | Bench Repair Portal',
  description: 'Offline-capable device repair intake, WebUSB diagnostic port monitor, and bench QA portal for Spokane HQ Lab.',
  applicationName: 'D&CP Repair',
  appleWebApp: {
    capable: true,
    title: 'D&CP Repair',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#fafafa]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-jakarta text-slate-900 bg-[#fafafa] antialiased selection:bg-blue-600 selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
