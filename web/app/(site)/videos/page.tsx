import type { Metadata } from 'next';
import { sanityClient } from '@/lib/sanity/client';
import type { VideoCardData } from '@/components/cards/VideoCard';
import { LivesCalendar, type LiveEvent } from '@/components/home/LivesCalendar';
import { VideosClient } from './VideosClient';
import styles from './videos.module.css';

export const metadata: Metadata = {
  title: 'Vidéos & Lives',
  description:
    'Conférences, démonstrations chirurgicales et lives en direct sur l’oncologie digestive — réservés aux professionnels de santé.',
};

export const revalidate = 600;

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
  "videos": *[_type == "video"] | order(publishedAt desc) {
    _id, title, slug, thumbnail, durationSeconds, publishedAt, access,
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

export default async function VideosPage() {
  const { videos, categories, lives } = await sanityClient.fetch<SanityResponse>(indexQuery);

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <header className={styles.header}>
            <span className={`${styles.tag} animate-on-scroll`}>Vidéos & Lives</span>
            <h1 className={`${styles.heading} animate-on-scroll delay-1`}>
              Conférences, démonstrations et lives en direct.
            </h1>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Suivez les interventions de notre comité scientifique en replay, et inscrivez-vous
              aux prochains lives réservés aux professionnels de santé.
            </p>
          </header>

          {lives.length > 0 ? (
            <section className={styles.livesSection}>
              <h2 className={styles.sectionHeading}>Calendrier des lives</h2>
              <LivesCalendar events={lives} />
            </section>
          ) : null}

          <section className={styles.videosSection}>
            <h2 className={styles.sectionHeading}>Vidéos</h2>
            <VideosClient videos={videos} categories={categories} />
          </section>
        </div>
      </div>
    </section>
  );
}
