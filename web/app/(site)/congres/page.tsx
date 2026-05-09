import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { CongressCard, type CongressCardData } from '@/components/cards/CongressCard';
import { CongressCover } from '@/components/cards/CongressCover';
import { TitleReveal } from '@/components/ui/TitleReveal';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import styles from './congres.module.css';

export const metadata: Metadata = {
  title: 'Congrès',
  description:
    'Synthèses et abstracts des principaux congrès en oncologie digestive : ASCO, ESMO, JFHOD, SFCD, SNFGE.',
};

export const revalidate = 600;

interface UpcomingCongress extends CongressCardData {
  website?: string | null;
}

interface PastCongress extends CongressCardData {
  summary?: PortableTextBlock[];
}

interface SanityResponse {
  upcoming: UpcomingCongress[];
  past: PastCongress[];
}

const indexQuery = /* groq */ `{
  "upcoming": *[_type == "congress" && startDate >= now()] | order(startDate asc) {
    _id, title, slug, shortName, startDate, endDate, location, coverImage, website, isFeatured
  },
  "past": *[_type == "congress" && startDate < now()] | order(startDate desc) {
    _id, title, slug, shortName, startDate, endDate, location, coverImage, summary, isFeatured
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
  const { upcoming, past } = await sanityClient.fetch<SanityResponse>(indexQuery);

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
            <TitleReveal as="h1" className={styles.heading}>
              Les congrès qui font l&apos;oncologie digestive.
            </TitleReveal>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Synthèses, comptes-rendus et abstracts des principaux congrès internationaux et
              nationaux. Cliquez sur un congrès pour voir les articles associés.
            </p>
          </header>

          {upcoming.length > 0 ? (
            <section className={styles.gridSection}>
              <h2 className={styles.gridHeading}>Prochains congrès</h2>
              <div className={styles.grid}>
                {upcoming.map((c, i) => (
                  <CongressCard
                    key={c._id}
                    congress={c}
                    cta={
                      c.website
                        ? { href: c.website, label: 'Site officiel', external: true }
                        : undefined
                    }
                    animationDelay={((i % 2) + 1) as 1 | 2}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className={styles.gridSection}>
              <h2 className={styles.gridHeading}>Congrès passés</h2>
              <div className={styles.pastGrid}>
                {past.map((c, i) => (
                  <PastCongressCard
                    key={c._id}
                    congress={c}
                    animationDelay={((i % 3) + 1) as 1 | 2 | 3}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {upcoming.length === 0 && past.length === 0 ? (
            <p className={styles.empty}>Aucun congrès n&apos;a encore été publié.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PastCongressCard({
  congress,
  animationDelay,
}: {
  congress: PastCongress;
  animationDelay?: 1 | 2 | 3;
}) {
  const dateRange = formatDateRange(congress.startDate, congress.endDate);
  const locationStr = congress.location?.city
    ? [congress.location.city, congress.location.country].filter(Boolean).join(', ')
    : null;
  const year = new Date(congress.startDate).getFullYear();
  const detailHref = `/congres/${congress.slug.current}`;
  const animateClass = [
    'animate-on-scroll',
    animationDelay ? `delay-${animationDelay}` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const eyebrow = congress.shortName ? `Synthèse · ${congress.shortName} ${year}` : 'Synthèse';

  return (
    <Link
      href={detailHref}
      className={`${styles.pastCard} ${animateClass}`}
      aria-label={`${congress.title} — voir la synthèse`}
    >
      <div className={styles.pastCover}>
        {congress.coverImage ? (
          <Image
            src={urlForImage(congress.coverImage as SanityImage).width(800).height(560).url()}
            alt={(congress.coverImage as SanityImage & { alt?: string }).alt ?? congress.title}
            width={800}
            height={560}
            className={styles.pastCoverImg}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <CongressCover
            shortName={congress.shortName ?? congress.title.split(' ')[0]}
            year={year}
            className={styles.pastCoverImg}
          />
        )}
      </div>
      <div className={styles.pastBody}>
        <span className={styles.pastEyebrow}>{eyebrow}</span>
        <h3 className={styles.pastTitle}>{congress.title}</h3>
        {dateRange || locationStr ? (
          <p className={styles.pastMeta}>
            {[dateRange, locationStr].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

