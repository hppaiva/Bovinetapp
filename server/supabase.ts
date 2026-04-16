import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found — running without Supabase client');
}

// Server-side Supabase client (uses anon key for auth verification)
// NOTE: For production, replace SUPABASE_ANON_KEY with the real service_role key
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Verify a Supabase JWT token and return the user
export async function verifySupabaseToken(token: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

// Public config to expose to the frontend
export const supabasePublicConfig = {
  url: supabaseUrl || '',
  anonKey: supabaseAnonKey || '',
};
