'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { Card } from '@/components/cards/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { blocksToPlainText } from '@/lib/sanity/portableText';
import styles from './scientific.module.css';

export interface ScientificArticleData {
  _id: string;
  title: string;
  slug: { current: string };
  authors: string[];
  journal?: string | null;
  doi?: string | null;
  externalUrl?: string | null;
  excerpt: PortableTextBlock[];
  coverImage: (SanityImage & { alt?: string }) | null;
  publishedAt: string;
  access: 'public' | 'pro';
  category?: { title: string; slug: { current: string } } | null;
  congress?: { title: string; slug: { current: string }; shortName?: string | null } | null;
}

interface CongressOption {
  title: string;
  slug: string;
}

interface YearOption {
  value: string;
  label: string;
}

interface ScientificClientProps {
  articles: ScientificArticleData[];
  congresses: CongressOption[];
}

const ALL = '__all__';

export function ScientificClient({ articles, congresses }: ScientificClientProps) {
  const searchParams = useSearchParams();
  const congressParam = searchParams.get('congress');

  const [search, setSearch] = useState('');
  const [congressFilter, setCongressFilter] = useState<string>(congressParam ?? ALL);
  const [yearFilter, setYearFilter] = useState<string>(ALL);

  // Sync state if the URL param changes (e.g. coming from a congress card click).
  useEffect(() => {
    setCongressFilter(congressParam ?? ALL);
  }, [congressParam]);

  const yearOptions = useMemo<YearOption[]>(() => {
    const years = new Set<number>();
    for (const a of articles) {
      if (a.publishedAt) years.add(new Date(a.publishedAt).getFullYear());
    }
    return [...years]
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }));
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (
        congressFilter !== ALL &&
        a.congress?.slug.current !== congressFilter
      )
        return false;
      if (yearFilter !== ALL) {
        const y = a.publishedAt ? new Date(a.publishedAt).getFullYear().toString() : '';
        if (y !== yearFilter) return false;
      }
      if (q.length >= 2) {
        const haystack = [
          a.title,
          a.journal ?? '',
          a.authors.join(' '),
          blocksToPlainText(a.excerpt),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [articles, search, congressFilter, yearFilter]);

  return (
    <>
      <div className={styles.toolbar}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un article scientifique..."
        />
        <div className={styles.dropdowns}>
          <select
            className={styles.select}
            value={congressFilter}
            onChange={(e) => setCongressFilter(e.target.value)}
            aria-label="Filtrer par congrès"
          >
            <option value={ALL}>Tous les congrès</option>
            {congresses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Filtrer par année"
          >
            <option value={ALL}>Toutes les années</option>
            {yearOptions.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          Aucun article scientifique ne correspond à votre recherche.
        </p>
      ) : (
        <div className={styles.list}>
          {filtered.map((article, i) => (
            <ScientificArticleRow
              key={article._id}
              article={article}
              animationDelay={((i % 3) + 1) as 1 | 2 | 3}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ScientificArticleRow({
  article,
  animationDelay,
}: {
  article: ScientificArticleData;
  animationDelay: 1 | 2 | 3;
}) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
      })
    : null;
  const hrefInternal = `/articles-scientifiques/${article.slug.current}`;
  const externalHref = article.externalUrl ?? hrefInternal;

  return (
    <Card
      className={`${styles.row} animate-on-scroll delay-${animationDelay}`}
    >
      {article.congress ? (
        <Link
          href={`/articles-scientifiques?congress=${article.congress.slug.current}`}
          className={styles.congressBadge}
        >
          {article.congress.shortName ?? article.congress.title}
        </Link>
      ) : null}
      <h3 className={styles.title}>{article.title}</h3>
      <p className={styles.authors}>{article.authors.join(', ')}</p>
      <p className={styles.meta}>
        {[article.journal, formattedDate].filter(Boolean).join(' · ')}
      </p>
      <p className={styles.excerpt}>{blocksToPlainText(article.excerpt)}</p>
      <div className={styles.rowActions}>
        {article.doi ? (
          <a
            href={`https://doi.org/${article.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionLink}
          >
            DOI: {article.doi}
          </a>
        ) : null}
        {article.externalUrl ? (
          <a
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionLink}
          >
            Lire l&apos;article original →
          </a>
        ) : null}
      </div>
    </Card>
  );
}
