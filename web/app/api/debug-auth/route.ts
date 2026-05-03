import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Temporary diagnostic — call from a logged-in browser to see where auth fails.
export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => c.name);

  // Step 1: getSession via SSR client
  let sessionUser: string | null = null;
  let sessionErr: string | null = null;
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.getSession();
    sessionUser = data?.session?.user?.id ?? null;
    if (error) sessionErr = error.message;
  } catch (e) {
    sessionErr = e instanceof Error ? e.message : String(e);
  }

  // Step 2: Profile query via service role
  let profileFound = false;
  let profileRole: string | null = null;
  let profileStatus: string | null = null;
  let profileErr: string | null = null;
  if (sessionUser) {
    try {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      const { data, error } = await admin
        .from('profiles')
        .select('role, status')
        .eq('id', sessionUser)
        .maybeSingle();
      if (error) profileErr = error.message;
      if (data) {
        profileFound = true;
        profileRole = data.role;
        profileStatus = data.status;
      }
    } catch (e) {
      profileErr = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    cookies: allCookies,
    hasSupabaseAuthCookie: allCookies.some((n) => n.startsWith('sb-')),
    sessionUserId: sessionUser,
    sessionError: sessionErr,
    profileFound,
    profileRole,
    profileStatus,
    profileError: profileErr,
  });
}
