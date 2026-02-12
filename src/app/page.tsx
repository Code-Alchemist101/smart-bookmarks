import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-8 shadow-2xl shadow-indigo-500/30">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Smart Bookmarks
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Save your favorite links, organize them effortlessly, and keep them in sync across all your devices&thinsp;—&thinsp;in real-time.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
        >
          Get Started
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Features */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Private & Secure</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Your bookmarks are private. Only you can see them.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Real-time Sync</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Changes sync instantly across all open tabs.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Cloud-based</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Access your bookmarks from any browser, anywhere.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-slate-600 text-xs">
        Built with Next.js, Supabase & Tailwind CSS
      </footer>
    </div>
  );
}
