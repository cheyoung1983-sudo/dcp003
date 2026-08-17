"use client";

<<<<<<< HEAD
// src/components/SignInButton.tsx
import { signIn } from "next-auth/react";
import React from "react";

/**
 * Simple sign‑in button used on the /auth/signin page.
 * Adjust the provider name ("auth0", "github", etc.) according to your NextAuth configuration.
 */
export default function SignInButton() {
  React.useEffect(() => {
    window.onSubmit = async (token: string) => {
      console.log('reCAPTCHA enterprise token generated via callback:', token);
      try {
        await signIn("auth0");
      } catch (err) {
        console.error("Failed to sign in:", err);
      }
    };
  }, []);
=======
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function SignInButton() {
  const { loginWithRedirect } = useAuth0();
>>>>>>> 7eb9bfe (feat(repo): synchronize complete production codebase with TypeScript fixes and Stripe integration)

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
        await new Promise<void>((resolve) => {
          window.grecaptcha.enterprise.ready(async () => {
            const token = await window.grecaptcha.enterprise.execute('6LcB60UtAAAAAEk-ADlBMnuUjbWXddXTyXLcmoSj', { action: 'LOGIN' });
            console.log('reCAPTCHA enterprise token generated:', token);
<<<<<<< HEAD
            if (window.onSubmit) {
              window.onSubmit(token);
            }
=======
            loginWithRedirect();
>>>>>>> 7eb9bfe (feat(repo): synchronize complete production codebase with TypeScript fixes and Stripe integration)
            resolve();
          });
        });
      } else {
<<<<<<< HEAD
        await signIn("auth0");
      }
    } catch (err) {
      console.error("Failed to initiate sign‑in or reCAPTCHA verification:", err);
=======
        loginWithRedirect();
      }
    } catch (err) {
      console.error("Failed to initiate sign-in:", err);
      loginWithRedirect();
>>>>>>> 7eb9bfe (feat(repo): synchronize complete production codebase with TypeScript fixes and Stripe integration)
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
<<<<<<< HEAD
=======

>>>>>>> 7eb9bfe (feat(repo): synchronize complete production codebase with TypeScript fixes and Stripe integration)
