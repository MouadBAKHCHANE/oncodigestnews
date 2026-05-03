import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { sanityClient } from '@/lib/sanity/client';
import { requireAdmin } from '@/lib/auth';
import { QuickApproveButton } from './QuickApproveButton';
import styles from './overview.module.css';

export const metadata = { title: 'Vue d\'ensemble — Admin' };
export const dynamic = 'force-dynamic';

interface RecentSignup {
  id: string;
  email: string;
  full_name: string;
  specialty: string | null;
  hospital: string | null;
  created_at: string;
}

interface RecentArticle {
  _id: string;
  title: string;
  publishedAt: string;
  access: 'public' | 'pro';
  slug?: { current: string };
}

interface SanityCounts {
  articles: number;
  videos: number;
  congress: number;
  evenements: number;
  recent: RecentArticle[];
}

const sanityQuery = /* groq */ `{
  "articles": count(*[_type == "article"]),
  "videos": count(*[_type == "video"]),
  "congress": count(*[_type == "congress"]),
  "evenements": count(*[_type == "evenement"]),
  "recent": *[_type == "article"] | order(publishedAt desc)[0...5] {
    _id, title, publishedAt, access, slug
  }
}`;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export default async function AdminOverviewPage() {
  const me = await requireAdmin();
  const db = adminClient();

  const [
    { count: totalUsers },
    { count: pendingCount },
    { count: approvedCount },
    { count: revokedCount },
    { data: recentSignups },
    { count: newsletterCount },
    sanityData,
  ] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'revoked'),
    db
      .from('profiles')
      .select('id, email, full_name, specialty, hospital, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    sanityClient.fetch<SanityCounts>(sanityQuery),
  ]);

  const recent = (recentSignups ?? []) as RecentSignup[];
  const firstName = me.full_name.split(' ')[0];

  return (
    <div className={styles.wrap}>

      {/* ── Greeting ── */}
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Tableau de bord administrateur</p>
          <h1 className={styles.heading}>
            Bonjour, <em>{firstName}</em>.
          </h1>
        </div>
        {(pendingCount ?? 0) > 0 && (
          <div className={styles.alert}>
            <span className={styles.alertDot} aria-hidden />
            <span>
              <strong>{pendingCount}</strong> demande{(pendingCount ?? 0) > 1 ? 's' : ''} en attente
            </span>
            <Link href="/admin/users?tab=pending" className={styles.alertLink}>
              Examiner →
            </Link>
          </div>
        )}
      </header>

      {/* ── Stats grid ── */}
      <section className={styles.statsGrid}>
        <StatCard
          label="Utilisateurs total"
          value={totalUsers ?? 0}
          href="/admin/users?tab=approved"
        />
        <StatCard
          label="En attente"
          value={pendingCount ?? 0}
          href="/admin/users?tab=pending"
          accent={(pendingCount ?? 0) > 0 ? 'warn' : undefined}
        />
        <StatCard
          label="Approuvés"
          value={approvedCount ?? 0}
          href="/admin/users?tab=approved"
        />
        <StatCard
          label="Révoqués"
          value={revokedCount ?? 0}
          href="/admin/users?tab=revoked"
        />
      </section>

      {/* ── Two-column: Recent signups + Recent articles ── */}
      <div className={styles.twoCol}>

        {/* Recent signups */}
        <section className={styles.panel}>
          <header className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Inscriptions récentes</h2>
            <Link href="/admin/users" className={styles.panelLink}>
              Voir tout →
            </Link>
          </header>
          {recent.length === 0 ? (
            <p className={styles.empty}>Aucune inscription pour le moment.</p>
          ) : (
            <ul className={styles.list}>
              {recent.map((u) => (
                <li key={u.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowName}>{u.full_name || '—'}</span>
                    <span className={styles.rowMeta}>
                      {u.email}
                      {u.specialty ? ` · ${u.specialty}` : ''}
                      {u.hospital ? ` · ${u.hospital}` : ''}
                    </span>
                  </div>
                  <div className={styles.rowAction}>
                    <span className={styles.rowDate}>
                      {new Date(u.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                    <QuickApproveButton profileId={u.id} disabled={u.id === me.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent articles + content stats */}
        <section className={styles.panel}>
          <header className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Contenu publié</h2>
            <Link href="/admin/studio" className={styles.panelLink}>
              Ouvrir Studio →
            </Link>
          </header>
          <div className={styles.contentMini}>
            <MiniStat label="Articles" value={sanityData.articles} />
            <MiniStat label="Vidéos" value={sanityData.videos} />
            <MiniStat label="Congrès" value={sanityData.congress} />
            <MiniStat label="Évènements" value={sanityData.evenements} />
          </div>
          {sanityData.recent.length === 0 ? (
            <p className={styles.empty}>Aucun article publié.</p>
          ) : (
            <ul className={styles.list}>
              {sanityData.recent.map((a) => (
                <li key={a._id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowName}>{a.title}</span>
                    <span className={styles.rowMeta}>
                      {a.access === 'pro' ? '🔒 Pro' : '🌐 Public'}
                      {a.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleDateString('fr-FR')}` : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>

      {/* ── Quick actions ── */}
      <section className={styles.actions}>
        <h2 className={styles.actionsTitle}>Raccourcis</h2>
        <div className={styles.actionsGrid}>
          <ActionTile
            href="/admin/users?tab=pending"
            title="Examiner les inscriptions"
            desc="Approuver ou refuser les nouveaux comptes."
            badge={pendingCount && pendingCount > 0 ? String(pendingCount) : undefined}
          />
          <ActionTile
            href="/admin/studio"
            title="Publier du contenu"
            desc="Articles, vidéos, congrès, évènements."
          />
          <ActionTile
            href="/admin/studio/desk/siteSettings"
            title="Réglages du site"
            desc="Image hero, tagline, mots du typewriter."
          />
          <ActionTile
            href="/dashboard"
            title="Voir l'espace Pro"
            desc="L'expérience telle que vue par les utilisateurs."
          />
        </div>
      </section>

      {/* ── Footer info ── */}
      <footer className={styles.footer}>
        <span>
          Newsletter: <strong>{newsletterCount ?? 0}</strong> abonnés
        </span>
        <span aria-hidden>·</span>
        <span>
          Connecté en tant que <strong>{me.email}</strong>
        </span>
      </footer>

    </div>
  );
}

function StatCard({
  label, value, href, accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: 'warn';
}) {
  return (
    <Link href={href} className={`${styles.statCard} ${accent === 'warn' ? styles.statCardWarn : ''}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.miniStat}>
      <span className={styles.miniValue}>{value}</span>
      <span className={styles.miniLabel}>{label}</span>
    </div>
  );
}

function ActionTile({
  href, title, desc, badge,
}: {
  href: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <Link href={href} className={styles.actionTile}>
      <div className={styles.actionHead}>
        <span className={styles.actionTitle}>{title}</span>
        {badge && <span className={styles.actionBadge}>{badge}</span>}
      </div>
      <p className={styles.actionDesc}>{desc}</p>
      <span className={styles.actionArrow} aria-hidden>→</span>
    </Link>
  );
}
