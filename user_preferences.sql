-- ============================================================
-- Create user_preferences table for model settings
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id text PRIMARY KEY,
  temperature float DEFAULT 0.7,
  top_p float DEFAULT 0.9,
  selected_model text DEFAULT 'mistral-small-latest',
  system_prompt text DEFAULT '',
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow all access for development (matching current project pattern)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_preferences' 
        AND policyname = 'Allow all access to user_preferences'
    ) THEN
        CREATE POLICY "Allow all access to user_preferences" ON public.user_preferences FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
