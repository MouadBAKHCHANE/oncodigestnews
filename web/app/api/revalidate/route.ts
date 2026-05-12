/**
 * Sanity → Next.js on-demand revalidation endpoint.
 *
 * Sanity is configured to POST to this route on every Publish/Unpublish.
 * We verify the HMAC signature against SANITY_REVALIDATE_SECRET, then call
 * revalidatePath() for the affected page(s) based on the published document
 * type and slug. Result: edits go live within ~2 s of clicking Publish.
 *
 * Webhook configuration (Sanity Manage → API → Webhooks):
 *   - URL: https://www.oncodigestnews.ma/api/revalidate
 *   - Trigger on: Create, Update, Delete
 *   - Filter (GROQ): _type in [
 *       "article","scientificArticle","video","live","congress",
 *       "advisor","author","category","partner","faq","siteSettings"
 *     ]
 *   - Projection: {_type, "slug": slug.current}
 *   - Secret: same value as SANITY_REVALIDATE_SECRET env var on Vercel
 */

import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';
import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

interface SanityWebhookPayload {
  _type?: string;
  slug?: string | null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error('[revalidate] SANITY_REVALIDATE_SECRET not set');
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured' },
      { status: 500 },
    );
  }

  const signature = req.headers.get(SIGNATURE_HEADER_NAME);
  const rawBody = await req.text();

  if (!signature || !(await isValidSignature(rawBody, signature, secret))) {
    return NextResponse.json(
      { ok: false, error: 'Invalid signature' },
      { status: 401 },
    );
  }

  let payload: SanityWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SanityWebhookPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const paths = pathsForDocument(payload._type, payload.slug ?? null);
  for (const p of paths) {
    revalidatePath(p);
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}

/** Map a Sanity document type → the site paths that should be busted. */
function pathsForDocument(
  type: string | undefined,
  slug: string | null,
): string[] {
  const paths = new Set<string>();
  paths.add('/');

  switch (type) {
    case 'article':
      paths.add('/actualites');
      if (slug) paths.add(`/article/${slug}`);
      break;
    case 'scientificArticle':
      paths.add('/articles-scientifiques');
      if (slug) paths.add(`/articles-scientifiques/${slug}`);
      break;
    case 'video':
      paths.add('/videos');
      if (slug) paths.add(`/videos/${slug}`);
      break;
    case 'live':
      paths.add('/videos');
      break;
    case 'congress':
      paths.add('/congres');
      if (slug) paths.add(`/congres/${slug}`);
      break;
    case 'advisor':
      paths.add('/comite-scientifique');
      paths.add('/a-propos');
      break;
    case 'siteSettings':
    case 'partner':
    case 'faq':
      paths.add('/a-propos');
      break;
    case 'author':
    case 'category':
      // Cross-cutting — refresh all listing pages.
      paths.add('/actualites');
      paths.add('/articles-scientifiques');
      paths.add('/videos');
      paths.add('/congres');
      break;
    default:
      // Unknown type — refresh home only.
      break;
  }

  return [...paths];
}
