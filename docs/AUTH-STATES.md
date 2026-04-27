# OncoDigest — Auth States

> The full state machine for user authentication, approval workflow, and content access.

Last updated: 2026-04-27

---

## User states

A user is always in exactly one of these states:

| State | Definition | Can log in? | Can read public content? | Can read pro content? | Can access /admin? |
|---|---|---|---|---|---|
| **Anonymous** | Not signed in (no session cookie) | n/a | ✅ | ❌ | ❌ |
| **Pending** | Account created, awaiting admin approval | ✅ (limited) | ✅ | ❌ | ❌ |
| **Approved** | Admin-approved healthcare professional | ✅ | ✅ | ✅ | ❌ |
| **Revoked** | Previously approved, access revoked by admin | ❌ | ✅ (treated as anonymous) | ❌ | ❌ |
| **Admin** | Approved + role='admin' | ✅ | ✅ | ✅ | ✅ |

`role` and `status` are independent fields:
- `status` ∈ {pending, approved, revoked} — controls content access.
- `role` ∈ {user, admin} — controls admin panel access.
- An admin must also have `status = approved`. Setting `role = admin` on a pending user is invalid (enforced by check constraint or app logic).

---

## State transitions

```
              register (form submit)
   Anonymous ──────────────────────────► Pending
                                            │
                                  admin clicks "Approve"
                                            │
                                            ▼
   ┌──────────────────────────────────► Approved ◄────────────────┐
   │                                       │                       │
   │                            admin clicks "Revoke"              │
   │                                       │                       │
   │                                       ▼                       │
   │                                    Revoked                    │
   │                                       │                       │
   │                            admin clicks "Restore"             │
   │                                       │                       │
   │                                       └───────────────────────┘
   │
   └──── (sign out at any point) ──── back to Anonymous (UI only,
                                       account stays in same status)
```

**There is no self-service deletion in v1.** Account removal is an admin action (sets `status = revoked`).

---

## What each state can DO (action matrix)

| Action | Anonymous | Pending | Approved | Revoked | Admin |
|---|---|---|---|---|---|
| Browse public pages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read public articles in full | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read excerpt of pro articles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read body of pro articles | ❌ | ❌ | ✅ | ❌ | ✅ |
| Watch public videos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Watch pro videos | ❌ | ❌ | ✅ | ❌ | ✅ |
| Register for upcoming live | ❌ | ❌ | ✅ | ❌ | ✅ |
| Submit contact form | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subscribe to newsletter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sign in via login form | n/a | ✅ | ✅ | ❌ | ✅ |
| See own account page (`/account`) | ❌ | ✅ | ✅ | ❌ | ✅ |
| See pending status banner | n/a | ✅ | ❌ | n/a | ❌ |
| Edit own profile | ❌ | ❌ | ✅ | ❌ | ✅ |
| Access `/admin` | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve/revoke other users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit content in Sanity Studio | ❌ | ❌ | ❌ | ❌ | ✅ (with Sanity account) |

---

## UI behavior per state

### Anonymous

