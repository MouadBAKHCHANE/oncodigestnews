import Image from 'next/image';
import type { Image as SanityImage } from 'sanity';
import { Card } from './Card';
import { urlForImage } from '@/lib/sanity/image';
import styles from './CongressCard.module.css';

export interface CongressCardData {
  _id: string;
  title: string;
  slug: { current: string };
  shortName?: string | null;
  startDate: string;
  endDate: string;
  location?: { city?: string; country?: string } | null;
  coverImage: (SanityImage & { alt?: string }) | null;
  isFeatured?: boolean;
}

interface CongressCardProps {
  congress: CongressCardData;
  /** Defaults to /articles-scientifiques?congress=<slug>. */
  href?: string;
  animationDelay?: 1 | 2 | 3;
}

function formatDateRange(start: string, end: string): string {
  if (!start) return '';
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const sameMonth = e && s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const sameYear = e && s.getFullYear() === e.getFullYear();
  const monthOpts: Intl.DateTimeFormatOptions = { month: 'long' };
  const dayOpts: Intl.DateTimeFormatOptions = { day: 'numeric' };
  const yearOpts: Intl.DateTimeFormatOptions = { year: 'numeric' };

  if (!e) {
    return s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (sameMonth) {
    return `${s.toLocaleDateString('fr-FR', dayOpts)}–${e.toLocaleDateString('fr-FR', dayOpts)} ${s.toLocaleDateString('fr-FR', monthOpts)} ${s.toLocaleDateString('fr-FR', yearOpts)}`;
  }
  if (sameYear) {
    return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} – ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

export function CongressCard({ congress, href, animationDelay }: CongressCardProps) {
  const linkHref = href ?? `/articles-scientifiques?congress=${congress.slug.current}`;
  const dateRange = formatDateRange(congress.startDate, congress.endDate);
  const locationStr = congress.location?.city
    ? [congress.location.city, congress.location.country].filter(Boolean).join(', ')
    : null;

  const animateClass = [
    'animate-on-scroll',
    animationDelay ? `delay-${animationDelay}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      href={linkHref}
      className={`${styles.congressCard} ${animateClass}`}
      ariaLabel={congress.title}
    >
      <div className={styles.imgWrapper}>
        {congress.coverImage ? (
          <Image
            src={urlForImage(congress.coverImage).width(800).height(450).url()}
            alt={congress.coverImage.alt ?? congress.title}
            width={800}
            height={450}
            className={styles.img}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className={styles.imgPlaceholder} aria-hidden />
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{congress.title}</h3>
        <p className={styles.meta}>
          {[dateRange, locationStr].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Card>
  );
}
