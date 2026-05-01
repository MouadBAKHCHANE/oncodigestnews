'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireApproved } from '@/lib/auth';

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(160).trim(),
  specialty: z.string().max(120).trim().optional().or(z.literal('')),
  hospital: z.string().max(120).trim().optional().or(z.literal('')),
  rpps_number: z
    .string()
    .regex(/^\d{11}$/, 'Le numéro RPPS doit faire 11 chiffres')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export type UpdateResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Partial<Record<keyof ProfileUpdateInput, string>> };

export async function updateOwnProfile(raw: unknown): Promise<UpdateResult> {
  let me;
  try {
    me = await requireApproved();
  } catch {
    return { ok: false, error: 'Connexion requise.' };
  }

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ProfileUpdateInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof ProfileUpdateInput | undefined;
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      specialty: parsed.data.specialty || null,
      hospital: parsed.data.hospital || null,
      rpps_number: parsed.data.rpps_number || null,
    })
    .eq('id', me.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/account');
  return { ok: true };
}
