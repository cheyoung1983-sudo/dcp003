"use client";

import React from "react";
import { useSafeAuth0 } from "./Auth0ProviderWithConfig";

export default function SignInButton() {
  const { loginWithRedirect } = useSafeAuth0();

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).grecaptcha.enterprise) {
        await new Promise<void>((resolve) => {
          (window as any).grecaptcha.enterprise.ready(async () => {
            try {
              const token = await (window as any).grecaptcha.enterprise.execute('6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj', { action: 'LOGIN' });
              console.log('reCAPTCHA enterprise token generated:', token);
            } catch (recaptchaErr) {
              console.warn('reCAPTCHA execution fallback:', recaptchaErr);
            }
            loginWithRedirect();
            resolve();
          });
        });
      } else {
        loginWithRedirect();
      }
    } catch (err) {
      console.error("Failed to initiate sign-in:", err);
      loginWithRedirect();
    }
  };

  return (
    <button
      className="g-recaptcha rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      data-sitekey="6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj"
      data-callback="onSubmit"
      data-action="submit"
      onClick={onClick}
    >
      Sign In
    </button>
  );
}
