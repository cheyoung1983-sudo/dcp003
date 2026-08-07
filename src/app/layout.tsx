import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { auth0, getAppBaseUrl } from "@/lib/auth0";
import { cookies } from 'next/headers';
import * as jose from 'jose';
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Display & Cell Pros LLC | Spokane On-Site Mobile Repair',
  description: 'Professional on-site mobile electronics and smartphone repair services in Spokane, Washington and Spokane Valley.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  let user = session?.user;
  const appBaseUrl = getAppBaseUrl();

  // Unified authentication check (Auth0 or Google)
  const cookieStore = await cookies();
  const googleToken = cookieStore.get('google_session_token')?.value;

  if (!user && googleToken) {
    try {
      const decoded = jose.decodeJwt(googleToken);
      user = {
        name: (decoded.name as string) || (decoded.email as string),
        email: decoded.email as string,
        picture: decoded.picture as string,
        sub: decoded.sub as string,
      };
    } catch (err) {
      console.error('Failed to decode Google token:', err);
    }
  }

  const isAuthenticated = !!user;

  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}>
      <head>
        <Script
          src="https://www.google.com/recaptcha/enterprise.js?render=6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj"
          strategy="afterInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
        {/* Google One Tap / Automatic Sign-in Initialization (only for unauthenticated users) */}
        {!isAuthenticated && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <div id="g_id_onload"
               data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
               data-context="signin"
               data-login_uri={`${appBaseUrl}/api/auth/google/callback`}
               data-auto_select="true"
               data-itp_support="true"
               data-use_fedcm_for_prompt="true">
          </div>
        )}
        <Auth0Provider user={user}>
          <header className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-xl tracking-tight text-blue-600">Display & Cell Pros LLC</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full hidden sm:inline-block">Spokane, WA On-Site Repair</span>
              </div>
              <nav className="flex items-center space-x-6 text-sm font-medium text-slate-600">
                <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
                <a href="#quote" className="hover:text-blue-600 transition-colors">Instant Quote</a>
                <a href="#verify" className="hover:text-blue-600 transition-colors">Secure Verification</a>
                <div className="h-6 w-px bg-slate-200" />
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <Profile />
                    </div>
                    <div className="w-32">
                      <LogoutButton />
                    </div>
                  </div>
                ) : (
                  <div className="w-32">
                    <LoginButton />
                  </div>
                )}
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm">© {new Date().getFullYear()} Display & Cell Pros LLC. Serving Spokane, Washington & Spokane Valley.</p>
              <p className="text-xs">Protected by reCAPTCHA Enterprise.</p>
            </div>
          </footer>
        </Auth0Provider>
      </body>
    </html>
  );
}
