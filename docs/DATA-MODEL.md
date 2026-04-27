# OncoDigest — Data Model

> Defines the shape of every content entity (Sanity) and every app entity (Supabase). Component props are derived from these types — change the schema, regenerate types, propagate.

Last updated: 2026-04-27

---

## Overview

| Layer | Storage | Purpose |
|---|---|---|
| Editorial content | **Sanity** | Articles, congress, lives, videos, advisors, partners, FAQ, scientific articles, authors, settings |
| User accounts + auth | **Supabase** | `users`, `approval_log` |
| Sessions | **Supabase Auth** | Built-in; we don't model it |

Sanity is read **server-side** in Next.js using GROQ. Supabase is read both server-side (auth, gating) and client-side (admin actions via server actions only — never direct client → Supabase writes for sensitive ops).

---

## Sanity schemas

All schemas live in `web/sanity/schemas/`. Naming: lowerCamelCase for the `name` property (Sanity convention), file named after the entity.

### Shared field conventions

Every content document has these fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | required, validation: 3–140 chars |
| `slug` | slug | required, source: title, unique, lowercase, max 96 |
| `publishedAt` | datetime | required for publishable types; defaults to now() |
| `access` | string ('public' \| 'pro') | required, default 'public' — controls content gate |
| `excerpt` | array of block | always public (used for cards + paywall preview) |
| `coverImage` | image | hotspot enabled, alt-text required |
| `seo` | object | `metaTitle`, `metaDescription`, `ogImage` (optional) |

**Why `access` lives on the document, not on a `body` block:** simpler mental model for the owner ("this whole article is Pro") and easier to filter in GROQ. If we later need block-level gating, we add a `proContentMarker` block type without breaking existing data.

---

### `article`

The standard editorial article shown on `/actualites` and `/article/[slug]`.

```ts
{
  name: 'article',
  type: 'document',
  title: 'Article',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required().min(3).max(140) },
    { name: 'slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() },
    { name: 'access', type: 'string', options: { list: [
        { title: '🌐 Public', value: 'public' },
        { title: '🔒 Pro (logged-in only)', value: 'pro' },
      ], layout: 'radio' }, initialValue: 'public', validation: Rule => Rule.required() },
    { name: 'category', type: 'reference', to: [{ type: 'category' }], validation: Rule => Rule.required() },
    { name: 'tag', type: 'string' }, // small label like "RECHERCHE" shown on cards
    { name: 'excerpt', type: 'array', of: [{ type: 'block', styles: [{title: 'Normal', value: 'normal'}] }],
      title: 'Public excerpt', description: 'Always visible, used as teaser + paywall preview',
      validation: Rule => Rule.required() },
    { name: 'body', type: 'array', of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' }] },
        { type: 'object', name: 'callout', fields: [
            { name: 'text', type: 'text' },
            { name: 'tone', type: 'string', options: { list: ['info', 'warning', 'highlight'] } },
        ] },
      ], title: 'Body (gated when Access = Pro)' },
    { name: 'coverImage', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' }],
      validation: Rule => Rule.required() },
    { name: 'author', type: 'reference', to: [{ type: 'author' }], validation: Rule => Rule.required() },
    { name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required() },
    { name: 'readingTime', type: 'number', description: 'Minutes (auto-calculated from body, editable)' },
    { name: 'relatedArticles', type: 'array', of: [{ type: 'reference', to: [{ type: 'article' }] }],
      validation: Rule => Rule.max(3) },
    { name: 'seo', type: 'seo' },
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', access: 'access', publishedAt: 'publishedAt' },
    prepare: ({ title, media, access, publishedAt }) => ({
      title: `${access === 'pro' ? '🔒 ' : ''}${title}`,
      subtitle: new Date(publishedAt).toLocaleDateString('fr-FR'),
      media,
    }),
  },
  orderings: [
    { title: 'Published, newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
}
```

