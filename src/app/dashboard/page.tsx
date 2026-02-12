import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookmarkManager from "@/components/BookmarkManager";
import type { Bookmark } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950">
            <Navbar user={user} />
            <BookmarkManager
                user={user}
                initialBookmarks={(bookmarks as Bookmark[]) || []}
            />
        </div>
    );
}
