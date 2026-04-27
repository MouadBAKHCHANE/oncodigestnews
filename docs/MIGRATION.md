# OncoDigest — Migration Plan (HTML → React)

> **Single source of truth for the port.** Anything that contradicts this doc is wrong unless this doc is updated first.

Last updated: 2026-04-27

---

## 1. Goals & non-goals

### Goals
- **Pixel-exact** parity with the existing static HTML site at all 5 breakpoints (1440 / 1024 / 768 / 480 / 390).
- **Animation-exact** parity for every scroll, hover, and time-driven animation cataloged in `PHASE-1-STATE-CATALOG.md`.
- Replace hardcoded HTML content with a CMS the project owner can edit.
- Add real authentication and a content gate for "Pro" articles, with admin approval of new HCP signups.
- Stay on **free tiers** for as long as possible.

### Non-goals (for v1)
- No payment integration (paywall is a content gate only — payment handled outside the platform).
- No mobile app.
- No analytics dashboard / vanity stats.
- No rebuild of the visual design — the existing HTML *is* the design spec.

---

## 2. Stack — locked decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 16 App Router** | Vercel-native, SSR for SEO, file-based routes map cleanly to the 12 pages |
| Language | **TypeScript** strict mode | |
| Styling | **CSS Modules + global tokens.css** | Existing CSS uses precise px values + custom cubic-beziers; Tailwind would force rewrites and risk drift |
| Animations | **Custom hooks porting existing imperative JS** (no Framer Motion) | Preserves exact timing/easing of bespoke scroll/parallax logic |
| Content CMS | **Sanity** (free tier) | Editorial workflow, rich text, media library, draft/publish, scheduling |
| User auth + DB | **Supabase** (free tier) | Auth + Postgres + RLS, free 50k MAU |
| Auth library | **Auth.js (NextAuth) v5** with Supabase adapter | Free, App-Router-native, magic-link friendly |
| Email | **Resend** (free 3k/mo) | Approval/welcome emails |
| Image hosting | `next/image` + Sanity image loader | Free responsive sizing, LCP optimization |
| Deploy | **Vercel Hobby** (assuming non-commercial; Pro $20/mo if monetized) | |
| Forms | **react-hook-form + Zod** | Validation rules from `FORM-RULES.md` |
| Component primitives | **shadcn/ui** (selectively, only for admin DataTable / Dialog / Toast) | Public site stays bespoke; admin reuses primitives |

### What we considered and rejected
- **Tailwind CSS** — would require rewriting every CSS rule; risk of visual drift. CSS Modules let us copy CSS verbatim.
- **Framer Motion / GSAP** — would require re-implementing scroll-driven sequences in their idiom; risk of timing drift. Porting raw JS into hooks preserves the original.
- **Clerk** — overkill for a non-paying, approval-gated user base. Auth.js + Supabase is free and sufficient.
- **Storybook** — too much setup for a one-shot port. Use a `/dev` route inside the app instead.
- **Custom CMS in Postgres** — would re-implement Sanity Studio. Not worth 3+ weeks of work.

---

## 3. Repo layout

