

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn("[SUPABASE] Supabase configuration is missing. Authentication features will be disabled. The app will run in demo mode. Please set up NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
} else {
  console.log("[SUPABASE] Supabase is configured.");
}

// The singleton client instance has been removed to favor context-specific clients
// created by the Supabase Auth Helpers library (e.g., createClientComponentClient,
// createServerActionClient), which is the recommended pattern for the Next.js App Router
// to ensure proper session management via cookies.
