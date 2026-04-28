/**
 * Site (public-facing) layout.
 *
 * Phase-1 stub: navbar/footer/grain-overlay/page-loader will be added in Phase 3
 * once the layout shell components are ported from the existing HTML.
 *
 * Keeping this file thin so the app boots and the route group is real.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
