import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service-role client — SERVER ONLY. Bypasses RLS; never import into client code.
// Returns null when Supabase isn't configured (offline mode).
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const hasAdmin = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
