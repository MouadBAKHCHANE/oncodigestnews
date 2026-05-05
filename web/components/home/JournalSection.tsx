import Link from 'next/link';
import { urlForImage } from '@/lib/sanity/image';
import { blocksToPlainText } from '@/lib/sanity/portableText';
import { TitleReveal } from '@/components/ui/TitleReveal';
import type { Image as SanityImage } from 'sanity';
import type { PortableTextBlock } from '@portabletext/types';
import styles from './JournalSection.module.css';

/**
 * Journal section — "Actualités · Les dernières publications"
 *
 * Mixed grid: latest Article + latest Congress + latest Video, each rendered
 * as a tall portrait card. Card has a static SVG cover; on hover, a dark
 * overlay slides up from the bottom with title, description, meta and CTA.
 */

interface JournalArticle {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: PortableTextBlock[] | string;
  publishedAt?: string;
  coverImage?: (SanityImage & { alt?: string }) | null;
  category?: { title?: string } | null;
  author?: { name?: string } | null;
}

interface JournalCongress {
  _id: string;
  title: string;
  slug: { current: string };
  shortName?: string;
  startDate?: string;
}

interface JournalVideo {
  _id: string;
  title: string;
  slug?: { current: string };
  speakerLine?: string;
  publishedAt?: string;
}

export interface JournalData {
  article: JournalArticle | null;
  congress: JournalCongress | null;
  video: JournalVideo | null;
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function JournalSection({ data }: { data: JournalData }) {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">

          {/* Header */}
          <div className={styles.header}>
            <div>
              <div className={`${styles.tag} animate-on-scroll`}>
                <img src="/dot-grid.svg" alt="" width={16} height={16} className={styles.dotIcon} />
                <span>Actualités</span>
              </div>
              <TitleReveal as="h2" className={styles.heading}>
                Les dernières publications.
              </TitleReveal>
            </div>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Articles scientifiques, comptes-rendus de congrès, interviews
              d&apos;experts. L&apos;actualité oncologique digestive, synthétisée
              pour vous.
            </p>
          </div>

          {/* Grid */}
          <div className={styles.grid}>

            {/* Card 1: Article */}
            <Link
              href={data.article ? `/article/${data.article.slug.current}` : '/actualites'}
              className={`${styles.card} animate-on-scroll`}
            >
              <div className={styles.cover}>
                {data.article?.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlForImage(data.article.coverImage).width(900).height(1200).url()}
                    alt={data.article.coverImage.alt ?? data.article.title}
                    loading="lazy"
                  />
                ) : (
                  <ArticleCoverSvg label={data.article?.category?.title ?? 'Chirurgie digestive'} />
                )}
              </div>
              <div className={styles.reveal}>
                <span className={styles.cardTag}>Article</span>
                <h3 className={styles.cardTitle}>
                  {data.article?.title ?? 'Prise en charge laparoscopique du cancer colorectal'}
                </h3>
                <p className={styles.cardDesc}>
                  {(() => {
                    const ex = data.article?.excerpt;
                    if (!ex) return 'Revue des dernières études comparant les approches mini-invasives aux techniques conventionnelles en chirurgie colorectale.';
                    if (typeof ex === 'string') return ex;
                    return blocksToPlainText(ex) || 'Lire l’article';
                  })()}
                </p>
                <div className={styles.cardMeta}>
                  {data.article?.author?.name ? (
                    <>
                      <span>{data.article.author.name}</span>
                      <span aria-hidden>·</span>
                    </>
                  ) : null}
                  <span>{fmtDate(data.article?.publishedAt) || '12/03/2026'}</span>
                </div>
                <span className={styles.cardRead}>
                  Lire <img src="/arrow-dots-light.svg" alt="" width={16} height={16} className={styles.btnIcon} />
                </span>
              </div>
            </Link>

            {/* Card 2: Congrès */}
            <Link
              href={
                data.congress
                  ? `/articles-scientifiques?congress=${data.congress.slug.current}`
                  : '/congres'
              }
              className={`${styles.card} animate-on-scroll delay-1`}
            >
              <div className={styles.cover}>
                <CongressCoverSvg
                  shortName={data.congress?.shortName ?? 'ASCO'}
                  year={
                    data.congress?.startDate
                      ? new Date(data.congress.startDate).getFullYear()
                      : 2026
                  }
                />
              </div>
              <div className={styles.reveal}>
                <span className={styles.cardTag}>Congrès</span>
                <h3 className={styles.cardTitle}>
                  {data.congress
                    ? `${data.congress.title} : les points clés`
                    : 'ASCO 2026 : les points clés'}
                </h3>
                <p className={styles.cardDesc}>
                  Synthèse des communications majeures en oncologie digestive
                  présentées lors du congrès.
                </p>
                <div className={styles.cardMeta}>
                  <span>{fmtDate(data.congress?.startDate) || '08/03/2026'}</span>
                </div>
                <span className={styles.cardRead}>
                  Lire <img src="/arrow-dots-light.svg" alt="" width={16} height={16} className={styles.btnIcon} />
                </span>
              </div>
            </Link>

            {/* Card 3: Vidéo */}
            <Link
              href={data.video?.slug ? `/videos/${data.video.slug.current}` : '/videos'}
              className={`${styles.card} animate-on-scroll delay-2`}
            >
              <div className={styles.cover}>
                <VideoCoverSvg label="Interview · Chirurgie robotique" />
              </div>
              <div className={styles.reveal}>
                <span className={styles.cardTag}>Vidéo</span>
                <h3 className={styles.cardTitle}>
                  {data.video?.title ?? 'Interview Dr. Benzakour : chirurgie robotique'}
                </h3>
                <p className={styles.cardDesc}>
                  Le Dr. Benzakour partage son expérience d&apos;interventions
                  digestives robot-assistées de façon autonome.
                </p>
                <div className={styles.cardMeta}>
                  {data.video?.speakerLine ? (
                    <>
                      <span>{data.video.speakerLine}</span>
                      <span aria-hidden>·</span>
                    </>
                  ) : null}
                  <span>{fmtDate(data.video?.publishedAt) || '01/03/2026'}</span>
                </div>
                <span className={styles.cardRead}>
                  Lire <img src="/arrow-dots-light.svg" alt="" width={16} height={16} className={styles.btnIcon} />
                </span>
              </div>
            </Link>

          </div>

          {/* CTA row */}
          <div className={styles.ctaRow}>
            <Link href="/actualites" className={styles.ctaDark}>
              Tous les articles
              <img src="/arrow-dots-light.svg" alt="" width={16} height={16} className={styles.btnIcon} />
            </Link>
            <Link href="/videos" className={styles.ctaText}>
              Voir les vidéos
              <img src="/arrow-dots.svg" alt="" width={16} height={16} className={styles.btnIcon} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ────── SVG covers (portrait 3:4) ────── */