**Notes:**
- `tag` is the small label on cards (e.g. "RECHERCHE", "ÉDITORIAL"). `category` is the structural taxonomy used for filters. Two different things.
- `relatedArticles` is manually curated by the owner, max 3. (Future: auto-suggest via Sanity embeddings.)
- `readingTime` defaults from `body` length but is editable so the owner can override.

---

### `scientificArticle`

Shown on `/articles-scientifiques`. Distinct from `article` because the metadata shape is different (DOI, journal, citation, congress affiliation).

```ts
{
  name: 'scientificArticle',
  type: 'document',
  title: 'Scientific Article',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() },
    { name: 'access', type: 'string', options: { list: [
        { title: '🌐 Public', value: 'public' },
        { title: '🔒 Pro', value: 'pro' },
      ], layout: 'radio' }, initialValue: 'public' },
    { name: 'authors', type: 'array', of: [{ type: 'string' }], description: 'Author names as they appear on the paper',
      validation: Rule => Rule.required().min(1) },
    { name: 'journal', type: 'string', description: 'e.g. NEJM, The Lancet Oncology' },
    { name: 'doi', type: 'string', description: 'e.g. 10.1056/NEJMoa2023456' },
    { name: 'externalUrl', type: 'url', description: 'Link to original paper' },
    { name: 'congress', type: 'reference', to: [{ type: 'congress' }],
      description: 'If the article was presented at a congress' },
    { name: 'category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'excerpt', type: 'array', of: [{ type: 'block' }], title: 'Public abstract',
      validation: Rule => Rule.required() },
    { name: 'commentary', type: 'array', of: [{ type: 'block' }],
      title: 'Editorial commentary (gated when Access = Pro)' },
    { name: 'coverImage', type: 'image', options: { hotspot: true } },
    { name: 'publishedAt', type: 'datetime', validation: Rule => Rule.required() },
    { name: 'seo', type: 'seo' },
  ],
}
```

---

### `congress`

Shown on `/congres`. Used as a reference target by `scientificArticle`.

```ts
{
  name: 'congress',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() }, // e.g. "ESMO 2026"
    { name: 'slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() },
    { name: 'shortName', type: 'string', description: 'e.g. ESMO, ASCO, ESCO' },
    { name: 'startDate', type: 'date', validation: Rule => Rule.required() },
    { name: 'endDate', type: 'date', validation: Rule => Rule.required() },
    { name: 'location', type: 'object', fields: [
        { name: 'city', type: 'string' },
        { name: 'country', type: 'string' },
    ] },
    { name: 'website', type: 'url' },
    { name: 'coverImage', type: 'image', options: { hotspot: true } },
    { name: 'summary', type: 'array', of: [{ type: 'block' }], title: 'Public summary' },
    { name: 'highlights', type: 'array', of: [{ type: 'block' }], title: 'Pro highlights (gated)' },
    { name: 'access', type: 'string', options: { list: ['public', 'pro'], layout: 'radio' }, initialValue: 'public' },
    { name: 'isFeatured', type: 'boolean', description: 'Show in featured slot on /congres', initialValue: false },
  ],
  orderings: [
    { title: 'Start date, soonest first', name: 'startAsc', by: [{ field: 'startDate', direction: 'asc' }] },
  ],
}
```

---

### `live`

Used by the **lives calendar** on `/videos`. Distinct from `video` because lives are scheduled future events, videos are recorded and watchable.

```ts
{
  name: 'live',
  type: 'document',
  title: 'Live event',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'startsAt', type: 'datetime', validation: Rule => Rule.required(),
      description: 'Date AND time the live starts (Europe/Paris)' },
    { name: 'durationMinutes', type: 'number', initialValue: 60 },
    { name: 'speakers', type: 'array', of: [{ type: 'reference', to: [{ type: 'advisor' }, { type: 'author' }] }],
      validation: Rule => Rule.min(1) },
    { name: 'description', type: 'array', of: [{ type: 'block' }] },
    { name: 'registrationUrl', type: 'url', description: 'External link to register (Zoom, Teams, etc.)' },
    { name: 'replayVideo', type: 'reference', to: [{ type: 'video' }],
      description: 'Set after the live ends, links to the recording' },
    { name: 'access', type: 'string', options: { list: ['public', 'pro'], layout: 'radio' }, initialValue: 'pro' },
  ],
  orderings: [
    { title: 'Upcoming first', name: 'startsAtAsc', by: [{ field: 'startsAt', direction: 'asc' }] },
  ],
}
```

