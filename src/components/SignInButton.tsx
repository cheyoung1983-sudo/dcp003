"use client";

// src/components/SignInButton.tsx
import React from "react";

/**
 * Simple sign‑in button used on the /auth/signin page.
 * Uses a direct redirect to the Auth0 login flow.
 */
export default function SignInButton() {
  React.useEffect(() => {
    window.onSubmit = async (token: string) => {
      console.log('reCAPTCHA enterprise token generated via callback:', token);
      // Redirect to Auth0 login flow
      window.location.href = "/auth/login";
    };
  }, []);

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
        window.grecaptcha.enterprise.ready(async () => {
          const token = await window.grecaptcha.enterprise.execute('6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj', { action: 'LOGIN' });
          console.log('reCAPTCHA enterprise token generated:', token);
          if (window.onSubmit) {
            window.onSubmit(token);
          }
        });
      } else {
        window.location.href = "/auth/login";
      }
    } catch (err) {
      console.error("Failed to initiate sign‑in or reCAPTCHA verification:", err);
      window.location.href = "/auth/login";
    }
  };

  return (
    <button
      className="g-recaptcha w-[240px] flex items-center justify-center gap-2 rounded-md bg-[#4f46e5] h-[40px] font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
      data-sitekey="6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj"
      data-callback="onSubmit"
      data-action="submit"
      onClick={onClick}
    >
      <img src="https://vercel.com/favicon.ico" alt="" className="w-4 h-4 invert" />
      Sign in with Vercel
    </button>
  );
}
