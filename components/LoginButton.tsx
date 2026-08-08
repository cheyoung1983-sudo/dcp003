import React from 'react';
import { Inter } from 'next/font/google';
import styles from './SignInButton.module.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600'] });

export default function LoginButton() {
  const handleSignIn = async () => {
    // Trigger Vercel OAuth flow via the credentials provider (expects code param)
    // We'll redirect to the /api/auth/signin route which starts Vercel OAuth
    await fetch('/api/auth/signin');
    // Alternatively, you could directly navigate:
    // window.location.href = '/api/auth/signin';
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
