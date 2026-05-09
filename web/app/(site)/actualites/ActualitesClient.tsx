'use client';

import { useMemo, useState } from 'react';
import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';
import { FilterPills, type FilterPill } from '@/components/ui/FilterPills';
import { SearchInput } from '@/components/ui/SearchInput';
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

  const grid = filtered.slice(0, visibleCount);
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
