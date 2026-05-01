'use server';

import { contactSchema, type ContactInput } from '@/lib/forms/schemas';
import { sendEmail } from '@/lib/email';

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Partial<Record<keyof ContactInput, string>>; formError?: string };

const SUBJECT_LABELS: Record<ContactInput['sujet'], string> = {
  question: 'Question générale',
  article: "Proposition d'article",
  partenariat: 'Partenariat',
  erreur: 'Signaler une erreur',
  autre: 'Autre',
};

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

  const { nom, email, sujet, message } = parsed.data;
  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminTo) {
    const escapedMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');

    void sendEmail({
      to: adminTo,
      subject: `[Contact] ${SUBJECT_LABELS[sujet]} — ${nom}`,
      html: `<p><strong>${nom}</strong> &lt;${email}&gt; vous a écrit :</p>
        <blockquote style="border-left:3px solid #82734c;padding:8px 16px;margin:16px 0;color:#5d5d5d">${escapedMessage}</blockquote>
        <p style="font-size:12px;color:#888">Sujet : ${SUBJECT_LABELS[sujet]}</p>`,
    });
  }

  return { ok: true };
}
