/**
 * Auth helpers — wraps Supabase Auth so the rest of the app talks to a single
 * `getSession()` / `getProfile()` API regardless of underlying provider.
 *
 * Strategy:
 *   - getSession()  → reads JWT from cookie directly (no network hop)
 *   - getProfile()  → uses service-role client to query profiles (no RLS friction)
 *   - requireAdmin / requireApproved → thin wrappers over getProfile()
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export type ProfileStatus = 'pending' | 'approved' | 'revoked';
export type ProfileRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  rpps_number: string | null;
  specialty: string | null;
  hospital: string | null;
  status: ProfileStatus;
  role: ProfileRole;
  created_at: string;
  approved_at: string | null;
}

/** Returns the Supabase user from the session cookie — no network call. */
export async function getSession() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

/**
 * Returns the full profile for the currently logged-in user.
 * Uses getSession() (cookie read, fast) + service-role client (no RLS).
 */
export async function getProfile(): Promise<Profile | null> {
  const user = await getSession();
  if (!user) return null;

  const admin = getSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as Profile | null;
}

export async function requireApproved(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.status !== 'approved') {
    throw new Error('UNAUTHORIZED');
  }
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
    throw new Error('FORBIDDEN');
  }
  return profile;
}

export function canViewPro(profile: Profile | null): boolean {
  return profile?.status === 'approved';
}
