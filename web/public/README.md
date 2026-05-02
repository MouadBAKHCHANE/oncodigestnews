# `web/public/` — static assets

Most visuals on the site are pure-SVG via `components/ui/BrandIllustration.tsx`,
so we don't depend on photos. The two `.jpg` files here are **fallbacks for
the venetian-reveal Promesse section** and the **Hero placeholder**, used
only when `siteSettings.heroImage` is empty in Sanity.

## Replacing the fallback images

Both should be **free-licensed** (CC0 / Unsplash / Pexels) and **show no
identifiable person**. Suggested searches:

- **Unsplash** (https://unsplash.com) — all photos free for commercial use,
  no attribution legally required (we'll credit anyway).
- **Pexels** (https://www.pexels.com) — same terms.

### Recommended search terms

| Slot | Aspect | Search ideas |
|---|---|---|
| `hero-fallback.jpg` | 16:9 landscape, ~1600×900 | "operating room", "surgical lights", "medical technology", "research lab equipment" |
| `promesse-fallback.jpg` | 4:3 portrait-ish, ~1200×1600 | "abstract microscope", "blue medical equipment", "DNA strand" |

### How to swap

1. Download a chosen photo, name it `hero-fallback.jpg` or
   `promesse-fallback.jpg`, drop it into `web/public/` (replace existing).
2. Run `npm run dev` and verify the homepage renders correctly.
3. Even better: upload the real hero image into Sanity Studio at
   📄 Site → Site settings → Hero image. Once set, the fallbacks are
   ignored and the Sanity-CDN image is used (resized via `urlForImage`).

## Files

- `hero-fallback.jpg` — used by `Hero` only when no Sanity hero image
- `promesse-fallback.jpg` — used by `PromesseSection` (venetian-reveal)
- `next.svg`, `vercel.svg`, etc. — Next.js scaffold assets, can be deleted
  once we stop using them
