'use client';

/**
 * Sanity Studio embedded at /admin/studio.
 * The catch-all `[[...tool]]` segment lets Studio handle its own internal
 * routing (vision, structure, presentation, etc.).
 *
 * Access control note: in Phase 1 we bypass the Supabase admin gate for this
 * route (proxy.ts) and rely on Studio's own Sanity-account login. Once the
 * /connexion page exists in Phase 6, the Supabase gate is restored as
 * defense-in-depth.
 */

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
