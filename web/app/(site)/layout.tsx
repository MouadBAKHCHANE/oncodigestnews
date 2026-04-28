import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/layout/PageLoader';
import { GrainOverlay } from '@/components/layout/GrainOverlay';
import { SiteEffects } from '@/components/layout/SiteEffects';
import styles from './siteLayout.module.css';

/**
 * Public-site shell.
 *
 * Stacking order (bottom → top by z-index):
 *   - body                                               (background transitions on scroll)
 *   - main page content (children)                       (z auto)
 *   - Navbar                                             (z 900, position: fixed)
 *   - mobile menu when open                              (z 1000, fixed)
 *   - PageLoader on first visit                          (z 99999, fixed)
 *   - GrainOverlay                                       (z 9999, fixed, pointer-events: none)
 *
 * The .pageWrapper padding-top reserves space below the fixed navbar.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageLoader />
      <GrainOverlay />
      <Navbar />
      <SiteEffects />
      <div className={styles.pageWrapper}>
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
