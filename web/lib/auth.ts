import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

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

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function getSession() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getSession();
  if (!user) {
    console.error('[getProfile] no session');
    return null;
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[getProfile] SUPABASE_SERVICE_ROLE_KEY missing in env');
    return null;
  }

  const admin = adminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[getProfile] query error:', error.message, error.code);
    return null;
  }
  if (!profile) {
    console.error('[getProfile] profile row not found for', user.id);
    return null;
  }

  return profile as Profile;
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
