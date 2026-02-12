"use client";

import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import type { User } from "@supabase/supabase-js";

export default function BookmarkManager({
    user,
    initialBookmarks,
}: {
    user: User;
    initialBookmarks: Bookmark[];
}) {
    const supabase = useMemo(() => createClient(), []);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Refetch all bookmarks from the database
    const refetchBookmarks = useCallback(async () => {
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) {
            setBookmarks(data as Bookmark[]);
        }
    }, [supabase, user.id]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel(`bookmarks-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    console.log("Realtime event:", payload.eventType, payload);

                    if (payload.eventType === "INSERT") {
                        const newBookmark = payload.new as Bookmark;
                        if (newBookmark.user_id !== user.id) return;
                        setBookmarks((prev) => {
                            if (prev.some((b) => b.id === newBookmark.id)) return prev;
                            return [newBookmark, ...prev];
                        });
                    } else if (payload.eventType === "DELETE") {
                        const deletedId = (payload.old as { id: string }).id;
                        setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                    } else if (payload.eventType === "UPDATE") {
                        // Refetch to get latest state
                        refetchBookmarks();
                    }
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, user.id, refetchBookmarks]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) return;

        setAdding(true);
        setError(null);

        // Normalize URL — add https:// if missing
        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = "https://" + normalizedUrl;
        }

        const { error: insertError } = await supabase.from("bookmarks").insert({
            title: title.trim(),
            url: normalizedUrl,
            user_id: user.id,
        });

        if (insertError) {
            console.error("Insert error:", insertError);
            setError(insertError.message);
        } else {
            setTitle("");
            setUrl("");
            titleInputRef.current?.focus();

            // Refetch bookmarks to ensure they appear immediately
            const { data: refreshed } = await supabase
                .from("bookmarks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (refreshed) {
                setBookmarks(refreshed as Bookmark[]);
            }
        }

        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const { error: deleteError } = await supabase
            .from("bookmarks")
            .delete()
            .eq("id", id);

        if (deleteError) {
            console.error("Delete error:", deleteError);
            setError(deleteError.message);
        } else {
            // Remove from local state immediately
            setBookmarks((prev) => prev.filter((b) => b.id !== id));
        }
        setDeletingId(null);
    };

    const getFaviconUrl = (bookmarkUrl: string) => {
        try {
            const domain = new URL(bookmarkUrl).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return null;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Your Bookmarks
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                    {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} saved
                </p>
            </div>

            {/* Add bookmark form */}
            <form
                onSubmit={handleAdd}
                className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6"
            >
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add a bookmark
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        ref={titleInputRef}
                        type="text"
                        placeholder="Title (e.g. React Docs)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                    <input
                        type="text"
                        placeholder="URL (e.g. react.dev)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={adding || !title.trim() || !url.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 cursor-pointer whitespace-nowrap"
                    >
                        {adding ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Adding...
                            </span>
                        ) : (
                            "Add Bookmark"
                        )}
                    </button>
                </div>
            </form>

            {/* Error toast */}
            {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Bookmark list */}
            {bookmarks.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-6">
                        <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-400">No bookmarks yet</h3>
                    <p className="text-slate-500 text-sm mt-1">Add your first bookmark above to get started</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-200"
                        >
                            {/* Favicon */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                                {getFaviconUrl(bookmark.url) ? (
                                    <img
                                        src={getFaviconUrl(bookmark.url)!}
                                        alt=""
                                        className="w-4 h-4"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium text-sm truncate">
                                    {bookmark.title}
                                </h3>
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 text-xs truncate block transition-colors"
                                >
                                    {bookmark.url}
                                </a>
                            </div>

                            {/* Date */}
                            <span className="text-slate-500 text-xs hidden sm:inline flex-shrink-0">
                                {formatDate(bookmark.created_at)}
                            </span>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(bookmark.id)}
                                disabled={deletingId === bookmark.id}
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                                title="Delete bookmark"
                            >
                                {deletingId === bookmark.id ? (
                                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
