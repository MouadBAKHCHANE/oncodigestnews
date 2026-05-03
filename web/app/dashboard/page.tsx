import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { sanityClient } from '@/lib/sanity/client';
import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: 'Espace Pro',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface DashboardData {
  proArticles: ArticleCardData[];
  proVideos: Array<{
    _id: string;
    title: string;
    slug?: { current: string };
    durationSeconds?: number;
    publishedAt?: string;
    speakerLine?: string;
  }>;
  totals: {
    articles: number;
    videos: number;
    congress: number;
  };
}

const dashboardQuery = /* groq */ `{
  "proArticles": *[_type == "article" && access == "pro"] | order(publishedAt desc)[0...3] {
    _id, title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
    "category": category->{title, slug},
    "author": author->{name, photo}
  },
  "proVideos": *[_type == "video" && access == "pro"] | order(publishedAt desc)[0...3] {
    _id, title, slug, durationSeconds, publishedAt,
    "speakerLine": array::join(speakers[]->name, ' · ')
  },
  "totals": {
    "articles": count(*[_type == "article" && access == "pro"]),
    "videos": count(*[_type == "video" && access == "pro"]),
    "congress": count(*[_type == "congress"])
  }
}`;

function formatDuration(seconds?: number) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect('/connexion?next=/dashboard');
  if (profile.status === 'pending') redirect('/account/pending');
  if (profile.status === 'revoked') redirect('/connexion?revoked=1');

  const data = await sanityClient.fetch<DashboardData>(dashboardQuery);

  const firstName = profile.full_name.split(' ')[0];
  const approvedDate = profile.approved_at
    ? new Date(profile.approved_at).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <main className={styles.page}>
      <div className="padding-global">
        <div className="container-large">

          {/* ── Welcome header ── */}
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Espace Pro · OncoDigest</p>
              <h1 className={styles.heading}>
                Bonjour, <em>{firstName}</em>.
              </h1>
              <p className={styles.lead}>
                Votre accès a été validé en {approvedDate}. Voici l&apos;essentiel
                réservé aux praticiens.
              </p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/account" className={styles.btnGhost}>
                Mon profil
              </Link>
              {profile.role === 'admin' && (
                <Link href="/admin/users" className={styles.btnDark}>
                  Espace admin →
                </Link>
              )}
            </div>
          </header>

          {/* ── Stats strip ── */}
          <section className={styles.stats}>
            <Stat label="Articles Pro disponibles" value={data.totals.articles} />
            <Stat label="Vidéos Pro" value={data.totals.videos} />
            <Stat label="Congrès couverts" value={data.totals.congress} />
            <div className={styles.statBadge}>
              <span className={styles.statDot} aria-hidden />
              Compte vérifié
            </div>
          </section>

          {/* ── Pro articles ── */}
          {data.proArticles.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>Derniers articles Pro</h2>
                <Link href="/articles-scientifiques" className={styles.sectionLink}>
                  Voir tout →
                </Link>
              </div>
              <div className={styles.grid}>
                {data.proArticles.map((article, i) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    animationDelay={((i % 3) + 1) as 1 | 2 | 3}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Pro videos ── */}
          {data.proVideos.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>Vidéos Pro récentes</h2>
                <Link href="/videos" className={styles.sectionLink}>
                  Voir tout →
                </Link>
              </div>
              <div className={styles.videoList}>
                {data.proVideos.map((v) => (
                  <Link
                    key={v._id}
                    href={v.slug?.current ? `/videos/${v.slug.current}` : '/videos'}
                    className={styles.videoRow}
                  >
                    <div className={styles.videoMeta}>
                      <span className={styles.videoDuration}>{formatDuration(v.durationSeconds)}</span>
                      <span className={styles.videoSep} aria-hidden />
                      <span className={styles.videoSpeakers}>{v.speakerLine ?? 'OncoDigest'}</span>
                    </div>
                    <h3 className={styles.videoTitle}>{v.title}</h3>
                    <span className={styles.videoArrow} aria-hidden>→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Quick actions ── */}
          <section className={styles.actions}>
            <h2 className={styles.sectionHeading}>Raccourcis</h2>
            <div className={styles.actionGrid}>
              <ActionCard
                href="/actualites"
                title="Actualités"
                desc="Synthèses de la semaine en oncologie digestive."
              />
              <ActionCard
                href="/congres"
                title="Congrès"
                desc="ASCO, ESMO, SFCD, JFHOD — rapports structurés."
              />
              <ActionCard
                href="/evenements"
                title="Évènements"
                desc="Webinaires et rencontres à venir."
              />
              <ActionCard
                href="/contact"
                title="Nous contacter"
                desc="Question, proposition d'article, partenariat."
              />
            </div>
          </section>

          {/* ── Empty state if no pro content yet ── */}
          {data.proArticles.length === 0 && data.proVideos.length === 0 && (
            <section className={styles.empty}>
              <p className={styles.emptyText}>
                Le contenu Pro arrive très bientôt. En attendant, parcourez les
                articles publics et restez connecté.
              </p>
            </section>
          )}

        </div>
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

function ActionCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className={styles.actionCard}>
      <div className={styles.actionTitle}>
        {title}
        <span className={styles.actionArrow} aria-hidden>→</span>
      </div>
      <p className={styles.actionDesc}>{desc}</p>
    </Link>
  );
}
