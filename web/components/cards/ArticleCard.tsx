import Image from 'next/image';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { Card } from './Card';
import { ArticlePlaceholder } from './ArticlePlaceholder';
import { urlForImage } from '@/lib/sanity/image';
import { blocksToPlainText } from '@/lib/sanity/portableText';
import styles from './ArticleCard.module.css';

export interface ArticleCardData {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: PortableTextBlock[];
  coverImage: (SanityImage & { alt?: string }) | null;
  publishedAt: string;
  readingTime?: number | null;
  access: 'public' | 'pro';
  tag?: string | null;
  category?: { title: string; slug: { current: string } } | null;
  author?: { name: string } | null;
}

interface ArticleCardProps {
  article: ArticleCardData;
  /** Override the default href (e.g. for previews). Defaults to /article/[slug]. */
  href?: string;
  /** Animation hook: adds the `animate-on-scroll` class + delay-1/2/3 modifier. */
  animationDelay?: 1 | 2 | 3;
}

export function ArticleCard({ article, href, animationDelay }: ArticleCardProps) {
  const linkHref = href ?? `/article/${article.slug.current}`;
  const isLocked = article.access === 'pro';
  const excerptText = blocksToPlainText(article.excerpt);

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  const animateClass = [
    'animate-on-scroll',
    animationDelay ? `delay-${animationDelay}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card href={linkHref} className={`${styles.articleCard} ${animateClass}`} ariaLabel={article.title}>
      <div className={styles.imgWrapper}>
        {article.coverImage ? (
          <Image
            src={urlForImage(article.coverImage).width(800).height(450).url()}
            alt={article.coverImage.alt ?? article.title}
            width={800}
            height={450}
            className={styles.img}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <ArticlePlaceholder
            label={article.tag || article.category?.title || 'Article'}
            seed={(article._id ?? '').length}
          />
        )}
        {isLocked ? (
          <div className={styles.lockBadge} aria-label="Contenu réservé aux Pros">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        ) : null}
      </div>
      <div className={styles.content}>
        {article.tag ? <span className={styles.tag}>{article.tag}</span> : null}
        <h3 className={styles.title}>{article.title}</h3>
        {excerptText ? <p className={styles.excerpt}>{excerptText}</p> : null}
        {(article.author?.name || formattedDate) && (
          <p className={styles.meta}>
            {[article.author?.name, formattedDate].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </Card>
  );
}
