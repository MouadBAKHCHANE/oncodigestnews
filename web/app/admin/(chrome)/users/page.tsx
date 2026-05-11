import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth';
import { UserActions } from './UserActions';
import styles from './users.module.css';

export const metadata = { title: 'Utilisateurs — Admin' };
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
  const admin = await requireAdmin();
  const sp = await searchParams;
  const tab = sp.tab ?? 'pending';

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: profiles, error: queryError } = await adminClient
    .from('profiles')
    .select(
      'id, email, full_name, specialty, hospital, rpps_number, status, role, created_at, approved_at',
    )
    .eq('status', tab)
    .order('created_at', { ascending: false });

  if (queryError) {
    console.error('[admin/users] query error:', queryError.message);
  }

  const list = (profiles ?? []) as ProfileRow[];

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Utilisateurs</h1>
        <nav className={styles.subtabs}>
          <SubTab href="?tab=pending" current={tab} value="pending">
            En attente
          </SubTab>
          <SubTab href="?tab=approved" current={tab} value="approved">
            Approuvés
          </SubTab>
          <SubTab href="?tab=revoked" current={tab} value="revoked">
            Révoqués
          </SubTab>
        </nav>
      </header>

      {list.length === 0 ? (
        <p className={styles.empty}>Aucun utilisateur dans cet onglet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Profession</th>
              <th>Hôpital</th>
              <th>RPPS</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td data-label="Nom">
                  {p.full_name}
                  {p.role === 'admin' ? <span className={styles.adminTag}>admin</span> : null}
                </td>
                <td data-label="Email">{p.email}</td>
                <td data-label="Profession">{p.specialty ?? '—'}</td>
                <td data-label="Hôpital">{p.hospital ?? '—'}</td>
                <td data-label="RPPS">{p.rpps_number ?? '—'}</td>
                <td data-label="Créé le">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                <td data-label="Actions">
                  <UserActions
                    profileId={p.id}
                    status={p.status}
                    isCurrentUser={p.id === admin.id}
                    isAdmin={p.role === 'admin'}
                  />
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
    <a
      href={href}
      className={active ? `${styles.subtab} ${styles.subtabActive}` : styles.subtab}
    >
      {children}
    </a>
  );
}
