'use server';

import { contactSchema, type ContactInput } from '@/lib/forms/schemas';

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Partial<Record<keyof ContactInput, string>>; formError?: string };

/**
 * Server action invoked by ContactForm. Re-validates with the Zod schema,
 * silently drops honeypot hits, and (in Phase 7) hands off to Resend to
 * deliver the message to contact@<domain>.
 *
 * For Phase 6 we ack success after validation only — the Resend wiring is
 * a Phase 7 deliverable. The form already prevents the user from spamming
 * by disabling the submit button while pending.
 */
export async function submitContact(raw: unknown): Promise<ContactSubmitResult> {
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactInput | undefined;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  // Honeypot: silently drop. The user sees a success state, the bot wastes time.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: true };
  }

  // TODO(phase7): Resend.send({ from: ..., to: process.env.ADMIN_NOTIFICATION_EMAIL, ... })
  // For now: pretend it worked.
  await new Promise((resolve) => setTimeout(resolve, 250));

  return { ok: true };
}
