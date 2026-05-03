import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for trusted server-side operations.
 * Bypasses RLS — only use in server components / actions behind auth checks.
 * Never expose to the browser.
 */
export function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
