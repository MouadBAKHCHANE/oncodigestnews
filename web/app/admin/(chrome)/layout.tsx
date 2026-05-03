import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandName}>OncoDigest</span>
          <span className={styles.brandTag}>admin</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navItem}>
            <span className={styles.navIcon} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            Dashboard
          </Link>
          <Link href="/admin/users" className={styles.navItem}>
            <span className={styles.navIcon} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 13c.5-2.5 2.5-4 5-4s4.5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            Utilisateurs
          </Link>
          <Link href="/admin/studio" className={styles.navItem}>
            <span className={styles.navIcon} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2.5" y="3" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2.5 6h11M5.5 3v3" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            Contenu
          </Link>
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
