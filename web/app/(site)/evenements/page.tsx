import type { Metadata } from 'next';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import type { Image as SanityImage } from 'sanity';
import { BrandIllustration } from '@/components/ui/BrandIllustration';
import styles from './evenements.module.css';

export const metadata: Metadata = {
  title: 'Évènements',
  description:
    'Congrès, webinaires et rencontres scientifiques couverts par OncoDigest — synthèses, rapports et replays en oncologie digestive.',
};

export const revalidate = 300;

interface Evenement {
  _id: string;
  title: string;
  type: string;
  status: 'upcoming' | 'live' | 'past';
  isFeatured: boolean;
  startDate: string;
  endDate?: string;
  location?: { city?: string; country?: string; isOnline?: boolean };
  description?: string;
  tags?: string[];
  coverImage?: SanityImage & { alt?: string };
  externalUrl?: string;
  reportSlug?: string;
}

const evenementsQuery = /* groq */ `{
  "featured": *[_type == "evenement" && isFeatured == true] | order(startDate asc)[0] {
    _id, title, type, status, isFeatured,
    startDate, endDate, location, description, tags,
    coverImage, externalUrl, reportSlug
  },
  "upcoming": *[_type == "evenement" && status in ["upcoming","live"] && isFeatured != true] | order(startDate asc) {
    _id, title, type, status, startDate, endDate, location, tags, reportSlug
  },
  "past": *[_type == "evenement" && status == "past"] | order(startDate desc) {
    _id, title, type, status, startDate, location, tags, reportSlug
  }
}`;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'short',
    year: 'numeric',
  });
}

function locationLabel(ev: Pick<Evenement, 'location'>) {
  if (ev.location?.isOnline) return 'En ligne';
  const parts = [ev.location?.city, ev.location?.country].filter(Boolean);
  return parts.join(', ') || '—';
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    congres: 'Congrès',
    webinaire: 'Webinaire',
    symposium: 'Symposium',
    conference: 'Conférence',
    autre: 'Évènement',
  };
  return map[type] ?? 'Évènement';
}

export default async function EvenementsPage() {
  const data = await sanityClient.fetch<{
    featured: Evenement | null;
    upcoming: Evenement[];
    past: Evenement[];
  }>(evenementsQuery);

  const featured = data.featured ?? null;
  const upcoming = data.upcoming ?? [];
  const past = data.past ?? [];
  const hasList = upcoming.length > 0 || past.length > 0;

  return (
    <div className={styles.page}>

      {/* ── 1. Header ── */}
      <section className={styles.header}>
        <div className="padding-global">
          <div className="container-large">
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden />
              L&apos;expérience OncoDigest
            </div>
            <h1 className={styles.h1}>Évènements</h1>
          </div>
        </div>
      </section>

      {/* ── 2. Featured event ── */}
      {featured ? (
        <section className={styles.featured}>
          <div className="padding-global">
            <div className="container-large">

              <div className={styles.featuredVisual}>
                {featured.coverImage ? (
                  <img
                    src={urlForImage(featured.coverImage).width(1400).height(612).url()}
                    alt={featured.coverImage.alt ?? featured.title}
                    className={styles.featuredImg}
                  />
                ) : (
                  <div className={styles.featuredIllustration}>
                    <BrandIllustration variant="congress" label={featured.title} />
                  </div>
                )}
                <span className={styles.featuredLabel}>
                  {featured.status === 'live' ? 'En cours' : 'Évènement à venir'}
                </span>
                {(featured.status === 'upcoming' || featured.status === 'live') && (
                  <span className={styles.featuredStatusLive}>
                    <span className={styles.statusDot} aria-hidden />
                    {featured.status === 'live' ? 'Live' : formatDate(featured.startDate)}
                    {featured.endDate ? ` – ${formatDate(featured.endDate)}` : ''}
                  </span>
                )}
              </div>

              <div className={styles.featuredBody}>
                <div>
                  <p className={styles.featuredMeta}>
                    <span>{formatDate(featured.startDate)}</span>
                    {featured.endDate && (
                      <> <span className={styles.featuredMetaSep} aria-hidden /> <span>{formatDate(featured.endDate)}</span></>
                    )}
                    <span className={styles.featuredMetaSep} aria-hidden />
                    <span>{locationLabel(featured)}</span>
                  </p>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  {featured.description && (
                    <p className={styles.featuredDesc}>{featured.description}</p>
                  )}
                </div>

                <div className={styles.featuredRight}>
                  {featured.tags && featured.tags.length > 0 && (
                    <div className={styles.tagRow}>
                      {featured.tags.map((t) => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                  )}
                  {(featured.reportSlug || featured.externalUrl) && (
                    <Link
                      href={featured.reportSlug ?? featured.externalUrl ?? '#'}
                      className={`${styles.btnOutline} ${styles.btnOutlineAccent}`}
                      {...(featured.externalUrl && !featured.reportSlug
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      Découvrir l&apos;évènement
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      ) : null}

      {/* ── 3. Upcoming (non-featured) ── */}
      {upcoming.length > 0 && (
        <section className={styles.pastSection}>
          <div className="padding-global">
            <div className="container-large">
              <div className={styles.pastHeading}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.4"/>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                </svg>
                Prochains évènements
                <span className={styles.pastHeadingLine} aria-hidden />
              </div>
              <div className={styles.eventList}>
                {upcoming.map((ev) => (
                  <EventRow key={ev._id} ev={ev} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Past events ── */}
      {past.length > 0 && (
        <section className={past.length > 0 && upcoming.length === 0 ? styles.pastSection : styles.pastSectionNoBorder}>
          <div className="padding-global">
            <div className="container-large">
              <div className={styles.pastHeading}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.4"/>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                </svg>
                Évènements précédents
                <span className={styles.pastHeadingLine} aria-hidden />
              </div>
              <div className={styles.eventList}>
                {past.map((ev) => (
                  <EventRow key={ev._id} ev={ev} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {!featured && !hasList && (
        <section className={styles.emptyState}>
          <div className="padding-global">
            <div className="container-large">
              <p className={styles.emptyText}>
                Les prochains évènements seront annoncés bientôt.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Bottom CTA ── */}
      <section className={styles.ctaSection}>
        <div className="padding-global">
          <div className="container-large">
            <h2 className={styles.ctaHeading}>
              Restez à la pointe de l&apos;<em>oncologie digestive</em>.
            </h2>
            <p className={styles.ctaSub}>
              Accédez aux synthèses de congrès, articles et vidéos exclusives.
            </p>
            <Link href="/inscription" className={styles.btnOutline}>
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function EventRow({ ev }: { ev: Evenement }) {
  const href = ev.reportSlug ?? ev.externalUrl ?? '/evenements';
  const isExternal = !ev.reportSlug && !!ev.externalUrl;
  return (
    <Link
      href={href}
      className={styles.eventRow}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className={styles.eventDate}>{formatDate(ev.startDate)}</span>
      <div className={styles.eventInfo}>
        <span className={styles.eventName}>{ev.title}</span>
        <div className={styles.eventMeta}>
          <span>{typeLabel(ev.type)}</span>
          <span className={styles.eventMetaDot} aria-hidden />
          <span>{locationLabel(ev)}</span>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/arrow-dots-light.svg" alt="" width={16} height={16} className={styles.eventArrow} aria-hidden />
    </Link>
  );
}
