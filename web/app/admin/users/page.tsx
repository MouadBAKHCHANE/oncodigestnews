import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import styles from './users.module.css';

export const metadata = { title: 'Users — Admin' };
export const dynamic = 'force-dynamic';

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  specialty: string | null;
  hospital: string | null;
  rpps_number: string | null;
  status: 'pending' | 'approved' | 'revoked';
  role: 'user' | 'admin';
  created_at: string;
  approved_at: string | null;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: 'pending' | 'approved' | 'revoked' }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = sp.tab ?? 'pending';

  const supabase = await getSupabaseServerClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, specialty, hospital, rpps_number, status, role, created_at, approved_at')
    .eq('status', tab)
    .order('created_at', { ascending: false });

  const list = (profiles ?? []) as ProfileRow[];

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <nav className={styles.subtabs}>
          <SubTab href="?tab=pending" current={tab} value="pending">Pending</SubTab>
          <SubTab href="?tab=approved" current={tab} value="approved">Approved</SubTab>
          <SubTab href="?tab=revoked" current={tab} value="revoked">Revoked</SubTab>
        </nav>
      </header>

      {list.length === 0 ? (
        <p className={styles.empty}>Aucun utilisateur dans cet onglet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Profession</th>
              <th>Hospital</th>
              <th>RPPS</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name}</td>
                <td>{p.email}</td>
                <td>{p.specialty ?? '—'}</td>
                <td>{p.hospital ?? '—'}</td>
                <td>{p.rpps_number ?? '—'}</td>
                <td>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  {/* Server actions for approve/revoke arrive in Phase 7 */}
                  <span className={styles.placeholder}>Actions in Phase 7</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SubTab({
  href,
  current,
  value,
  children,
}: {
  href: string;
  current: string;
  value: string;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <a href={href} className={active ? `${styles.subtab} ${styles.subtabActive}` : styles.subtab}>
      {children}
    </a>
  );
}
