import { query } from '@/lib/serverDb';

export default async function CommentsPage() {
  let comments: any[] = [];
  let error: string | null = null;

  try {
    const response = await query('SELECT * FROM comments ORDER BY id DESC LIMIT 100');
    comments = response.rows;
  } catch (err: any) {
    console.error('Failed to fetch comments from Aurora:', err);
    error = err.message || 'Database connection error';
    // Fallback data for preview/development if table doesn't exist yet
    comments = [
      { id: 1, comment: "Spokane Lab: Bench level 3 rework initiated." },
      { id: 2, comment: "Micro-soldering station pre-heated to 365°C." }
    ];
  }

  return (
    <main className="max-w-4xl mx-auto py-20 px-6 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-playfair font-black text-slate-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg">
            💾
          </span>
          Next.js + AWS Aurora PostgreSQL
        </h1>
        <p className="text-slate-500 max-w-2xl text-lg">
          Live telemetry and bench logs synchronized with AWS RDS Aurora Serverless.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-medium">
          <p className="font-bold">Database Notice:</p>
          <p>{error}</p>
          <p className="mt-2 text-xs opacity-70 italic">Showing fallback/cached data. Ensure 'comments' table is created in your AWS RDS instance.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-slate-900 font-bold">{comment.comment}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Record ID: {comment.id}</span>
              </div>
            </div>
            <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md uppercase">
              Live
            </div>
          </div>
         ))}
      </div>

      <div className="pt-8 border-t border-slate-100">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
          D&CP Spokane Lab • Cloud Telemetry Node
        </p>
      </div>
    </main>
  );
}
