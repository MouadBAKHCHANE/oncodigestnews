import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { AdminTopNav } from './AdminTopNav';
import styles from './admin.module.css';

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
            <Logo size={26} />
            <span className={styles.brandTag}>admin</span>
          </Link>
          <AdminTopNav />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
