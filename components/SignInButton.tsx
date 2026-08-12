import React from 'react';
import { signIn } from 'next-auth/react';
import { Inter } from 'next/font/google';
import styles from './SignInButton.module.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

export default function SignInButton() {
  const handleSignIn = async () => {
    // Initiates Vercel OAuth flow via the /api/auth/signin route we just created
    await signIn('credentials', {
      callbackUrl: '/',
      redirect: false,
    });
  };

  return (
    <button className={`${styles.button} ${inter.className}`} onClick={handleSignIn}>
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M24 22.5L12 1.5 0 22.5z" fill="currentColor" />
      </svg>
      Sign in with Vercel
    </button>
  );
}
