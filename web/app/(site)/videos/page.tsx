import type { Metadata } from 'next';
import { sanityClient } from '@/lib/sanity/client';
import type { VideoCardData } from '@/components/cards/VideoCard';
import { LivesCalendar, type LiveEvent } from '@/components/home/LivesCalendar';
import { TitleReveal } from '@/components/ui/TitleReveal';
import { VideosClient } from './VideosClient';
import styles from './videos.module.css';

export const metadata: Metadata = {
  title: 'Vidéos & Lives',
  description:
    'Conférences, démonstrations chirurgicales et lives en direct sur l’oncologie digestive — réservés aux professionnels de santé.',
};

export const dynamic = 'force-dynamic';

interface CategoryOption {
  title: string;
  slug: string;
}

interface SanityResponse {
  videos: VideoCardData[];
  categories: CategoryOption[];
  lives: LiveEvent[];
}

const indexQuery = /* groq */ `{
  "videos": *[_type == "video"] | order(_createdAt desc) {
    _id, title, slug, thumbnail, videoUrl, access,
    "category": category->{title, slug},
    "speakerLine": array::join(speakers[]->name, ' · ')
  },
  "categories": *[_type == "category" && context == "video"] | order(title asc) {
    "title": title,
    "slug": slug.current
  },
  "lives": *[_type == "live"] | order(startsAt asc) {
    _id, title, startsAt, durationMinutes, registrationUrl, description,
    "speakerLine": array::join(speakers[]->name, ' · ')
  }
}`;

function formatNextLive(startsAt: string): string {
  const d = new Date(startsAt);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `Prochain live · ${date} · ${time}`;
}

export default async function VideosPage() {
  const { videos, categories, lives } = await sanityClient.fetch<SanityResponse>(indexQuery);

  const now = Date.now();
  const nextLive = [...lives]
    .filter((l) => new Date(l.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const liveStatusLabel = nextLive
    ? formatNextLive(nextLive.startsAt)
    : 'Aucun live prévu prochainement';

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <header className={styles.header}>
            <span className={`${styles.tag} animate-on-scroll`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dot-grid.svg" alt="" width={16} height={16} className={styles.dotIcon} />
              <span>Vidéos & Lives</span>
            </span>
            <TitleReveal as="h1" className={styles.heading}>
              Conférences, démonstrations et lives en direct.
            </TitleReveal>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Suivez les interventions de notre comité scientifique en replay, et inscrivez-vous
              aux prochains lives réservés aux professionnels de santé.
            </p>
          </header>

          <div className={styles.twoColLayout}>
            <aside className={styles.livesAside}>
              <h2 className={styles.sectionHeading}>Prochains lives</h2>
              <LivesCalendar events={lives} />
              <div
                className={`${styles.liveStatusChip} ${nextLive ? styles.liveStatusChipActive : ''}`}
                aria-live="polite"
              >
                <span
                  className={`${styles.liveDot} ${nextLive ? styles.liveDotActive : ''}`}
                  aria-hidden
                />
                <span className={styles.liveStatusLabel}>{liveStatusLabel}</span>
              </div>
            </aside>

            <section className={styles.videosColumn}>
              <h2 className={styles.sectionHeading}>Vidéos</h2>
              <VideosClient videos={videos} categories={categories} />
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
