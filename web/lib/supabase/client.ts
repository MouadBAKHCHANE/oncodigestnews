import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for use in Client Components.
 * Only safe to expose anon key here.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
