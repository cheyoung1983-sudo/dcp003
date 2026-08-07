import React from 'react';
import SignInButton from '../../../components/SignInButton';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import styles from './SignInPage.module.css';

export default function SignInPage() {
  return (
    <main className={styles.container}>
      <div className={styles.glassCard}>
        <h1 className={styles.title}>Welcome to DisplayCellPros</h1>
        <p className={styles.subtitle}>Secure technician portal</p>
        <div className="space-y-4">
          <SignInButton />
          <div className="flex items-center gap-4 text-slate-400">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs uppercase tracking-widest font-semibold">Or</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
