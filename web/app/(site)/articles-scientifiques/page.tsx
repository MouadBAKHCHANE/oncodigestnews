import type { Metadata } from 'next';
import { Suspense } from 'react';
import { sanityClient } from '@/lib/sanity/client';
import { ScientificClient, type ScientificArticleData } from './ScientificClient';
import styles from './scientific.module.css';

export const metadata: Metadata = {
  title: 'Articles scientifiques',
  description:
    "Articles scientifiques, abstracts et synthèses des principaux congrès en oncologie digestive — sélectionnés par notre comité scientifique.",
};

export const revalidate = 600;

interface CongressOption {
  title: string;
  slug: string;
}

interface SanityResponse {
  articles: ScientificArticleData[];
  congresses: CongressOption[];
}

const indexQuery = /* groq */ `{
  "articles": *[_type == "scientificArticle"] | order(publishedAt desc) {
    _id, title, slug, authors, journal, doi, externalUrl,
    excerpt, coverImage, publishedAt, access,
    "category": category->{title, slug},
    "congress": congress->{title, "slug": slug, shortName}
  },
  "congresses": *[_type == "congress"] | order(startDate desc) {
    "title": title,
    "slug": slug.current
  }
}`;

export default async function ArticlesScientifiquesPage() {
  const { articles, congresses } = await sanityClient.fetch<SanityResponse>(indexQuery);

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <header className={styles.header}>
            <span className={`${styles.tag} animate-on-scroll`}>Articles scientifiques</span>
            <h1 className={`${styles.heading} animate-on-scroll delay-1`}>
              Articles scientifiques et synthèses de congrès.
            </h1>
            <p className={`${styles.lead} animate-on-scroll delay-2`}>
              Sélection rigoureuse des publications les plus marquantes en oncologie digestive,
              avec commentaires éditoriaux pour les membres.
            </p>
          </header>

          <Suspense fallback={null}>
            <ScientificClient articles={articles} congresses={congresses} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
