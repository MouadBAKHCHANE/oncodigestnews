import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { sanityClient } from '@/lib/sanity/client';
import { requireAdmin } from '@/lib/auth';
import { QuickApproveButton } from './QuickApproveButton';
import styles from './overview.module.css';

export const metadata = { title: 'Dashboard — Admin' };
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
    <main className={styles.page}>
      <div className={styles.wrap}>

        {/* ── Greeting (matches Pro dashboard pattern) ── */}
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Espace Admin · OncoDigest</p>
            <h1 className={styles.heading}>
              Bonjour, <em>{firstName}</em>.
            </h1>
            <p className={styles.lead}>
              Vue d&apos;ensemble de la plateforme. Gérez les inscriptions, le
              contenu et les paramètres du site.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.btnGhost}>
              Espace Pro
            </Link>
            <Link href="/admin/studio" className={styles.btnDark}>
              Ouvrir Studio →
            </Link>
          </div>
        </header>

        {/* ── Stats strip (matches Pro dashboard pattern) ── */}
        <section className={styles.stats}>
          <Stat label="Utilisateurs total" value={totalUsers ?? 0} />
          <Stat label="En attente" value={pendingCount ?? 0} />
          <Stat label="Approuvés" value={approvedCount ?? 0} />
          <Stat label="Révoqués" value={revokedCount ?? 0} />
          {(pendingCount ?? 0) > 0 ? (
            <Link href="/admin/users?tab=pending" className={styles.statBadgeAlert}>
              <span className={styles.statDotPulse} aria-hidden />
              {pendingCount} à examiner →
            </Link>
          ) : (
            <div className={styles.statBadge}>
              <span className={styles.statDot} aria-hidden />
              Tout est à jour
            </div>
          )}
        </section>

        {/* ── Recent signups ── */}
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
                <div key={u.id} className={styles.row}>
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
                </div>
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
            <MiniStat label="Articles" value={sanityData.articles} />
            <MiniStat label="Vidéos" value={sanityData.videos} />
            <MiniStat label="Congrès" value={sanityData.congress} />
            <MiniStat label="Évènements" value={sanityData.evenements} />
          </div>
          {sanityData.recent.length > 0 && (
            <div className={styles.list}>
              {sanityData.recent.map((a) => (
                <div key={a._id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowName}>{a.title}</span>
                    <span className={styles.rowMeta}>
                      {a.access === 'pro' ? '🔒 Pro' : '🌐 Public'}
                      {a.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleDateString('fr-FR')}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Quick actions (matches Pro dashboard pattern) ── */}
        <section className={styles.actions}>
          <h2 className={styles.sectionHeading}>Raccourcis</h2>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.stat}>
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
