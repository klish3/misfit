import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const isBrokenUrl = supabaseUrl?.includes('evyyvgehnfyfkpzdppbd');

if (!supabaseUrl || !supabaseAnonKey) {
  if (!isBrokenUrl) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
