import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type SupabaseConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export const createSupabaseClient = (config: SupabaseConfig = {}): SupabaseClient => {
  const supabaseUrl = config.supabaseUrl ?? process.env.SUPABASE_URL;
  const supabaseAnonKey = config.supabaseAnonKey ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};
