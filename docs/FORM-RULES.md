# OncoDigest — Form Validation Rules

> Per-field rules for every form. Becomes the source of Zod schemas in `web/lib/forms/schemas.ts`. Copy here is in French to match the existing UI.

Last updated: 2026-04-27

---

## Conventions

### Where validation runs
- **Client-side:** Zod schema via `react-hook-form` + `@hookform/resolvers/zod`. Inline error messages, prevents submit.
- **Server-side:** the same Zod schema, re-run in the server action. Never trust client validation alone.
- **DB-level:** check constraints + unique indexes (defense in depth).

### Error message style
- French, sentence case, no terminal period.
- Specific, not generic: prefer "L'email doit contenir un @" over "Email invalide".
- Field-level shown directly under the input. Form-level shown above the submit button.

### Display behavior
- Error appears on `blur` for the first time, then on every `change` until valid.
- On submit, all errors revealed simultaneously, focus jumps to first invalid field.
- Success state shows a green checkmark icon + success copy, hides the form.

---

## 1. Registration form (`/inscription`)

### Schema

```ts
import { z } from 'zod';

export const registrationSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit faire au moins 2 caractères')
    .max(80, 'Le nom est trop long')
    .trim(),

  prenom: z.string()
    .min(2, 'Le prénom doit faire au moins 2 caractères')
    .max(80, 'Le prénom est trop long')
    .trim(),

  email: z.string()
    .email('Adresse email invalide')
    .max(254, 'Email trop long')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),

  passwordConfirm: z.string(),

  profession: z.enum(
    ['chirurgien', 'oncologue', 'gastro-enterologue', 'interne', 'autre'],
    { errorMap: () => ({ message: 'Veuillez sélectionner une profession' }) }
  ),

  specialite: z.string().max(120).trim().optional(),

  ville: z.string().max(120).trim().optional(),

  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
  }),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm'],
});
```

### Per-field copy

| Field | Required | Rules | Error copy |
|---|---|---|---|
| `nom` | ✅ | 2–80 chars | "Le nom doit faire au moins 2 caractères" |
| `prenom` | ✅ | 2–80 chars | "Le prénom doit faire au moins 2 caractères" |
| `email` | ✅ | Valid email, ≤254 chars, lowercased | "Adresse email invalide" |
| `email` (uniqueness) | ✅ | Unique in `profiles` (server check) | "Cet email est déjà enregistré" |
| `password` | ✅ | 8–128 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit | (see schema, specific per rule) |
| `passwordConfirm` | ✅ | Must match `password` | "Les mots de passe ne correspondent pas" |
| `profession` | ✅ | One of 5 enum values | "Veuillez sélectionner une profession" |
| `specialite` | ❌ | ≤120 chars | "Spécialité trop longue" |
| `ville` | ❌ | ≤120 chars | "Ville trop longue" |
| `acceptTerms` | ✅ | Must be checked | "Vous devez accepter les conditions d'utilisation" |

### Server-side additions
- Reject if `email` already exists in `profiles`.
- Optionally: reject obvious throwaway domains (configurable allowlist later).
- After success: insert into `auth.users` (Supabase) — trigger creates `profiles` row with `status='pending'` and `role='user'`.
- Email all admins via Resend.
- Show success state: "Compte créé avec succès. Vérifiez votre email pour activer votre compte."

### Note on RPPS
The current HTML form does **not** capture the RPPS number (French health professional ID). The owner approves manually based on profession + specialty + email domain.

If RPPS verification becomes required (Phase 2), add:
```ts
rpps: z.string().regex(/^\d{11}$/, 'Le numéro RPPS doit faire 11 chiffres').optional(),
```
…and surface it in the admin Users panel for manual cross-check.

---

## 2. Login form (`/connexion`)

### Schema

```ts
export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
});
```

### Per-field copy

| Field | Required | Rules | Error copy |
|---|---|---|---|
| `email` | ✅ | Valid email | "Adresse email invalide" |
| `password` | ✅ | Non-empty (no length check on login) | "Le mot de passe est requis" |
| `rememberMe` | ❌ | Boolean | n/a |

### Form-level error states

