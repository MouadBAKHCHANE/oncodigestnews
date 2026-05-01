'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { sendEmail, suspensionEmail, welcomeEmail } from '@/lib/email';

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Approve a pending user.
 *   1. updates profiles.status = 'approved' + sets approved_at + approved_by
 *   2. inserts an approval_log audit row
 *   3. (Phase 7.5) sends a welcome email via Resend
 *
 * RLS policy "admins update profiles" enforces that only admins can run this;
 * we additionally check role at the action level for early failure.
 */
export async function approveUser(profileId: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Accès refusé.' };
  }

  if (admin.id === profileId) {
    return { ok: false, error: 'Vous ne pouvez pas vous approuver vous-même.' };
  }

  const supabase = await getSupabaseServerClient();

  const { data: target } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', profileId)
    .single();

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
      revoked_at: null,
      revoked_by: null,
      revocation_reason: null,
    })
    .eq('id', profileId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase.from('approval_log').insert({
    profile_id: profileId,
    action: 'approve',
    actor_id: admin.id,
  });

  if (target?.email) {
    void sendEmail(welcomeEmail({ fullName: target.full_name, email: target.email }));
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

/**
 * Revoke an approved user.
 *   - blocks revoking the last admin (db count check)
 *   - sets status = 'revoked' + revoked_at/by + optional reason
 */
export async function revokeUser(
  profileId: string,
  reason?: string,
): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Accès refusé.' };
  }

  if (admin.id === profileId) {
    return { ok: false, error: 'Vous ne pouvez pas révoquer votre propre compte.' };
  }

  const supabase = await getSupabaseServerClient();

  const { data: target } = await supabase
    .from('profiles')
    .select('email, full_name, role')
    .eq('id', profileId)
    .single();

  // Defense check: don't let the last admin be revoked.
  if (target?.role === 'admin') {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('status', 'approved');
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Impossible de révoquer le dernier administrateur." };
    }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: admin.id,
      revocation_reason: reason ?? null,
    })
    .eq('id', profileId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase.from('approval_log').insert({
    profile_id: profileId,
    action: 'revoke',
    actor_id: admin.id,
    reason: reason ?? null,
  });

  if (target?.email) {
    void sendEmail(
      suspensionEmail({ fullName: target.full_name, email: target.email, reason }),
    );
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

/**
 * Restore a revoked user back to pending so an admin can re-approve.
 */
export async function resetToPending(profileId: string): Promise<ActionResult> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return { ok: false, error: 'Accès refusé.' };
  }

  const supabase = await getSupabaseServerClient();
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      status: 'pending',
      revoked_at: null,
      revoked_by: null,
      revocation_reason: null,
      approved_at: null,
      approved_by: null,
    })
    .eq('id', profileId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase.from('approval_log').insert({
    profile_id: profileId,
    action: 'reset_to_pending',
    actor_id: admin.id,
  });

  revalidatePath('/admin/users');
  return { ok: true };
}
