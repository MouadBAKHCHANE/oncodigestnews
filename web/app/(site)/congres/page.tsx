import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { CongressCard, type CongressCardData } from '@/components/cards/CongressCard';
import { CongressCover } from '@/components/cards/CongressCover';
import { blocksToPlainText } from '@/lib/sanity/portableText';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import styles from './congres.module.css';

export const metadata: Metadata = {
  title: 'Congrès',
  description:
    'Synthèses et abstracts des principaux congrès en oncologie digestive : ASCO, ESMO, JFHOD, SFCD, SNFGE.',
};

export const revalidate = 600;

interface FeaturedCongress extends CongressCardData {
  summary?: PortableTextBlock[];
  highlights?: PortableTextBlock[];
  website?: string;
  isFeatured?: boolean;
}

interface SanityResponse {
  featured: FeaturedCongress | null;
  upcoming: CongressCardData[];
  past: CongressCardData[];
}

const indexQuery = /* groq */ `{
  "featured": *[_type == "congress" && isFeatured == true] | order(startDate asc)[0]{
    _id, title, slug, shortName, startDate, endDate, location, coverImage, summary, isFeatured
  },
  "upcoming": *[_type == "congress" && startDate >= now() && (isFeatured != true || count(*[_type=='congress' && isFeatured == true]) > 1)] | order(startDate asc) {
    _id, title, slug, shortName, startDate, endDate, location, coverImage, isFeatured
  },
  "past": *[_type == "congress" && startDate < now()] | order(startDate desc) {
    _id, title, slug, shortName, startDate, endDate, location, coverImage, isFeatured
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
    return `${s.toLocaleDateString('fr-FR', { day: 'numeric' })}–${e.toLocaleDateString('fr-FR', { day: 'numeric' })} ${s.toLocaleDateString('fr-FR', { month: 'long' })} ${s.getFullYear()}`;
  }
  return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

export default async function CongresPage() {
  const { featured, upcoming, past } = await sanityClient.fetch<SanityResponse>(indexQuery);

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <header className={styles.header}>
            <span className={`${styles.tag} animate-on-scroll`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dot-grid.svg" alt="" width={16} height={16} className={styles.dotIcon} />
              <span>Congrès</span>
            </span>
            <h1 className={`${styles.heading} animate-on-scroll delay-1`}>
              Les congrès qui font l&apos;oncologie digestive.
            </h1>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Synthèses, comptes-rendus et abstracts des principaux congrès internationaux et
              nationaux. Cliquez sur un congrès pour voir les articles associés.
            </p>
          </header>

          {featured ? <FeaturedCongress congress={featured} /> : null}

          {upcoming.length > 0 ? (
            <section className={styles.gridSection}>
              <h2 className={styles.gridHeading}>Prochains congrès</h2>
              <div className={styles.grid}>
                {upcoming.map((c, i) => (
                  <CongressCard
                    key={c._id}
                    congress={c}
                    animationDelay={((i % 2) + 1) as 1 | 2}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className={styles.gridSection}>
              <h2 className={styles.gridHeading}>Congrès passés</h2>
              <div className={styles.grid}>
                {past.map((c, i) => (
                  <CongressCard
                    key={c._id}
                    congress={c}
                    animationDelay={((i % 2) + 1) as 1 | 2}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {!featured && upcoming.length === 0 && past.length === 0 ? (
            <p className={styles.empty}>Aucun congrès n&apos;a encore été publié.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FeaturedCongress({ congress }: { congress: FeaturedCongress }) {
  const dateRange = formatDateRange(congress.startDate, congress.endDate);
  const locationStr = congress.location?.city
    ? [congress.location.city, congress.location.country].filter(Boolean).join(', ')
    : null;
  const summaryText = blocksToPlainText(congress.summary);
  const isUpcoming = new Date(congress.startDate).getTime() > Date.now();

  return (
    <section className={`${styles.featuredSection} animate-on-scroll`}>
      <div className={styles.featuredCard}>
        <div className={styles.featuredImgWrap}>
          {congress.coverImage ? (
            <Image
              src={urlForImage(congress.coverImage as SanityImage).width(1200).height(900).url()}
              alt={(congress.coverImage as SanityImage & { alt?: string }).alt ?? congress.title}
              width={1200}
              height={900}
              className={styles.featuredImg}
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          ) : (
            <CongressCover
              shortName={congress.shortName ?? congress.title.split(' ')[0]}
              year={new Date(congress.startDate).getFullYear()}
              className={styles.featuredImg}
            />
          )}
        </div>
        <div className={styles.featuredContent}>
          <span className={styles.featuredBadge}>
            {isUpcoming ? 'À venir' : 'Synthèse'}
          </span>
          <h2 className={styles.featuredTitle}>{congress.title}</h2>
          <div className={styles.featuredDetails}>
            {dateRange ? <p>{dateRange}</p> : null}
            {locationStr ? <p>{locationStr}</p> : null}
            {summaryText ? <p>{summaryText}</p> : null}
          </div>
          <Link
            href={`/articles-scientifiques?congress=${congress.slug.current}`}
            className={styles.featuredLink}
          >
            Voir les articles
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arrow-dots.svg" alt="" width={16} height={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
