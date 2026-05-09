import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { ProseFromPortableText, blocksToPlainText } from '@/lib/sanity/portableText';
import { CongressCover } from '@/components/cards/CongressCover';
import { TitleReveal } from '@/components/ui/TitleReveal';
import { Button } from '@/components/ui/Button';
import { getProfile, canViewPro } from '@/lib/auth';
import styles from './detail.module.css';

export const revalidate = 600;

interface CongressDetail {
  _id: string;
  title: string;
  slug: { current: string };
  shortName?: string | null;
  startDate: string;
  endDate: string;
  location?: { city?: string; country?: string } | null;
  coverImage: (SanityImage & { alt?: string }) | null;
  website?: string | null;
  summary?: PortableTextBlock[];
  highlights?: PortableTextBlock[];
  access: 'public' | 'pro';
  scientificArticles?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    access: 'public' | 'pro';
    publishedAt: string;
    authors?: string[];
    excerpt?: PortableTextBlock[];
    category?: { title: string } | null;
  }>;
}

const detailQuery = /* groq */ `*[_type == "congress" && slug.current == $slug][0]{
  _id, title, slug, shortName, startDate, endDate, location, coverImage, website,
  summary, highlights, access,
  "scientificArticles": *[_type == "scientificArticle" && references(^._id)] | order(publishedAt desc){
    _id, title, slug, access, publishedAt, authors, excerpt,
    "category": category->{title}
  }
}`;

function formatDateRange(start: string, end: string): string {
  if (!start) return '';
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  if (!e) {
    return s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.toLocaleDateString('fr-FR', { day: 'numeric' })}–${e.toLocaleDateString(
      'fr-FR',
      { day: 'numeric' },
    )} ${s.toLocaleDateString('fr-FR', { month: 'long' })} ${s.getFullYear()}`;
  }
  return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ${e.toLocaleDateString(
    'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const congress = await sanityClient.fetch<{
    title: string;
    summary?: PortableTextBlock[];
  } | null>(
    /* groq */ `*[_type == "congress" && slug.current == $slug][0]{ title, summary }`,
    { slug },
  );
  if (!congress) return { title: 'Congrès introuvable' };
  return {
    title: congress.title,
    description: blocksToPlainText(congress.summary).slice(0, 160) || undefined,
  };
}

export default async function CongressDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile();

  const congress = await sanityClient.fetch<CongressDetail | null>(detailQuery, { slug });
  if (!congress) notFound();

  const dateRange = formatDateRange(congress.startDate, congress.endDate);
  const locationStr = congress.location?.city
    ? [congress.location.city, congress.location.country].filter(Boolean).join(', ')
    : null;
  const isPast = new Date(congress.startDate).getTime() < Date.now();
  const isHighlightGated = congress.access === 'pro' && !canViewPro(profile);

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
            <Link href="/congres">Congrès</Link>
            <span aria-hidden>›</span>
            <span className={styles.breadcrumbCurrent}>{congress.title}</span>
          </nav>

          <header className={`${styles.hero} animate-on-scroll`}>
            <div className={styles.heroLeft}>
              <span className={styles.eyebrow}>
                {isPast ? 'Synthèse' : 'À venir'}
              </span>
              <TitleReveal as="h1" className={styles.title}>
                {congress.title}
              </TitleReveal>
              <ul className={styles.facts}>
                {dateRange ? (
                  <li>
                    <span className={styles.factLabel}>Dates</span>
                    <span className={styles.factValue}>{dateRange}</span>
                  </li>
                ) : null}
                {locationStr ? (
                  <li>
                    <span className={styles.factLabel}>Lieu</span>
                    <span className={styles.factValue}>{locationStr}</span>
                  </li>
                ) : null}
                {congress.shortName ? (
                  <li>
                    <span className={styles.factLabel}>Code</span>
                    <span className={styles.factValue}>{congress.shortName}</span>
                  </li>
                ) : null}
              </ul>
              {congress.website ? (
                <a
                  href={congress.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  Site officiel
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/arrow-dots.svg" alt="" width={16} height={16} aria-hidden />
                </a>
              ) : null}
            </div>

            <div className={styles.heroVisual}>
              {congress.coverImage ? (
                <Image
                  src={urlForImage(congress.coverImage).width(1200).height(900).url()}
                  alt={congress.coverImage.alt ?? congress.title}
                  width={1200}
                  height={900}
                  className={styles.heroImg}
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              ) : (
                <CongressCover
                  shortName={congress.shortName ?? congress.title.split(' ')[0]}
                  year={new Date(congress.startDate).getFullYear()}
                  className={styles.heroImg}
                />
              )}
            </div>
          </header>

          {congress.summary && congress.summary.length > 0 ? (
            <article className={`${styles.body} animate-on-scroll delay-1`}>
              <h2 className={styles.bodyHeading}>Synthèse</h2>
              <ProseFromPortableText value={congress.summary} />
            </article>
          ) : null}

          {congress.highlights && congress.highlights.length > 0 ? (
            <article className={`${styles.body} animate-on-scroll delay-2`}>
              <h2 className={styles.bodyHeading}>Points clés</h2>
              {isHighlightGated ? (
                <CongressGate />
              ) : (
                <ProseFromPortableText value={congress.highlights} />
              )}
            </article>
          ) : null}

          {congress.scientificArticles && congress.scientificArticles.length > 0 ? (
            <section className={styles.related}>
              <h2 className={styles.relatedHeading}>Articles scientifiques liés</h2>
              <ul className={styles.relatedList}>
                {congress.scientificArticles.map((a) => {
                  const date = a.publishedAt
                    ? new Date(a.publishedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : null;
                  const author = a.authors?.[0] ?? null;
                  return (
                    <li key={a._id} className={styles.relatedRow}>
                      <Link
                        href={`/article/${a.slug.current}`}
                        className={styles.relatedLink}
                      >
                        <div className={styles.relatedMeta}>
                          {a.category?.title ? (
                            <span className={styles.relatedCategory}>
                              {a.category.title}
                            </span>
                          ) : null}
                          {a.access === 'pro' ? (
                            <span className={styles.relatedLock} aria-label="Accès réservé">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </span>
                          ) : null}
                        </div>
                        <h3 className={styles.relatedTitle}>{a.title}</h3>
                        <p className={styles.relatedSub}>
                          {[author, date].filter(Boolean).join(' · ')}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={`/articles-scientifiques?congress=${congress.slug.current}`}
                className={styles.allArticlesLink}
              >
                Tous les articles de ce congrès
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/arrow-dots.svg" alt="" width={16} height={16} aria-hidden />
              </Link>
            </section>
          ) : null}

          <div className={styles.footerNav}>
            <Link href="/congres" className={styles.backLink}>
              ← Retour à tous les congrès
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CongressGate() {
  return (
    <div className={styles.gate}>
      <div className={styles.gateCard}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h3 className={styles.gateHeading}>
          Ce contenu est réservé aux membres inscrits.
        </h3>
        <p className={styles.gateDesc}>
          Créez un compte gratuit pour accéder à l&apos;intégralité de nos publications.
        </p>
        <div className={styles.gateButtons}>
          <Button href="/connexion" variant="dark" size="sm">
            Se connecter
          </Button>
          <Button href="/inscription" variant="yellow" size="sm">
            Créer un compte
          </Button>
        </div>
      </div>
    </div>
  );
}
