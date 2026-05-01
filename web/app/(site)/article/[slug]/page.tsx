import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { ProseFromPortableText, blocksToPlainText } from '@/lib/sanity/portableText';
import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';
import { Button } from '@/components/ui/Button';
import { getProfile, canViewPro } from '@/lib/auth';
import { ShareBar } from './ShareBar';
import styles from './article.module.css';

export const revalidate = 600;

interface ArticleDetail {
  _id: string;
  title: string;
  slug: { current: string };
  tag?: string | null;
  excerpt: PortableTextBlock[];
  body?: PortableTextBlock[];
  coverImage: (SanityImage & { alt?: string }) | null;
  publishedAt: string;
  readingTime?: number | null;
  access: 'public' | 'pro';
  category?: { title: string; slug: { current: string } } | null;
  author?: {
    name: string;
    role?: string | null;
    photo?: (SanityImage & { alt?: string }) | null;
    bio?: PortableTextBlock[] | null;
  } | null;
  relatedArticles?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    coverImage: (SanityImage & { alt?: string }) | null;
    publishedAt: string;
    category?: string | null;
  }>;
}

function articleQuery(includeBody: boolean): string {
  return /* groq */ `*[_type == "article" && slug.current == $slug][0]{
    _id, title, slug, tag, excerpt, coverImage, publishedAt, readingTime, access,
    "category": category->{title, slug},
    "author": author->{name, role, photo, bio},
    ${includeBody ? 'body,' : ''}
    "relatedArticles": relatedArticles[]->{
      _id, title, slug, coverImage, publishedAt,
      "category": category->title
    }
  }`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await sanityClient.fetch<{ title: string; excerpt: PortableTextBlock[] } | null>(
    /* groq */ `*[_type == "article" && slug.current == $slug][0]{ title, excerpt }`,
    { slug },
  );
  if (!article) return { title: 'Article introuvable' };
  return {
    title: article.title,
    description: blocksToPlainText(article.excerpt).slice(0, 160) || undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile();
  const includeBody = canViewPro(profile);

  const article = await sanityClient.fetch<ArticleDetail | null>(articleQuery(includeBody), {
    slug,
  });

  if (!article) notFound();

  const isGated = article.access === 'pro' && !includeBody;
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const authorInitials = article.author?.name
    ? article.author.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '';

  return (
    <>
      <header className={`${styles.header} animate-on-scroll`}>
        <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
          <Link href="/actualites">Actualités</Link>
          {article.category ? (
            <>
              <span aria-hidden>›</span>
              <Link href={`/actualites?category=${article.category.slug.current}`}>
                {article.category.title}
              </Link>
            </>
          ) : null}
          <span aria-hidden>›</span>
          <span className={styles.breadcrumbCurrent}>{article.title}</span>
        </nav>

        {article.tag ? <div className={styles.tag}>{article.tag}</div> : null}
        <h1 className={styles.title}>{article.title}</h1>

        <div className={styles.authorRow}>
          <div className={styles.avatar} aria-hidden>
            {article.author?.photo ? (
              <Image
                src={urlForImage(article.author.photo).width(96).height(96).url()}
                alt={article.author.photo.alt ?? article.author.name}
                width={48}
                height={48}
              />
            ) : (
              <span>{authorInitials || 'OD'}</span>
            )}
          </div>
          {article.author ? (
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{article.author.name}</span>
              {article.author.role ? (
                <span className={styles.authorRole}>{article.author.role}</span>
              ) : null}
            </div>
          ) : null}
          <div className={styles.dateInfo}>
            {formattedDate ? <span>{formattedDate}</span> : null}
            {article.readingTime ? (
              <span>{article.readingTime} min de lecture</span>
            ) : null}
          </div>
        </div>

        <ShareBar title={article.title} />
      </header>

      {article.coverImage ? (
        <div className={`${styles.featuredImage} animate-on-scroll delay-1`}>
          <Image
            src={urlForImage(article.coverImage).width(1600).height(900).url()}
            alt={article.coverImage.alt ?? article.title}
            width={1600}
            height={900}
            priority
            sizes="(max-width: 800px) 100vw, 800px"
          />
        </div>
      ) : null}

      <article className={`${styles.body} animate-on-scroll delay-2`}>
        {/* Excerpt is always visible — even on gated articles */}
        <div className={styles.preview}>
          <ProseFromPortableText value={article.excerpt} />
        </div>

        {isGated ? (
          <ContentGate />
        ) : article.body && article.body.length > 0 ? (
          <ProseFromPortableText value={article.body} />
        ) : null}
      </article>

      {article.author?.bio && article.author.bio.length > 0 ? (
        <aside className={styles.authorBio}>
          <div className={styles.authorBioInner}>
            <div className={styles.bioPhoto} aria-hidden>
              {article.author.photo ? (
                <Image
                  src={urlForImage(article.author.photo).width(160).height(160).url()}
                  alt={article.author.photo.alt ?? article.author.name}
                  width={80}
                  height={80}
                />
              ) : (
                <span>{authorInitials || 'OD'}</span>
              )}
            </div>
            <div className={styles.bioText}>
              <h2 className={styles.bioName}>{article.author.name}</h2>
              {article.author.role ? (
                <p className={styles.bioRole}>{article.author.role}</p>
              ) : null}
              <ProseFromPortableText value={article.author.bio} />
            </div>
          </div>
        </aside>
      ) : null}

      {article.relatedArticles && article.relatedArticles.length > 0 ? (
        <section className={styles.related}>
          <div className="padding-global">
            <div className="container-large">
              <h2 className={styles.relatedHeading}>Articles liés</h2>
              <div className={styles.relatedGrid}>
                {article.relatedArticles.slice(0, 3).map((r) => {
                  const cardData: ArticleCardData = {
                    _id: r._id,
                    title: r.title,
                    slug: r.slug,
                    coverImage: r.coverImage,
                    publishedAt: r.publishedAt,
                    access: 'public',
                    tag: r.category ?? null,
                  };
                  return <ArticleCard key={r._id} article={cardData} />;
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function ContentGate() {
  return (
    <div className={styles.gate}>
      <div className={styles.gateCard}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h3 className={styles.gateHeading}>
          Cet article est réservé aux professionnels de santé.
        </h3>
        <p className={styles.gateDesc}>
          Créez un compte gratuit pour accéder à l&apos;intégralité de nos publications.
        </p>
        <div className={styles.gateButtons}>
          <Button href="/connexion" variant="dark" size="sm">
            Se connecter
          </Button>
          <Button href="/inscription" variant="yellow" size="sm">
            Créer un compte
          </Button>
        </div>
      </div>
    </div>
  );
}
