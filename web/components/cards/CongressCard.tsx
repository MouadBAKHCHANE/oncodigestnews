import Image from 'next/image';
import Link from 'next/link';
import type { Image as SanityImage } from 'sanity';
import { Card } from './Card';
import { CongressCover } from './CongressCover';
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

interface CongressCardCta {
  href: string;
  label: string;
  external?: boolean;
}

interface CongressCardProps {
  congress: CongressCardData;
  /** Defaults to /articles-scientifiques?congress=<slug>. Ignored when `cta` is provided. */
  href?: string;
  /** When set, the card is rendered as a static container with this dark-pill CTA at the bottom (replaces the whole-card link). */
  cta?: CongressCardCta;
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

export function CongressCard({ congress, href, cta, animationDelay }: CongressCardProps) {
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

  const cover = congress.coverImage ? (
    <Image
      src={urlForImage(congress.coverImage).width(800).height(450).url()}
      alt={congress.coverImage.alt ?? congress.title}
      width={800}
      height={450}
      className={styles.img}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  ) : (
    <CongressCover
      shortName={congress.shortName ?? congress.title.split(' ')[0]}
      year={new Date(congress.startDate).getFullYear()}
      className={styles.img}
    />
  );

  const body = (
    <>
      <div className={styles.imgWrapper}>{cover}</div>
      <div className={styles.content}>
        <h3 className={styles.name}>{congress.title}</h3>
        <p className={styles.meta}>
          {[dateRange, locationStr].filter(Boolean).join(' · ')}
        </p>
        {cta ? (
          <Link
            href={cta.href}
            className={styles.cta}
            target={cta.external ? '_blank' : undefined}
            rel={cta.external ? 'noopener noreferrer' : undefined}
          >
            {cta.label}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
          </Link>
        ) : null}
      </div>
    </>
  );

  if (cta) {
    return (
      <div className={`${styles.congressCard} ${animateClass}`}>
        {body}
      </div>
    );
  }

  const linkHref = href ?? `/articles-scientifiques?congress=${congress.slug.current}`;
  return (
    <Card
      href={linkHref}
      className={`${styles.congressCard} ${animateClass}`}
      ariaLabel={congress.title}
    >
      {body}
    </Card>
  );
}
