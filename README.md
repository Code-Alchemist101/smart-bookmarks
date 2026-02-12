# Smart Bookmarks

A real-time bookmark manager built with **Next.js 15 (App Router)**, **Supabase**, and **Tailwind CSS**. Users sign in with Google OAuth and can save, view, and delete their private bookmarks — synced in real time across tabs.

**Live URL:** [https://smart-bookmarks-three.vercel.app](https://smart-bookmarks-three.vercel.app)

---

## Features

- **Google OAuth** — sign in with your Google account (no email/password)
- **Add bookmarks** — save any URL with a custom title
- **Private bookmarks** — each user only sees their own bookmarks (enforced via Supabase Row Level Security)
- **Real-time sync** — open two tabs and add/delete a bookmark in one; it instantly appears/disappears in the other
- **Delete bookmarks** — hover to reveal the delete button

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Framework      | Next.js 15 (App Router)           |
| Auth & DB      | Supabase (Auth, Database, Realtime) |
| Styling        | Tailwind CSS                      |
| Deployment     | Vercel                            |
| Language       | TypeScript                        |

## Project Structure

```
src/
├── app/
│   ├── auth/callback/route.ts   # OAuth callback handler
│   ├── dashboard/page.tsx       # Main dashboard (server component)
│   ├── login/page.tsx           # Login page with Google button
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing redirect
├── components/
│   ├── BookmarkManager.tsx      # Client component: add, delete, realtime
│   └── Navbar.tsx               # Top nav with user info + sign out
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── middleware.ts        # Session refresh + route protection
│   └── types.ts                 # Bookmark type definition
└── middleware.ts                # Next.js middleware entry
```

## Problems I Ran Into & How I Solved Them

### 1. Supabase URL Typo — DNS Error
**Problem:** After setting up `.env.local`, clicking "Continue with Google" showed `DNS_PROBE_FINISHED_NXDOMAIN`. The Supabase project URL had a missing character (`ubqkknaaxwzcqpybxjw` instead of `ubqkknaaxwvzcqpybxjw`).

**Solution:** Cross-checked the Project URL from the Supabase Dashboard → Settings → Data API and corrected the `.env.local` value. Decoded the JWT anon key to verify the `ref` field matched.

### 2. Google OAuth `redirect_uri_mismatch`
**Problem:** After fixing the Supabase URL, Google OAuth threw `Error 400: redirect_uri_mismatch` because the Authorized Redirect URI in Google Cloud Console still had the old (typo'd) Supabase callback URL.

**Solution:** Updated the redirect URI in Google Cloud Console → Credentials → OAuth Client → Authorized Redirect URIs to match the correct Supabase callback URL.

### 3. Bookmarks Not Appearing After Insert
**Problem:** Adding a bookmark succeeded (inserted into the database) but the UI didn't update — the bookmark only appeared after a manual page refresh. The Supabase realtime subscription wasn't receiving events.

**Solution:** Added a refetch of bookmarks from the database immediately after a successful insert, removing the dependency on realtime for the local tab. This gives instant feedback to the user.

### 4. Real-Time Sync Not Working Between Tabs
**Problem:** Opening two browser tabs and adding a bookmark in one didn't reflect in the other. The Supabase realtime `postgres_changes` subscription wasn't firing.

**Solution:** Three fixes applied:
1. Set `REPLICA IDENTITY FULL` on the bookmarks table so DELETE events include the full row data
2. Removed per-column filters from the subscription (used `event: "*"` and filtered by `user_id` in the callback instead)
3. Memoized the Supabase client with `useMemo` and gave each subscription a unique channel name per user

### 5. Hydration Mismatch Warning
**Problem:** React hydration warnings in the console caused by a browser extension injecting `data-qb-installed` attribute into the `<html>` tag before React loaded.

**Solution:** Added `suppressHydrationWarning` to the `<html>` element in `layout.tsx`. This is a known, harmless issue when browser extensions modify the DOM.

## Setup (Local Development)

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Run the SQL schema in your Supabase SQL Editor (see `supabase/schema.sql`)
5. Enable Google provider in Supabase Auth → Providers
6. Start the dev server:
   ```bash
   npm run dev
   ```

## Database Schema

The app uses a single `bookmarks` table with Row Level Security:

```sql
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now() not null
);
```

Three RLS policies ensure users can only SELECT, INSERT, and DELETE their own bookmarks.