| Cause | Error message |
|---|---|
| Invalid credentials | "Email ou mot de passe incorrect" (deliberate ambiguity — don't reveal which field is wrong) |
| Account revoked | "Votre compte a été désactivé. Contactez-nous si vous pensez qu'il s'agit d'une erreur." |
| Account pending | (no error — login succeeds, redirect to `/account/pending`) |
| Rate-limit hit | "Trop de tentatives. Réessayez dans quelques minutes." |
| Network/server error | "Une erreur est survenue. Réessayez." |

### Rate limiting
- 5 failed attempts per email per 15 minutes → block 15 minutes.
- 20 failed attempts per IP per hour → block 1 hour.
- Implement via Vercel Runtime Cache (key: `login:fail:<emailOrIp>`, ttl 15 min, increment on each fail, reset on success).

### `next` redirect
- Login form accepts `?next=/some/path` query param.
- After successful login, redirect to `next` if same-origin, else to `/`.
- Validate same-origin server-side to prevent open-redirect.

---

## 3. Forgot password (`/connexion`, hidden state)

### Schema

```ts
export const forgotPasswordSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide').toLowerCase().trim(),
});
```

### Behavior
- Always show the same success message regardless of whether the email exists. Don't leak account enumeration.
- Success copy: "Un email de réinitialisation vous a été envoyé."
- Email is sent via Supabase's built-in password recovery flow. Supabase handles the token + reset URL.
- Reset token URL points to `/reset-password?token=...` — a new page to add in Phase 7.

---

## 4. Reset password (`/reset-password`)

(New page — not in current HTML.)

### Schema

```ts
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm'],
});
```

### Behavior
- URL must include valid `?token=...`. Validate token server-side via Supabase before showing the form.
- On success: sign user in automatically, redirect to `/account` (if approved) or `/account/pending`.

---

## 5. Contact form (`/contact`)

### Schema

```ts
export const contactSchema = z.object({
  nom: z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(80).trim(),
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
  sujet: z.enum(['question', 'article', 'partenariat', 'erreur', 'autre']),
  message: z.string()
    .min(10, 'Le message doit faire au moins 10 caractères')
    .max(5000, 'Le message est trop long (max 5000 caractères)')
    .trim(),
});
```

### Per-field copy

| Field | Required | Rules | Error copy |
|---|---|---|---|
| `nom` | ✅ | 2–80 chars | "Le nom doit faire au moins 2 caractères" |
| `email` | ✅ | Valid email | "Adresse email invalide" |
| `sujet` | ✅ (default: `question`) | One of 5 enum values | n/a — pre-selected |
| `message` | ✅ | 10–5000 chars | "Le message doit faire au moins 10 caractères" |

### Server-side
- Send via Resend to `contact@<domain>`.
- Honeypot field (CSS-hidden `<input name="website">`) — if filled, silently drop.
- Rate limit: 3 messages per IP per hour.
- Success copy: "Message envoyé. Nous vous répondrons dans les plus brefs délais."

---

## 6. Newsletter subscription (footer + dedicated CTA section)

### Schema

```ts
export const newsletterSchema = z.object({
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
});
```

### Behavior
- Single field: email.
- v1: just stores email in a Supabase `newsletter_subscribers` table — no email service integration yet (deferred to Phase 2).
- Success copy: "Merci ! Vous êtes inscrit à la newsletter."
- Already subscribed: "Vous êtes déjà inscrit." (idempotent UX)

### Supabase table (add to `0001_users.sql` or separate migration)

```sql
create table public.newsletter_subscribers (
  email       text primary key,
  subscribed_at timestamptz not null default now(),
  source      text,                -- 'footer' | 'cta_section' | 'register' (later)
  unsubscribed_at timestamptz
);
alter table public.newsletter_subscribers enable row level security;
-- Anyone can subscribe (insert), nobody reads except admins
create policy "anyone subscribe" on public.newsletter_subscribers
  for insert with check (true);
create policy "admins read subscribers" on public.newsletter_subscribers
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
```

---

## 7. Account profile (`/account`) — approved users only

### Schema

```ts
export const profileSchema = z.object({
  full_name: z.string().min(2).max(160).trim(),
  specialty: z.string().max(120).trim().optional(),
  hospital: z.string().max(120).trim().optional(),
  rpps_number: z.string().regex(/^\d{11}$/, 'Le numéro RPPS doit faire 11 chiffres').optional(),
});
```

Email is **not** editable in v1 (admin must change it manually in Supabase). Show as a read-only `<div>` with a "Pour changer votre email, contactez-nous" caption.

---

## 8. Search input (`/actualites`, `/articles-scientifiques`)

Not validated as a form. Just:
- Trim input.
- Min 2 chars before triggering filter.
- Debounce 250ms.
- No server submission — purely client-side filtering of already-fetched articles.

---

## Generic UX rules

| Behavior | Implementation |
|---|---|
| Submit during pending request | Disable submit button, show spinner inside button |
| Network failure on submit | Toast: "Erreur réseau. Vérifiez votre connexion et réessayez." |
| Slow request (>2s) | Show inline spinner; never block the entire page |
| Re-submit prevention | Button disabled while `isSubmitting === true` |
| Auto-focus first field on mount | Yes for login, register, forgot-password |
| Auto-focus first error after submit | Yes |
| Preserve form values on validation error | Yes (default react-hook-form behavior) |
| Clear form after success | Yes for contact, newsletter; n/a for login (redirects) |

---

## Locked. Form changes after this point require updating this doc first.
