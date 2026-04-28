'use client';

/**
 * Sanity Studio embedded at /admin/studio.
 * The catch-all `[[...tool]]` segment is required by next-sanity so Studio
 * can handle its own internal routing (vision, structure, presentation, etc.).
 *
 * Access control is layered:
 *   - Next.js middleware ensures only admins (Supabase role='admin') reach this route.
 *   - Sanity Studio then enforces its own login (Sanity account required).
 */

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
