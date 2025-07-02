
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
  console.log("[SUPABASE] Supabase configured and initialized.");
} else {
  console.warn("[SUPABASE] Supabase configuration is missing. Authentication features will be disabled. The app will run in demo mode. Please set up NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
}

export const supabase = supabaseInstance;
