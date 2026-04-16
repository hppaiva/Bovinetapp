import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (supabaseClient) return supabaseClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) return null;
      const { supabaseUrl, supabaseAnonKey } = await res.json();
      if (!supabaseUrl || !supabaseAnonKey) return null;
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseClient;
    } catch {
      return null;
    }
  })();

  return initPromise;
}

// Synchronous getter (only works after getSupabase() has been awaited once)
export function getSupabaseSync(): SupabaseClient | null {
  return supabaseClient;
}
