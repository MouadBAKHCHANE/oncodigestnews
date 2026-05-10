import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import styles from './admin.module.css';

const NAV = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Utilisateurs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M3 13c.5-2.5 2.5-4 5-4s4.5 1.5 5 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/admin/studio',
    label: 'Contenu',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2.5" y="3" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 6h11M5.5 3v3" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/admin" className={styles.brand} aria-label="Admin — accueil">
            <Logo />
            <span className={styles.brandTag}>admin</span>
          </Link>
          <nav className={styles.nav} aria-label="Navigation admin">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navItem}>
                <span className={styles.navIcon} aria-hidden>
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
