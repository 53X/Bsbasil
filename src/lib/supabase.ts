import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let clientPromise: Promise<SupabaseClient | null> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}

/** Loads the Supabase client on demand so it stays out of the first paint bundle. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured() || typeof window === 'undefined') return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } }),
    );
  }
  return clientPromise;
}