function ArticleCoverSvg({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 450 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="grad-j-article" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0ede6" />
          <stop offset="100%" stopColor="#d8d0be" />
        </linearGradient>
      </defs>
      <rect width="450" height="600" fill="url(#grad-j-article)" />
      <g stroke="#6b5e3e" fill="none" opacity="0.10" strokeWidth="1.2">
        <rect x="300" y="80" width="80" height="80" rx="2" />
        <line x1="340" y1="90" x2="340" y2="150" />
        <line x1="310" y1="120" x2="370" y2="120" />
        <rect x="320" y="190" width="50" height="50" rx="2" />
        <line x1="345" y1="198" x2="345" y2="232" />
        <line x1="327" y1="215" x2="363" y2="215" />
        <circle cx="350" cy="290" r="25" strokeWidth="1" />
        <circle cx="310" cy="340" r="15" strokeWidth="0.8" />
      </g>
      <text x="25" y="470" fontFamily="Georgia, serif" fontSize="72" fontWeight="400" fill="#4a3f28" opacity="0.85">Article</text>
      <text x="27" y="510" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="400" fill="#4a3f28" opacity="0.5">{label}</text>
      <line x1="25" y1="540" x2="425" y2="540" stroke="#4a3f28" strokeWidth="0.5" opacity="0.15" />
    </svg>
  );
}

function CongressCoverSvg({ shortName, year }: { shortName: string; year: number }) {
  return (
    <svg viewBox="0 0 450 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="grad-j-congress" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faf8f0" />
          <stop offset="100%" stopColor="#e5dcc0" />
        </linearGradient>
      </defs>
      <rect width="450" height="600" fill="url(#grad-j-congress)" />
      <g stroke="#8a7a50" fill="none" opacity="0.12">
        <polygon points="300,80 321.65,92.5 321.65,117.5 300,130 278.35,117.5 278.35,92.5" strokeWidth="1.2" />
        <polygon points="350,80 371.65,92.5 371.65,117.5 350,130 328.35,117.5 328.35,92.5" strokeWidth="1.2" />
        <polygon points="325,123 346.65,135.5 346.65,160.5 325,173 303.35,160.5 303.35,135.5" strokeWidth="1.2" />
        <polygon points="375,123 396.65,135.5 396.65,160.5 375,173 353.35,160.5 353.35,135.5" strokeWidth="1.2" />
        <polygon points="310,180 325.59,189 325.59,207 310,216 294.41,207 294.41,189" strokeWidth="1" />
        <polygon points="360,180 375.59,189 375.59,207 360,216 344.41,207 344.41,189" strokeWidth="1" />
      </g>
      <text x="25" y="440" fontFamily="Georgia, serif" fontSize="90" fontWeight="400" fill="#5a4e2f" opacity="0.9">{shortName.toUpperCase()}</text>
      <text x="27" y="480" fontFamily="Georgia, serif" fontSize="28" fontWeight="400" fill="#5a4e2f" opacity="0.6">{year}</text>
      <line x1="25" y1="510" x2="425" y2="510" stroke="#5a4e2f" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

function VideoCoverSvg({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 450 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="grad-j-video" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#edf0f5" />
          <stop offset="100%" stopColor="#cdd5e2" />
        </linearGradient>
      </defs>
      <rect width="450" height="600" fill="url(#grad-j-video)" />
      <g stroke="#3d4d6b" fill="none" opacity="0.10">
        <circle cx="340" cy="140" r="50" strokeWidth="1.5" />
        <polygon points="325,115 325,165 365,140" fill="#3d4d6b" stroke="none" opacity="0.8" />
        <circle cx="300" cy="240" r="30" strokeWidth="1" />
        <circle cx="370" cy="270" r="20" strokeWidth="0.8" />
        <line x1="280" y1="310" x2="400" y2="310" strokeWidth="0.6" />
        <line x1="300" y1="325" x2="380" y2="325" strokeWidth="0.6" />
        <line x1="310" y1="340" x2="370" y2="340" strokeWidth="0.6" />
      </g>
      <text x="25" y="450" fontFamily="Georgia, serif" fontSize="64" fontWeight="400" fill="#2d3a52" opacity="0.85">Vidéo</text>
      <text x="27" y="490" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="400" fill="#2d3a52" opacity="0.5">{label}</text>
      <line x1="25" y1="520" x2="425" y2="520" stroke="#2d3a52" strokeWidth="0.5" opacity="0.15" />
    </svg>
  );
}