**Calendar logic:** the `/videos` page queries `*[_type == "live" && startsAt >= $monthStart && startsAt < $monthEnd]` to populate the calendar grid. Days with at least one live get a canary-300 dot.

---

### `video`

Recorded videos shown in the grid on `/videos`.

```ts
{
  name: 'video',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'array', of: [{ type: 'block' }] },
    { name: 'thumbnail', type: 'image', options: { hotspot: true }, validation: Rule => Rule.required() },
    { name: 'videoUrl', type: 'url', description: 'YouTube, Vimeo, or direct mp4',
      validation: Rule => Rule.required() },
    { name: 'durationSeconds', type: 'number', validation: Rule => Rule.required() },
    { name: 'category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'speakers', type: 'array', of: [{ type: 'reference', to: [{ type: 'advisor' }, { type: 'author' }] }] },
    { name: 'publishedAt', type: 'datetime', validation: Rule => Rule.required() },
    { name: 'access', type: 'string', options: { list: ['public', 'pro'], layout: 'radio' }, initialValue: 'public' },
  ],
}
```

---

### `advisor`

Members of the comité scientifique. Used on `/a-propos` and the homepage advisor stack.

```ts
{
  name: 'advisor',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: Rule => Rule.required() }, // "Dr. Mohammed Amal Benzakour"
    { name: 'slug', type: 'slug', options: { source: 'name' } },
    { name: 'role', type: 'string', validation: Rule => Rule.required() }, // "Chirurgien Viscéral, Digestif & Robotique"
    { name: 'institution', type: 'string' },
    { name: 'photo', type: 'image', options: { hotspot: true }, validation: Rule => Rule.required() },
    { name: 'bio', type: 'array', of: [{ type: 'block' }] },
    { name: 'quote', type: 'text', description: 'Pull-quote shown on the advisor card' },
    { name: 'specialties', type: 'array', of: [{ type: 'string' }] },
    { name: 'links', type: 'object', fields: [
        { name: 'linkedin', type: 'url' },
        { name: 'website', type: 'url' },
    ] },
    { name: 'order', type: 'number', description: 'Display order on the homepage stack' },
    { name: 'isFounder', type: 'boolean', initialValue: false,
      description: 'Founders are featured on the About page' },
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
}
```

---

### `author`

Author of a written piece (article, scientific article). Distinct from `advisor` because not every author is on the comité, and not every advisor writes articles.

```ts
{
  name: 'author',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'name' } },
    { name: 'role', type: 'string' },
    { name: 'photo', type: 'image', options: { hotspot: true } },
    { name: 'bio', type: 'array', of: [{ type: 'block' }] },
    { name: 'links', type: 'object', fields: [
        { name: 'linkedin', type: 'url' },
        { name: 'twitter', type: 'url' },
    ] },
  ],
}
```

---

### `partner`

Logos shown in the partners carousel on the homepage.

```ts
{
  name: 'partner',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: Rule => Rule.required() },
    { name: 'logo', type: 'image', validation: Rule => Rule.required(),
      description: 'SVG or transparent PNG, monochrome preferred' },
    { name: 'website', type: 'url' },
    { name: 'order', type: 'number' },
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
}
```

---

### `faq`

FAQ items on the homepage.

```ts
{
  name: 'faq',
  type: 'document',
  fields: [
    { name: 'question', type: 'string', validation: Rule => Rule.required() },
    { name: 'answer', type: 'array', of: [{ type: 'block' }], validation: Rule => Rule.required() },
    { name: 'order', type: 'number' },
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
}
```

