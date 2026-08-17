import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import UserProfile from "@/components/UserProfile";

export default async function ProtectedPage() {
  const session = await auth0.getSession();

  if (!session) {
    // Note: The auth route is configured in src/app/auth/[auth0]/route.ts
    // so we redirect to /auth/login instead of the default /api/auth/login
    redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-playfair font-black text-slate-900">Laboratory Command Center</h1>
        <p className="text-slate-500 max-w-2xl">
          Secure access established. You are currently viewing internal bench telemetry and technician protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Authenticated Identity</h3>
          <UserProfile />
        </section>

        <section className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="font-bold">🔒</span>
            </div>
            <h2 className="text-xl font-bold">Protected Session Data</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <p className="text-[10px] font-mono text-slate-400 uppercase mb-2">Access Token Status</p>
              <p className="text-sm font-bold text-emerald-400">ACTIVE & VERIFIED</p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <p className="text-[10px] font-mono text-slate-400 uppercase mb-2">User ID (Sub)</p>
              <p className="text-xs font-mono text-slate-300 break-all">{session.user.sub}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
