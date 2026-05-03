import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Route protection per AUTH-STATES.md §"Middleware: route protection".
 * (Next.js 16 renamed the convention from "middleware" to "proxy".)
 *
 *   /admin/*    → admin role required
 *   /account/*  → any logged-in user
 *   pending     → soft-locked to /account/pending
 *   revoked     → forced sign-out
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Studio routes are admin-only. Studio additionally enforces its own
  // Sanity-account login on top of the Supabase gate (defense-in-depth).
  if (path.startsWith('/admin/studio')) {
    return enforceAdmin(request);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated user trying to access protected routes → redirect to login
  if (!user) {
    if (path.startsWith('/admin') || path.startsWith('/account') || path.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/connexion';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Look up profile to check status / role
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', user.id)
    .single();

  if (!profile) return response;

  // Revoked → force sign-out
  if (profile.status === 'revoked') {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('revoked', '1');
    return NextResponse.redirect(url);
  }

  // Pending → soft-lock to /account/pending (except sign-out + the pending page itself)
  if (profile.status === 'pending') {
    const allowed = path.startsWith('/account/pending') || path.startsWith('/api/auth');
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/pending';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Admin route → must have role=admin
  if (path.startsWith('/admin')) {
    if (profile.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

async function enforceAdmin(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/dashboard/:path*',
    '/dashboard',
    '/article/:path*',
    '/videos/:path*',
  ],
};
