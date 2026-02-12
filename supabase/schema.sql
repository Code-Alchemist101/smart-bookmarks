-- ==============================================
-- Smart Bookmarks — Database Schema
-- Run this in the Supabase SQL Editor
-- ==============================================

-- 1. Create the bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now() not null
);

-- 2. Enable Row Level Security
alter table public.bookmarks enable row level security;

-- 3. RLS Policies — each user can only see/insert/delete their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- 4. Enable Realtime for bookmarks
alter publication supabase_realtime add table public.bookmarks;
