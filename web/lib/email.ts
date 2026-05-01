import { Resend } from 'resend';

/**
 * Resend wrapper. Only sends if RESEND_API_KEY is set; otherwise logs and
 * returns ok so dev environments work without email setup.
 *
 * From / admin notification address are read from env at call time.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export type EmailResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendInstance) resendInstance = new Resend(key);
  return resendInstance;
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@oncodigestnews.com';

  if (!resend) {
    // Dev fallback: log + succeed
    console.info('[email:noop]', { to: msg.to, subject: msg.subject });
    return { ok: true, id: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ─── Templates ───────────────────────────────────────────────── */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL ?? 'https://oncodigestnews.com';

function wrapTemplate(inner: string): string {
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f9f7f3;padding:32px;color:#242424">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:16px;padding:32px">
    <h1 style="font-family:Georgia,serif;font-weight:300;margin:0 0 16px;font-size:24px;color:#242424">OncoDigest</h1>
    ${inner}
    <hr style="border:none;border-top:1px solid #ededed;margin:32px 0 16px"/>
    <p style="font-size:12px;color:#888;margin:0">OncoDigest — ${SITE_URL}</p>
  </div></body></html>`;
}

export function newSignupAdminNotification(args: {
  fullName: string;
  email: string;
  profession?: string | null;
  specialty?: string | null;
  hospital?: string | null;
}): EmailMessage {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? '';
  const inner = `
    <h2 style="font-family:Georgia,serif;font-weight:300;margin:0 0 16px;font-size:18px">Nouvelle inscription</h2>
    <p style="margin:0 0 8px"><strong>${args.fullName}</strong> vient de s'inscrire sur OncoDigest.</p>
    <ul style="font-size:14px;line-height:1.6;color:#333;padding-left:20px">
      <li>Email : ${args.email}</li>
      ${args.profession ? `<li>Profession : ${args.profession}</li>` : ''}
      ${args.specialty ? `<li>Spécialité : ${args.specialty}</li>` : ''}
      ${args.hospital ? `<li>Ville : ${args.hospital}</li>` : ''}
    </ul>
    <p style="margin:24px 0 0">
      <a href="${SITE_URL}/admin/users" style="display:inline-block;padding:10px 20px;background:#242424;color:#fff;text-decoration:none;border-radius:32px;font-size:14px">Approuver dans /admin/users</a>
    </p>`;
  return {
    to,
    subject: `Nouvelle inscription : ${args.fullName}`,
    html: wrapTemplate(inner),
  };
}

export function welcomeEmail(args: { fullName: string; email: string }): EmailMessage {
  const inner = `
    <h2 style="font-family:Georgia,serif;font-weight:300;margin:0 0 16px;font-size:18px">Votre compte est activé</h2>
    <p style="margin:0 0 8px">Bonjour ${args.fullName},</p>
    <p style="margin:0 0 16px;line-height:1.6">
      Votre compte OncoDigest a été approuvé. Vous pouvez désormais accéder à l'ensemble
      du contenu réservé aux professionnels de santé : articles, rapports de congrès,
      vidéos et lives.
    </p>
    <p style="margin:24px 0 0">
      <a href="${SITE_URL}/connexion" style="display:inline-block;padding:10px 20px;background:#f0ff4d;color:#4b590e;text-decoration:none;border-radius:32px;font-size:14px;font-weight:500">Se connecter</a>
    </p>`;
  return { to: args.email, subject: 'Votre compte OncoDigest est activé', html: wrapTemplate(inner) };
}

export function suspensionEmail(args: { fullName: string; email: string; reason?: string }): EmailMessage {
  const inner = `
    <h2 style="font-family:Georgia,serif;font-weight:300;margin:0 0 16px;font-size:18px">Votre compte a été désactivé</h2>
    <p style="margin:0 0 8px">Bonjour ${args.fullName},</p>
    <p style="margin:0 0 16px;line-height:1.6">
      L'accès à votre compte OncoDigest a été suspendu.
      ${args.reason ? `Motif : ${args.reason}.` : ''}
    </p>
    <p style="margin:0;line-height:1.6">
      Si vous pensez qu'il s'agit d'une erreur, contactez-nous à
      <a href="mailto:contact@oncodigestnews.com">contact@oncodigestnews.com</a>.
    </p>`;
  return { to: args.email, subject: 'OncoDigest — Compte suspendu', html: wrapTemplate(inner) };
}