- Navbar shows: `[Connexion]` `[Inscription]` buttons.
- Pro article page (`/article/[slug]` where article.access === 'pro'):
  - Renders header, cover, excerpt, then **paywall overlay**.
  - Paywall copy:
    > **Cet article est réservé aux professionnels de santé.**
    > [Se connecter] [S'inscrire]
- Pro video card: lock icon overlay; click goes to `/connexion?next=/videos`.
- Live registration button: `[Se connecter pour s'inscrire]` instead of `[S'inscrire]`.

### Pending

- Login allowed but lands on a **status page** instead of the previous URL:
  - Title: "Votre compte est en attente d'approbation"
  - Body: "Votre demande a été reçue le [date]. Notre équipe vérifie votre profil — vous recevrez un email dès l'approbation. Cela prend généralement moins de 48h."
  - Button: `[Se déconnecter]`
- Trying to access pro content while pending: same paywall as anonymous (don't reveal that pending state grants future access — keep the gate consistent).
- A pending user cannot navigate the rest of the site while logged in. They are "soft-locked" on the status page until approved or signed out. (Decision rationale: prevents pending users from clicking around, hitting paywalls, and getting confused.)

### Approved

- Navbar shows: user avatar + dropdown with `[Mon compte]` `[Se déconnecter]`.
- All `access: 'pro'` content readable.
- `/account` page accessible: edit name, RPPS, specialty, hospital. Cannot change email.
- Pro content: no paywall; full body rendered.

### Revoked

- Cannot log in. Login form returns: "Votre compte a été désactivé. Contactez-nous si vous pensez qu'il s'agit d'une erreur."
- If they had an active session when revoked, the next page request signs them out (middleware checks status on every request).
- Treated as Anonymous for content access.

### Admin

- All Approved permissions, plus:
- Navbar shows extra `[Admin]` link → `/admin`.
- `/admin` is accessible. Tab structure:
  - **Content** → embedded Sanity Studio.
  - **Users** → pending + approved tables.
  - **Activity** → (optional, later) approval/login audit log.
- Admin's Sanity Studio access is layered: they need both a Supabase admin role AND a Sanity account. (See MIGRATION.md §4 for the rationale.)

---

## Page-level access enforcement

Every protected page check happens **server-side** in the route handler / RSC:

```ts
// web/app/(site)/article/[slug]/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ArticlePage({ params }) {
  const session = await auth();
  const profile = session?.user
    ? await getProfile(session.user.id)
    : null;

  const canViewPro = profile?.status === 'approved';
  const article = await sanity.fetch(articleQuery(canViewPro), { slug: params.slug });

  if (!article) notFound();

  const isGated = article.access === 'pro' && !canViewPro;
  return <ArticleView article={article} isGated={isGated} session={session} />;
}
```

**Critical rule:** never render gated body in the HTML and hide it with CSS. The body must be **omitted from the GROQ projection** when the user is unauthorized. View Source must not reveal pro content.

---

## Middleware: route protection

`web/middleware.ts`:

```ts
export async function middleware(request: NextRequest) {
  const session = await auth();
  const path = request.nextUrl.pathname;

  // /admin — admin role required
  if (path.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/connexion?next=' + path, request.url));
    const profile = await getProfile(session.user.id);
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/', request.url));
  }

  // /account — any logged-in user
  if (path.startsWith('/account')) {
    if (!session) return NextResponse.redirect(new URL('/connexion?next=' + path, request.url));
  }

  // Pending user soft-lock
  if (session) {
    const profile = await getProfile(session.user.id);
    if (profile?.status === 'pending' && !path.startsWith('/account/pending') && !path.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/account/pending', request.url));
    }
    if (profile?.status === 'revoked') {
      // force sign out
      return NextResponse.redirect(new URL('/api/auth/signout?next=/connexion?revoked=1', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/article/:path*', '/videos/:path*'],
};
```

Note: middleware runs on every matched request. Profile lookups should be cached (60s) to avoid hammering Supabase. Use Vercel Runtime Cache or a per-request memo.

---

## Approval workflow (admin POV)

### Pending list
- `/admin/users` defaults to `?tab=pending`.
- Shows: name, email, RPPS, specialty, hospital, signup date.
- Each row: `[Approve]` `[Reject]` actions.
- Row click expands to show full submitted info + signup IP/UA (audit).

### Approve action (server action)
1. Update `profiles.status = 'approved'`, `approved_at = now()`, `approved_by = admin.id`.
2. Insert `approval_log` row.
3. Send approval email via Resend:
   > Bonjour [name], votre compte OncoDigest a été approuvé. Vous pouvez maintenant vous connecter à oncodigest.com/connexion et accéder à tout le contenu réservé aux professionnels de santé.
4. Revalidate `/admin/users` to refresh the list.

### Reject / revoke action
1. Update `status = 'revoked'`, `revoked_at`, `revoked_by`, optional `revocation_reason`.
2. Insert `approval_log` row.
3. **Optionally** send notification email (admin checkbox in the dialog).
4. If user has an active session, it'll be killed on next request (middleware).

---

## Email notifications

| Event | Recipient | Sender | Template |
|---|---|---|---|
| User registers | All admins | Resend | "New HCP registration: [name] ([RPPS])" with deep link to `/admin/users?id=X` |
| User approved | The user | Resend | Welcome email |
| User revoked | The user (optional) | Resend | "Account suspended" notice |
| Password reset | The user | Supabase | Default Supabase template (customizable later) |

All emails sent from `noreply@<domain>` — `<domain>` to be determined (open question in MIGRATION.md §9).

---

## Session cookie

- Set by Auth.js, signed JWT, httpOnly, secure, samesite=lax.
- Expiry: 30 days, sliding (refreshed on each request).
- Server reads via `auth()` helper. Client reads minimal session state via `useSession()` (only name + role + status — never sensitive fields).

---

## Edge cases

| Case | Behavior |
|---|---|
| User registers with same email twice | Second attempt fails ("Cet email est déjà enregistré") — Supabase enforces unique email |
| Admin tries to approve themselves | UI prevents the button from showing on own row |
| Admin tries to revoke last admin | Server action rejects with "Cannot revoke the last admin" — enforced by query: `count(role='admin') > 1` before allowing revoke |
| Approved user changes email | Not allowed in v1. Admin must do it manually in Supabase. |
| User logs in from second device | Both sessions valid (no single-session policy). |
| Network failure during signup | Profile row may be missing while auth.users exists — handled by the `handle_new_user` trigger (set in DATA-MODEL.md), which is automatic on auth.users insert. |
| Sanity Studio access for non-Supabase-admin | Studio's own login is the gatekeeper; even if someone navigates to /admin/studio they hit Sanity's auth wall. |

---

## What's deliberately NOT in v1

- Email change flow (admin does it manually).
- Account deletion by user (admin sets to revoked instead).
- 2FA (Supabase supports it; defer until first incident).
- Magic link login (initially password only — magic link is Phase 2).
- Social login (Google/LinkedIn) — defer; HCPs prefer email/password.
- Granular permissions per content type (everything is binary: pro or not).
- "Subscribe to author/category" notifications.

These are all easy to add later because the `profiles` table already has the relevant columns and the auth library supports them.

---

## Locked. Auth changes after this point require updating this doc first.
