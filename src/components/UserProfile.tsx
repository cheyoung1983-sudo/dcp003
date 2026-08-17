"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div className="p-4 text-slate-500">Loading profile...</div>;
  if (error) return <div className="p-4 text-red-500 font-bold">Error: {error.message}</div>;
  if (!user) return <div className="p-4 text-slate-500">Not logged in. <a href="/api/auth/login" className="text-blue-600 underline">Sign In</a></div>;

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-sm">
      <div className="flex items-center gap-4">
        {user.picture && (
          <img
            src={user.picture}
            alt="Profile"
            className="w-12 h-12 rounded-full border border-slate-100"
            referrerPolicy="no-referrer"
          />
        )}
        <div>
          <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <a
          href="/api/auth/logout"
          className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider"
        >
          Sign Out
        </a>
      </div>
    </div>
  );
}
