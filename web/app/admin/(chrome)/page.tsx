import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { sanityClient } from '@/lib/sanity/client';
import { requireAdmin } from '@/lib/auth';
import styles from './overview.module.css';

export const metadata = { title: 'Dashboard — Admin' };
export const dynamic = 'force-dynamic';

type ProfileStatus = 'pending' | 'approved' | 'revoked';

interface RecentSignup {
  id: string;
  email: string;
  full_name: string;
  specialty: string | null;
  hospital: string | null;
  status: ProfileStatus;
  created_at: string;
}

interface RecentContent {
  _id: string;
  _type: 'article' | 'scientificArticle';
  title: string;
  publishedAt: string;
  access: 'public' | 'pro';
  slug?: { current: string };
}

interface SanityCounts {
  articles: number;
  scientificArticles: number;
  videos: number;
  congress: number;
  recent: RecentContent[];
}

const sanityQuery = /* groq */ `{
  "articles": count(*[_type == "article"]),
  "scientificArticles": count(*[_type == "scientificArticle"]),
  "videos": count(*[_type == "video"]),
  "congress": count(*[_type == "congress"]),
  "recent": *[_type in ["article", "scientificArticle"]] | order(publishedAt desc)[0...6] {
    _id, _type, title, publishedAt, access, slug
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
      .select('id, email, full_name, specialty, hospital, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    sanityClient.fetch<SanityCounts>(sanityQuery),
  ]);

  const recent = (recentSignups ?? []) as RecentSignup[];
  const firstName = me.full_name.split(' ')[0];

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>

        {/* ── Greeting + stats ── */}
        <header className={styles.header}>
          <p className={styles.eyebrow}>Espace Admin · OncoDigest</p>
          <h1 className={styles.heading}>
            Bonjour, <em>{firstName}</em>.
          </h1>
          <p className={styles.lead}>
            Vue d&apos;ensemble de la plateforme. Gérez les inscriptions, le
            contenu et les paramètres du site.
          </p>
        </header>

        <section className={styles.stats}>
          <Stat label="Utilisateurs total" value={totalUsers ?? 0} />
          <Stat label="En attente" value={pendingCount ?? 0} accent={(pendingCount ?? 0) > 0 ? 'alert' : undefined} />
          <Stat label="Approuvés" value={approvedCount ?? 0} />
          <Stat label="Révoqués" value={revokedCount ?? 0} />
        </section>

        {/* ── Quick actions (moved up — most-used-first) ── */}
        <section className={styles.actions}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Raccourcis</h2>
          </div>
          <div className={styles.actionGrid}>
            <ActionCard
              href="/admin/users?tab=pending"
              title="Examiner les inscriptions"
              desc="Approuver ou refuser les nouveaux comptes."
              badge={pendingCount && pendingCount > 0 ? String(pendingCount) : undefined}
            />
            <ActionCard
              href="/admin/studio"
              title="Publier du contenu"
              desc="Articles, vidéos, congrès, évènements."
            />
            <ActionCard
              href="/admin/studio/desk/siteSettings"
              title="Réglages du site"
              desc="Image hero, tagline, mots du typewriter."
            />
            <ActionCard
              href="/dashboard"
              title="Voir l'espace Pro"
              desc="L'expérience telle que vue par les utilisateurs."
            />
          </div>
        </section>

        {/* ── Recent signups (status badge instead of approve button) ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Inscriptions récentes</h2>
            <Link href="/admin/users" className={styles.sectionLink}>
              Voir tout →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className={styles.empty}>Aucune inscription pour le moment.</div>
          ) : (
            <div className={styles.list}>
              {recent.map((u) => (
                <Link key={u.id} href={`/admin/users?id=${u.id}`} className={styles.row}>
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
                    <StatusBadge status={u.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Content overview ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Contenu publié</h2>
            <Link href="/admin/studio" className={styles.sectionLink}>
              Ouvrir Studio →
            </Link>
          </div>
          <div className={styles.contentMini}>
            <MiniStat label="Actualités" value={sanityData.articles} />
            <MiniStat label="Articles scientifiques" value={sanityData.scientificArticles} />
            <MiniStat label="Vidéos" value={sanityData.videos} />
            <MiniStat label="Congrès" value={sanityData.congress} />
          </div>
          {sanityData.recent.length > 0 && (
            <div className={styles.list}>
              {sanityData.recent.map((a) => (
                <div key={a._id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowName}>{a.title}</span>
                    <span className={styles.rowMeta}>
                      <span className={styles.kindTag}>
                        {a._type === 'scientificArticle' ? 'Scientifique' : 'Actualité'}
                      </span>
                      {a.access === 'pro' ? ' · 🔒 Pro' : ' · 🌐 Public'}
                      {a.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleDateString('fr-FR')}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </main>
  );
}

const STATUS_LABELS: Record<ProfileStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  revoked: 'Révoqué',
};

function StatusBadge({ status }: { status: ProfileStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`statusBadge_${status}`]}`}>
      <span className={styles.statusDot} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'alert';
}) {
  return (
    <div className={`${styles.stat} ${accent === 'alert' ? styles.statAlert : ''}`}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
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

function ActionCard({
  href, title, desc, badge,
}: {
  href: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <Link href={href} className={styles.actionCard}>
      <div className={styles.actionTitle}>
        {title}
        {badge ? (
          <span className={styles.actionBadge}>{badge}</span>
        ) : (
          <span className={styles.actionArrow} aria-hidden>→</span>
        )}
      </div>
      <p className={styles.actionDesc}>{desc}</p>
    </Link>
  );
}