---

### `category`

Taxonomy used by article filters and scientific article congress filters.

```ts
{
  name: 'category',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'context', type: 'string', options: { list: [
        { title: 'Article', value: 'article' },
        { title: 'Scientific article', value: 'scientific' },
        { title: 'Video', value: 'video' },
    ] }, description: 'Which content type this category applies to' },
  ],
}
```

---

### `siteSettings` (singleton)

Site-wide editorial content the owner can change without a deploy: legal text, contact info, footer links, hero typewriter words.

```ts
{
  name: 'siteSettings',
  type: 'document',
  __experimental_actions: ['update', 'publish'], // singleton — no create/delete
  fields: [
    { name: 'siteName', type: 'string', initialValue: 'OncoDigest' },
    { name: 'tagline', type: 'string' },
    { name: 'heroTypewriterWords', type: 'array', of: [{ type: 'string' }],
      description: 'Words cycled in the hero typewriter' },
    { name: 'heroImage', type: 'image', options: { hotspot: true } },
    { name: 'heroOverlay', type: 'object', fields: [
        { name: 'name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'ctaText', type: 'string' },
        { name: 'ctaHref', type: 'string' },
    ] },
    { name: 'contact', type: 'object', fields: [
        { name: 'email', type: 'string' },
        { name: 'address', type: 'text' },
        { name: 'phone', type: 'string' },
    ] },
    { name: 'social', type: 'object', fields: [
        { name: 'linkedin', type: 'url' },
        { name: 'twitter', type: 'url' },
        { name: 'youtube', type: 'url' },
    ] },
    { name: 'legalText', type: 'array', of: [{ type: 'block' }],
      title: 'Mentions légales (full text)' },
    { name: 'privacyText', type: 'array', of: [{ type: 'block' }],
      title: 'Politique de confidentialité (full text)' },
  ],
}
```

---

### Reusable object types (not documents)

#### `seo`

Used by every page-level document.

```ts
{
  name: 'seo',
  type: 'object',
  fields: [
    { name: 'metaTitle', type: 'string', validation: Rule => Rule.max(60) },
    { name: 'metaDescription', type: 'string', validation: Rule => Rule.max(160) },
    { name: 'ogImage', type: 'image' },
    { name: 'noindex', type: 'boolean', initialValue: false },
  ],
}
```

---

## Studio sidebar structure

In `web/sanity/structure.ts`:

```ts
export const structure = (S) =>
  S.list().title('Content').items([
    S.listItem().title('📰 Editorial').child(
      S.list().title('Editorial').items([
        S.documentTypeListItem('article').title('Articles'),
        S.documentTypeListItem('scientificArticle').title('Scientific articles'),
        S.documentTypeListItem('congress').title('Congress'),
        S.documentTypeListItem('video').title('Videos'),
        S.documentTypeListItem('live').title('Lives'),
      ])
    ),
    S.listItem().title('👥 People').child(
      S.list().title('People').items([
        S.documentTypeListItem('advisor').title('Advisors (comité)'),
        S.documentTypeListItem('author').title('Authors'),
        S.documentTypeListItem('partner').title('Partners'),
      ])
    ),
    S.listItem().title('📄 Site').child(
      S.list().title('Site').items([
        S.documentTypeListItem('faq').title('FAQ'),
        S.documentTypeListItem('category').title('Categories'),
        S.listItem().title('Site settings').child(
          S.editor().id('siteSettings').schemaType('siteSettings').documentId('siteSettings')
        ),
      ])
    ),
  ]);
```

---

## Supabase schema

Single migration `supabase/migrations/0001_users.sql`:

```sql
-- Profile table extending Supabase auth.users
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  full_name       text not null,
  rpps_number     text,                       -- French health pro ID, optional but expected
  specialty       text,
  hospital        text,
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'revoked')),
  role            text not null default 'user'
                    check (role in ('user', 'admin')),
  created_at      timestamptz not null default now(),
  approved_at     timestamptz,
  approved_by     uuid references public.profiles(id),
  revoked_at      timestamptz,
  revoked_by      uuid references public.profiles(id),
  revocation_reason text
);

-- Audit log for approval/revocation actions
create table public.approval_log (
  id          bigserial primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  action      text not null check (action in ('approve', 'revoke', 'reset_to_pending')),
  actor_id    uuid not null references public.profiles(id),
  reason      text,
  created_at  timestamptz not null default now()
);

create index profiles_status_idx on public.profiles(status);
create index profiles_role_idx on public.profiles(role);
create index approval_log_profile_idx on public.approval_log(profile_id);

-- Row-level security
alter table public.profiles enable row level security;
alter table public.approval_log enable row level security;

-- Users can read their own profile
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Admins can read all profiles
create policy "admins read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admins can update any profile (approve/revoke)
create policy "admins update profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Users can insert their own profile (during signup)
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Approval log: admins read all, users read their own
create policy "admins read all logs" on public.approval_log
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "users read own logs" on public.approval_log
  for select using (profile_id = auth.uid());

-- Only admins can insert approval log entries
create policy "admins insert logs" on public.approval_log
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Trigger: auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Why a separate `profiles` table instead of using `auth.users` directly
- Supabase's `auth.users` is managed by the auth system; you don't write to it directly.
- All app-specific fields (status, role, RPPS, etc.) live in `profiles`.
- Standard Supabase pattern.

---

## TypeScript types

### Sanity types
Generated by `sanity typegen generate` after deploying schema. Output: `web/lib/sanity/types.ts`. Import as:
```ts
import type { Article, Congress, Advisor } from '@/lib/sanity/types';
```

### Supabase types
Generated by `supabase gen types typescript --project-id <id> > web/lib/supabase/types.ts`. Import as:
```ts
import type { Database } from '@/lib/supabase/types';
type Profile = Database['public']['Tables']['profiles']['Row'];
```

Both type-gen commands run in CI on main branch updates and in `pnpm dev` setup.

---

## Common GROQ queries

Centralized in `web/lib/sanity/queries.ts`:

```ts
// Homepage payload — one fetch, everything needed
export const homepageQuery = `{
  "settings": *[_type == "siteSettings"][0],
  "advisors": *[_type == "advisor"] | order(order asc),
  "partners": *[_type == "partner"] | order(order asc),
  "faqs": *[_type == "faq"] | order(order asc),
  "latestArticles": *[_type == "article"] | order(publishedAt desc)[0...6] {
    title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
    "category": category->{title, slug},
    "author": author->{name, photo}
  }
}`;

// Article detail — projection includes body ONLY if user is approved
export const articleQuery = (canViewPro: boolean) => `*[_type == "article" && slug.current == $slug][0]{
  title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
  "category": category->{title, slug},
  "author": author->{name, photo, role, bio},
  ${canViewPro ? 'body,' : ''}
  "relatedArticles": relatedArticles[]->{title, slug, coverImage, publishedAt, "category": category->title}
}`;

// Lives calendar for a given month
export const livesByMonthQuery = `*[_type == "live" && startsAt >= $monthStart && startsAt < $monthEnd] | order(startsAt asc)`;
```

The `canViewPro` projection is the security primitive: an unauthenticated request never serializes `body` into the HTML response.

---

## Migration of existing HTML content

**Do not copy by hand.** Write a one-shot script in `scripts/import-from-html.ts`:

1. Parse each existing HTML file (cheerio).
2. Extract title, body, images, dates by selector.
3. Upload images to Sanity asset CDN.
4. Build NDJSON file conforming to schema.
5. Import via `sanity dataset import`.

Owner reviews + corrects in Studio after import. Faster than copy-paste, and reproducible if the import logic changes.

---

## Locked. Schema changes after this point require updating this doc first.