```
d:\Downloads\oncodigest\
├── (HTML files at root — KEEP as visual-diff reference until parity verified)
├── data/                        (existing assets, referenced from HTML)
├── docs/                        (planning + spec)
│   ├── MIGRATION.md             ← this file
│   ├── DATA-MODEL.md            ← Sanity schemas + Supabase tables
│   ├── AUTH-STATES.md           ← logged-out / pending / approved / admin matrix
│   ├── FORM-RULES.md            ← per-field validation
│   ├── PHASE-1-STATE-CATALOG.md ← visual states (existing)
│   └── EXTRACTION-PROCESS.md    ← extraction methodology (existing)
├── web/                         ← Next.js 16 app + embedded Sanity Studio
│   ├── app/
│   │   ├── (site)/              route group — public site
│   │   │   ├── layout.tsx       (navbar/footer/grain/loader)
│   │   │   ├── page.tsx         homepage
│   │   │   ├── a-propos/page.tsx
│   │   │   ├── actualites/page.tsx
│   │   │   ├── article/[slug]/page.tsx
│   │   │   ├── articles-scientifiques/page.tsx
│   │   │   ├── congres/page.tsx
│   │   │   ├── videos/page.tsx
│   │   │   ├── connexion/page.tsx
│   │   │   ├── inscription/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── mentions-legales/page.tsx
│   │   │   └── politique-de-confidentialite/page.tsx
│   │   ├── admin/               unified admin (Option A)
│   │   │   ├── layout.tsx       admin shell with top tabs
│   │   │   ├── page.tsx         redirects to /admin/users by default
│   │   │   ├── studio/[[...tool]]/page.tsx  Sanity Studio mount
│   │   │   ├── users/
│   │   │   │   ├── page.tsx     pending + approved tables
│   │   │   │   └── actions.ts   server actions (approve/revoke)
│   │   │   └── activity/page.tsx (optional, later)
│   │   ├── account/             logged-in user's own profile
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── revalidate/route.ts (Sanity webhook)
│   │   └── dev/                 component playground (dev-only, gitignored)
│   ├── components/
│   │   ├── layout/              Navbar, Footer, PageLoader, GrainOverlay
│   │   ├── ui/                  Button, Input, Checkbox, Select, FilterPills
│   │   ├── cards/               JournalCard, ArticleCard, CongressCard, VideoCard
│   │   ├── home/                Hero, Promesse (venetian), Expertise, Advisors, CTA, FAQ
│   │   └── admin/               UserTable, ApprovalDialog
│   ├── lib/
│   │   ├── hooks/               useMagneticButton, useHeroParallax, useVenetianReveal,
│   │   │                         useAdvisorPeel, useWordReveal, useScrollBackground,
│   │   │                         useReducedMotion, useAnimateOnScroll
│   │   ├── sanity/              client.ts, image.ts, queries.ts
│   │   ├── supabase/            server.ts, client.ts, types.ts (generated)
│   │   ├── auth.ts              Auth.js config
│   │   └── email.ts             Resend client + templates
│   ├── sanity/
│   │   ├── sanity.config.ts     Studio config (basePath: '/admin/studio')
│   │   ├── structure.ts         Studio sidebar grouping
│   │   └── schemas/
│   │       ├── article.ts
│   │       ├── scientificArticle.ts
│   │       ├── congress.ts
│   │       ├── video.ts
│   │       ├── live.ts
│   │       ├── advisor.ts
│   │       ├── partner.ts
│   │       ├── faq.ts
│   │       ├── author.ts
│   │       └── settings.ts      site-wide settings (legal text, etc.)
│   ├── styles/
│   │   ├── globals.css          reset + body bg transition + grain
│   │   └── tokens.css           color/font/easing CSS custom properties
│   ├── public/                  static assets (favicons, fonts, OG images)
│   ├── package.json
│   ├── next.config.ts
│   ├── vercel.ts                project config
│   ├── tsconfig.json
│   └── .env.local.example
├── supabase/
│   ├── migrations/
│   │   └── 0001_users.sql
│   └── config.toml
└── README.md
```

### Why a single `web/` folder (not a Turborepo)
- One Next.js app with embedded Studio = one deployment, one set of env vars, one auth session shared across `/site`, `/admin`, and Studio.
- Turborepo adds complexity not justified for a single-app project.
- If we ever need a separate marketing site or mobile app, we promote to Turborepo then.

---

## 4. Admin: unified Studio + Users (Option A)

The owner sees **one URL** (`oncodigest.com/admin`) with tabs:

