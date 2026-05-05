import type { Metadata } from 'next';
import { sanityClient } from '@/lib/sanity/client';
import type { ArticleCardData } from '@/components/cards/ArticleCard';
import { ActualitesClient } from './ActualitesClient';
import styles from './actualites.module.css';

export const metadata: Metadata = {
  title: 'Actualités',
  description:
    "L'actualité de l'oncologie digestive : articles, rapports de congrès, vidéos et lives sélectionnés par notre comité scientifique.",
};

export const revalidate = 600;

interface CategoryOption {
  title: string;
  slug: string;
}

interface SanityResponse {
  articles: ArticleCardData[];
  categories: CategoryOption[];
}

const indexQuery = /* groq */ `{
  "articles": *[_type == "article"] | order(publishedAt desc) {
    _id, title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
    "category": category->{title, slug},
    "author": author->{name, photo}
  },
  "categories": *[_type == "category" && context == "article"] | order(title asc) {
    "title": title,
    "slug": slug.current
  }
}`;

export default async function ActualitesPage() {
  const { articles, categories } = await sanityClient.fetch<SanityResponse>(indexQuery);

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <header className={styles.header}>
            <span className={`${styles.tag} animate-on-scroll`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dot-grid.svg" alt="" width={16} height={16} className={styles.dotIcon} />
              <span>Actualités</span>
            </span>
            <h1 className={`${styles.heading} animate-on-scroll delay-1`}>
              L&apos;information oncologique, rigoureuse et accessible.
            </h1>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Articles, rapports de congrès et vidéos sélectionnés par notre comité scientifique.
            </p>
          </header>

          <ActualitesClient articles={articles} categories={categories} />
        </div>
      </div>
    </section>
  );
}
