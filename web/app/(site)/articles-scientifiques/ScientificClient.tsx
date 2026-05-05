'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { Card } from '@/components/cards/Card';
import { ArticlePlaceholder } from '@/components/cards/ArticlePlaceholder';
import { SearchInput } from '@/components/ui/SearchInput';
import { urlForImage } from '@/lib/sanity/image';
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

interface YearOption {
  value: string;
  label: string;
}

interface SpecialtyOption {
  value: string;
  label: string;
}

interface ScientificClientProps {
  articles: ScientificArticleData[];
}

const ALL = '__all__';

const THEMES = ['sand', 'cream', 'mint', 'rose', 'sky'] as const;

function themeForIndex(i: number): (typeof THEMES)[number] {
  return THEMES[i % THEMES.length];
}

function plainTag(article: ScientificArticleData): string {
  if (article.congress?.shortName) return article.congress.shortName;
  return article.category?.title ?? 'Article';
}

export function ScientificClient({ articles }: ScientificClientProps) {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>(ALL);
  const [yearFilter, setYearFilter] = useState<string>(ALL);

  const yearOptions = useMemo<YearOption[]>(() => {
    const years = new Set<number>();
    for (const a of articles) {
      if (a.publishedAt) years.add(new Date(a.publishedAt).getFullYear());
    }
    return [...years]
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }));
  }, [articles]);

  const specialtyOptions = useMemo<SpecialtyOption[]>(() => {
    // Distinct categories (used as specialties), keyed by slug, label = title.
    const map = new Map<string, string>();
    for (const a of articles) {
      const slug = a.category?.slug?.current;
      const label = a.category?.title;
      if (slug && label && !map.has(slug)) map.set(slug, label);
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (specialtyFilter !== ALL && a.category?.slug?.current !== specialtyFilter) return false;
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
  }, [articles, search, specialtyFilter, yearFilter]);

  const featured = filtered[0];
  const grid = filtered.slice(1);

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
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            aria-label="Filtrer par spécialité"
          >
            <option value={ALL}>Toutes les spécialités</option>
            {specialtyOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
      ) : null}

      {featured ? <FeaturedCard article={featured} /> : null}

      {grid.length > 0 ? (
        <div className={styles.grid}>
          {grid.map((a, i) => (
            <ScientificCard key={a._id} article={a} themeIndex={i + 1} />
          ))}
        </div>
      ) : null}
    </>
  );
}

function FeaturedCard({ article }: { article: ScientificArticleData }) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const isLocked = article.access === 'pro';
  const excerptText = blocksToPlainText(article.excerpt);
  const tag = plainTag(article);
  const href = article.externalUrl ?? `/article/${article.slug.current}`;
  const isExternal = !!article.externalUrl;

  return (
    <section className={styles.featuredSection}>
      <Link
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`${styles.featuredCard} animate-on-scroll`}
      >
        <div className={styles.featuredImg}>
          {article.coverImage ? (
            <Image
              src={urlForImage(article.coverImage).width(1200).height(900).url()}
              alt={article.coverImage.alt ?? article.title}
              width={1200}
              height={900}
              className={styles.featuredImgEl}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          ) : (
            <ArticlePlaceholder label={tag} theme="dark" seed={1} />
          )}
        </div>
        <div className={styles.featuredContent}>
          <div className={styles.featuredTagRow}>
            <span className={styles.featuredTag}>{tag}</span>
            {isLocked ? (
              <span className={styles.featuredLock} aria-label="Accès réservé">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Accès réservé
              </span>
            ) : null}
          </div>
          <h2 className={styles.featuredTitle}>{article.title}</h2>
          {excerptText ? (
            <p className={styles.featuredExcerpt}>{excerptText}</p>
          ) : null}
          <p className={styles.featuredMeta}>
            {[article.authors[0], formattedDate].filter(Boolean).join(' · ')}
          </p>
          <span className={styles.featuredLink}>
            Lire l&apos;article
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arrow-dots.svg" alt="" width={16} height={16} aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  );
}

function ScientificCard({
  article,
  themeIndex,
}: {
  article: ScientificArticleData;
  themeIndex: number;
}) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;
  const isLocked = article.access === 'pro';
  const excerptText = blocksToPlainText(article.excerpt);
  const tag = plainTag(article);
  const isExternal = !!article.externalUrl;
  const href = article.externalUrl ?? `/article/${article.slug.current}`;

  return (
    <Card
      href={href}
      className={`${styles.card} animate-on-scroll delay-${(themeIndex % 3) + 1}`}
      ariaLabel={article.title}
    >
      <div className={styles.cardImg}>
        {article.coverImage ? (
          <Image
            src={urlForImage(article.coverImage).width(800).height(600).url()}
            alt={article.coverImage.alt ?? article.title}
            width={800}
            height={600}
            className={styles.cardImgEl}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <ArticlePlaceholder
            label={tag}
            theme={themeForIndex(themeIndex)}
            seed={themeIndex}
          />
        )}
        {isLocked ? (
          <div className={styles.cardLock} aria-label="Accès réservé">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        ) : null}
      </div>
      <div className={styles.cardContent}>
        <span className={styles.cardTag}>{tag}</span>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        {excerptText ? <p className={styles.cardExcerpt}>{excerptText}</p> : null}
        <p className={styles.cardMeta}>
          {[article.authors[0], formattedDate].filter(Boolean).join(' · ')}
        </p>
      </div>
      {isExternal ? <span className="sr-only">(lien externe)</span> : null}
    </Card>
  );
}