```
┌─ /admin ────────────────────────────────────────────────┐
│  [ Content (Studio) ]  [ Users ]  [ Activity ]   ⚙ ▾    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  (active tab content here)                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- **Content tab** → embeds Sanity Studio at `/admin/studio` via Studio's `basePath` config.
- **Users tab** → custom UI at `/admin/users`, lists Supabase users with approve/revoke actions.
- **Activity tab** → optional later, login audit log.

**Access control:** all `/admin/*` routes are protected by Next.js middleware. Only Supabase users with `role = 'admin'` can enter. Sanity Studio has its own auth (Sanity account) layered on top — admins log into both.

> *Why two logins for admin (Supabase + Sanity)?* Studio's auth is non-negotiable; Sanity manages collaboration/permissions on the content side. The Supabase check is only the "can you access /admin at all" gate. Trade-off accepted to stay on free tiers.

---

## 5. Phasing & timeline

| Phase | Deliverable | Days |
|---|---|---|
| **0** | Planning docs locked (`MIGRATION.md`, `DATA-MODEL.md`, `AUTH-STATES.md`, `FORM-RULES.md`) | 1 |
| **1** | Next.js scaffold + Sanity Studio embedded + Supabase wired + Auth.js working | 2 |
| **2** | Sanity schemas defined + content seed script | 2 |
| **3** | Tokens extracted, global CSS, layout shell (navbar/footer/loader/grain) | 2 |
| **4** | Component library port (buttons, cards, accordions, forms, calendar) | 4 |
| **5** | Hard animations (hero parallax, venetian, advisor peel, CTA) | 3 |
| **6** | Page port × 12 (in complexity order) | 10 |
| **7** | Admin Users UI + approval emails + content gate enforcement | 2 |
| **8** | Visual regression (Playwright screenshots vs HTML), animation diff, a11y, Lighthouse | 2 |
| **9** | Cutover (deploy, DNS, archive HTML) | 0.5 |
| **Total** |  | **~28 days for one person** |

Phases 2/3 can run in parallel after Phase 1; Phase 4/5 can run in parallel after Phase 3.

---

## 6. Acceptance criteria

A page is "done" only when **all** of the following are true:

1. Side-by-side screenshot diff vs the HTML version is visually identical at 1440 / 1024 / 768 / 390 widths.
2. Every animation in `PHASE-1-STATE-CATALOG.md` for that page plays with matching duration, easing, and trigger.
3. `pnpm typecheck` passes.
4. `pnpm test` (Playwright visual + interaction) passes.
5. Lighthouse Performance, Accessibility, Best Practices, SEO ≥ 90 on production build.
6. Reduced-motion preference fully respected (no animations playing).
7. Keyboard navigation + screen reader (NVDA/VoiceOver) usable for all interactive elements.

---

## 7. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Animation timing drift after React port | High | Medium | Port imperative JS into hooks verbatim, side-by-side video diff in Phase 8 |
| Sanity free-tier API limit hit during dev | Medium | Low | Use Sanity preview API + local dataset for dev; CDN for prod |
| Supabase project pause after 7 days inactivity | Medium | Low | Cron-trigger a heartbeat query weekly during dev hiatus |
| Vercel Hobby commercial-use clause | High if monetized | High | Confirm with owner; budget $20/mo for Pro if sponsors involved |
| Hydration mismatch from scroll-driven animations | Medium | Medium | Gate all scroll/IO hooks behind `isMounted` state |
| Content migration grunt work | High | Medium | Write one-shot script (HTML → Sanity NDJSON import); never copy by hand |
| Schema changes after pages built | Medium | High | Lock `DATA-MODEL.md` before Phase 4; any schema change requires doc update |

---

## 8. Definition of done — the project as a whole

- Old HTML site archived to a subdomain or branch.
- New React app deployed to production domain.
- Owner has trained on Sanity Studio (1-hour walkthrough recorded).
- Owner has approved 1 test user end-to-end (signup → admin approval → login → access pro article).
- All 12 pages pass acceptance criteria above.
- README.md in repo root describes how to run dev, deploy, and add new content types.

---

## 9. Open questions

- **Domain & branding:** new repo is `oncodigestnews` — is the production domain still `oncodigest.com` or a new one?
- **Existing Sanity org:** does the owner already have a Sanity account, or do we create a new project under your org?
- **Resend domain verification:** what email domain will approval emails come from?
- **Sponsor/commercial use:** does the site take any sponsor money? Determines Vercel Hobby vs Pro.
- **HCP verification:** RPPS number is captured at signup — does the owner verify it manually (visual inspection) or against a public registry?

These don't block Phase 0/1 but should be answered before Phase 7 (admin/auth wiring).
