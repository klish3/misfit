-- ============================================================
-- Fix RLS policies for anonymous (unauthenticated) access
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Drop existing restrictive policies on conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

-- Drop existing restrictive policies on messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

-- ============================================================
-- Option A: Allow all access (simplest, for dev/personal use)
-- ============================================================

-- Conversations: full CRUD for anon
CREATE POLICY "Allow all select on conversations" ON public.conversations
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert on conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on conversations" ON public.conversations
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on conversations" ON public.conversations
  FOR DELETE USING (true);

-- Messages: full CRUD for anon
CREATE POLICY "Allow all select on messages" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert on messages" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on messages" ON public.messages
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on messages" ON public.messages
  FOR DELETE USING (true);
