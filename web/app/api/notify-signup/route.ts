import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, newSignupAdminNotification } from '@/lib/email';

const bodySchema = z.object({
  fullName: z.string().min(1).max(160),
  email: z.string().email(),
  profession: z.string().optional(),
  specialty: z.string().optional(),
  hospital: z.string().optional(),
});

/**
 * Fire-and-forget endpoint hit by /inscription + the homepage CTA form
 * after a successful Supabase signUp(). Sends an email to
 * ADMIN_NOTIFICATION_EMAIL with the new HCP's details + a deep link to
 * /admin/users.
 *
 * No auth required because the request is anonymous (the signup just
 * happened); we trust client-supplied values only enough to forward an
 * email — RLS still gates the actual profile data.
 */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminTo) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await sendEmail(newSignupAdminNotification(parsed.data));
  return NextResponse.json(result);
}
