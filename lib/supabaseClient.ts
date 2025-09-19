// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseBrowser(): SupabaseClient {
  // do NOT throw at import time; only create when called
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // if envs are somehow missing at runtime, we'll still avoid a build crash
  return createClient(url || '', key || '', { auth: { persistSession: true } });
}
