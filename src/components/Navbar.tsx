"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar({ user }: { user: User }) {
    const supabase = createClient();
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        await supabase.auth.signOut();
        router.push("/login");
    };

    const avatarUrl = user.user_metadata?.avatar_url;
    const displayName = user.user_metadata?.full_name || user.email || "User";

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/5">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-white tracking-tight hidden sm:inline">
                        Smart Bookmarks
                    </span>
                </div>

                {/* User section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-8 h-8 rounded-full ring-2 ring-white/10"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-sm font-medium">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-sm text-slate-300 hidden sm:inline max-w-[150px] truncate">
                            {displayName}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {signingOut ? "..." : "Sign out"}
                    </button>
                </div>
            </div>
        </nav>
    );
}
