import Link from 'next/link';
import styles from './admin.module.css';

/**
 * Admin shell — Option A unified Content (Studio) + Users dashboard.
 *
 * Access control: enforced by middleware.ts (admin role required).
 * The Studio sub-route handles its own internal layout, so this layout
 * intentionally does not wrap /admin/studio in the tab chrome — Studio
 * needs full viewport.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          OncoDigest
          <span className={styles.brandTag}>admin</span>
        </Link>
        <nav className={styles.tabs}>
          <Link href="/admin/studio" className={styles.tab}>
            Content
          </Link>
          <Link href="/admin/users" className={styles.tab}>
            Users
          </Link>
        </nav>
        <div className={styles.spacer} />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
