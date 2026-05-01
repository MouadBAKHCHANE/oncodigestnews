'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';
import { FilterPills, type FilterPill } from '@/components/ui/FilterPills';
import { SearchInput } from '@/components/ui/SearchInput';
import { urlForImage } from '@/lib/sanity/image';
import { blocksToPlainText } from '@/lib/sanity/portableText';
import styles from './actualites.module.css';

interface CategoryOption {
  title: string;
  slug: string;
}

interface ActualitesClientProps {
  articles: ArticleCardData[];
  categories: CategoryOption[];
  initialBatchSize?: number;
  loadMoreSize?: number;
}

const ALL_CATEGORIES = '__all__';

export function ActualitesClient({
  articles,
  categories,
  initialBatchSize = 9,
  loadMoreSize = 6,
}: ActualitesClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [visibleCount, setVisibleCount] = useState(initialBatchSize);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (category !== ALL_CATEGORIES && a.category?.slug.current !== category) return false;
      if (q.length >= 2) {
        const haystack = [
          a.title,
          a.tag ?? '',
          a.author?.name ?? '',
          blocksToPlainText(a.excerpt),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [articles, search, category]);

  const featured = filtered[0];
  const grid = filtered.slice(1, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const pills: FilterPill[] = [
    { value: ALL_CATEGORIES, label: 'Tous' },
    ...categories.map((c) => ({ value: c.slug, label: c.title })),
  ];

  return (
    <>
      <div className={styles.toolbar}>
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(initialBatchSize);
          }}
          placeholder="Rechercher un article..."
        />
        <FilterPills
          pills={pills}
          value={category}
          onChange={(v) => {
            setCategory(v);
            setVisibleCount(initialBatchSize);
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          Aucun article ne correspond à votre recherche.
        </p>
      ) : null}

      {featured ? <FeaturedCard article={featured} /> : null}

      {grid.length > 0 ? (
        <section className={styles.gridSection}>
          <div className={styles.grid}>
            {grid.map((a, i) => (
              <ArticleCard
                key={a._id}
                article={a}
                animationDelay={((i % 3) + 1) as 1 | 2 | 3}
              />
            ))}
          </div>

          {hasMore ? (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                className={styles.loadMore}
                onClick={() => setVisibleCount((n) => n + loadMoreSize)}
              >
                Charger plus d&apos;articles
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

function FeaturedCard({ article }: { article: ArticleCardData }) {
  const excerptText = blocksToPlainText(article.excerpt);
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <section className={styles.featuredSection}>
      <Link href={`/article/${article.slug.current}`} className={styles.featuredCard}>
        <div className={styles.featuredImgWrap}>
          {article.coverImage ? (
            <Image
              src={urlForImage(article.coverImage).width(1200).height(900).url()}
              alt={article.coverImage.alt ?? article.title}
              width={1200}
              height={900}
              className={styles.featuredImg}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          ) : (
            <div className={styles.featuredImgPlaceholder} aria-hidden />
          )}
        </div>
        <div className={styles.featuredContent}>
          {article.tag ? <span className={styles.featuredTag}>{article.tag}</span> : null}
          <h2 className={styles.featuredTitle}>{article.title}</h2>
          {excerptText ? <p className={styles.featuredExcerpt}>{excerptText}</p> : null}
          {(article.author?.name || formattedDate) && (
            <p className={styles.featuredMeta}>
              {[article.author?.name, formattedDate].filter(Boolean).join(' · ')}
            </p>
          )}
          <span className={styles.featuredLink}>
            Lire l&apos;article →
          </span>
        </div>
      </Link>
    </section>
  );
}
