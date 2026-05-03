import Link from 'next/link';
import styles from './admin.module.css';

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
          <Link href="/admin" className={styles.tab}>
            Dashboard
          </Link>
          <Link href="/admin/users" className={styles.tab}>
            Utilisateurs
          </Link>
          <Link href="/admin/studio" className={styles.tab}>
            Contenu
          </Link>
        </nav>
        <div className={styles.spacer} />
        <Link href="/dashboard" className={styles.exitBtn}>
          ← Espace Pro
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
