/**
 * Studio-specific layout. Hosts the metadata + viewport exports that
 * next-sanity wants applied to the Studio document, and intentionally
 * does NOT inherit the /admin tab chrome — Studio renders full-viewport.
 */

export { metadata, viewport } from 'next-sanity/studio';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
