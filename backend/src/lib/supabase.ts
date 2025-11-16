import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;

export const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key must be provided.");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};

