// Supabase has been completely removed from this application
// Authentication and database operations now use PostgreSQL directly
// See /app/src/lib/auth.ts and /app/src/lib/database-server.ts

export const isSupabaseConfigured = false;

console.log("[DATABASE] Using PostgreSQL with optimized connection pooling and caching");