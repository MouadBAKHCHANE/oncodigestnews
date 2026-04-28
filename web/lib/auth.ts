/**
 * Auth helpers — wraps Supabase Auth so the rest of the app talks to a single
 * `getSession()` / `getProfile()` API regardless of underlying provider.
 *
 * Auth.js (NextAuth v5) is installed but currently we route auth through
 * Supabase's own session cookie because:
 *   - the user database lives in Supabase
 *   - row-level security policies key off `auth.uid()`
 * Auth.js stays installed for future OAuth providers (LinkedIn, Google).
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';

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

export async function getSession() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
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
