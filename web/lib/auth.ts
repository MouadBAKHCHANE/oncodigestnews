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
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    console.error('[getProfile] no session/user');
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[getProfile] profile query error:', JSON.stringify(error), 'userId:', user.id);
    return null;
  }
  if (!profile) {
    console.error('[getProfile] profile not found for userId:', user.id);
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
  if (!profile) {
    console.error('[requireAdmin] no profile');
    throw new Error('FORBIDDEN');
  }
  if (profile.role !== 'admin' || profile.status !== 'approved') {
    console.error('[requireAdmin] role/status mismatch:', { role: profile.role, status: profile.status });
    throw new Error('FORBIDDEN');
  }
  return profile;
}

export function canViewPro(profile: Profile | null): boolean {
  return profile?.status === 'approved';
}
