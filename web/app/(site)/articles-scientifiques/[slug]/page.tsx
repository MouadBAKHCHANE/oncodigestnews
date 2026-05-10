import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { ProseFromPortableText, blocksToPlainText } from '@/lib/sanity/portableText';
import { Button } from '@/components/ui/Button';
import { getProfile, canViewPro } from '@/lib/auth';
import styles from './scientific-detail.module.css';

export const revalidate = 600;

interface ScientificDetail {
  _id: string;
  title: string;
  slug: { current: string };
  authors: string[];
  journal?: string | null;
  externalUrl?: string | null;
  excerpt: PortableTextBlock[];
  body?: PortableTextBlock[] | null;
  /** Legacy fallback (older docs only had `commentary`). */
  commentary?: PortableTextBlock[] | null;
  coverImage?: (SanityImage & { alt?: string }) | null;
  publishedAt: string;
  access: 'public' | 'pro';
  category?: { title: string; slug?: { current: string } } | null;
  congress?: {
    title: string;
    slug?: { current: string };
    shortName?: string | null;
  } | null;
}

const detailQuery = /* groq */ `*[_type == "scientificArticle" && slug.current == $slug][0]{
  _id, title, slug, authors, journal, externalUrl,
  excerpt, body, commentary, coverImage, publishedAt, access,
  "category": category->{title, slug},
  "congress": congress->{title, slug, shortName}
}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await sanityClient.fetch<{
    title: string;
    excerpt: PortableTextBlock[];
  } | null>(
    /* groq */ `*[_type == "scientificArticle" && slug.current == $slug][0]{ title, excerpt }`,
    { slug },
  );
  if (!article) return { title: 'Article scientifique introuvable' };
  return {
    title: article.title,
    description: blocksToPlainText(article.excerpt).slice(0, 160) || undefined,
  };
}

export default async function ScientificDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile();

  const article = await sanityClient.fetch<ScientificDetail | null>(detailQuery, { slug });
  if (!article) notFound();

  // Use new `body`, fall back to legacy `commentary` for older docs.
  const fullBlocks = (article.body && article.body.length > 0
    ? article.body
    : article.commentary) ?? [];

  const isGated = article.access === 'pro' && !canViewPro(profile);
  const fullBody = isGated ? null : fullBlocks;
  const bodyPreview = isGated
    ? fullBlocks
        .filter(
          (b) =>
            (b as { _type?: string; style?: string })._type === 'block' &&
            (b as { style?: string }).style === 'normal',
        )
        .slice(0, 2)
    : [];

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const authorLine = article.authors?.join(', ') ?? '';
  const initials = (article.authors?.[0] ?? 'OD')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Infos article scientifique">
          <div className={`${styles.sideBlock} animate-on-scroll`}>
            <span className={styles.sideEyebrow}>Article scientifique</span>
            <p className={styles.sideMetaLine}>
              {article.journal ? `${article.journal} · ` : ''}
              {formattedDate}
            </p>
            {article.category ? (
              <Link
                href={`/articles-scientifiques?category=${article.category.slug?.current ?? ''}`}
                className={styles.sideCategory}
              >
                {article.category.title}
              </Link>
            ) : null}
          </div>

          {article.externalUrl ? (
            <div className={`${styles.sideBlock} animate-on-scroll delay-1`}>
              <span className={styles.sideEyebrow}>Source</span>
              <a
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sideExternalLink}
              >
                Lire la publication originale
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/arrow-dots.svg" alt="" width={14} height={14} aria-hidden />
              </a>
            </div>
          ) : null}

          <div className={`${styles.sideCta} animate-on-scroll delay-2`}>
            <h3 className={styles.sideCtaHeading}>Une question&nbsp;?</h3>
            <p className={styles.sideCtaText}>
              Notre comité scientifique vous répond — écrivez-nous pour
              échanger sur un sujet ou proposer un article.
            </p>
            <Link href="/contact" className={styles.sideCtaBtn}>
              Nous contacter
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
            </Link>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={`${styles.header} animate-on-scroll`}>
            <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
              <Link href="/articles-scientifiques">Articles scientifiques</Link>
              {article.category ? (
                <>
                  <span aria-hidden>›</span>
                  <span>{article.category.title}</span>
                </>
              ) : null}
              <span aria-hidden>›</span>
              <span className={styles.breadcrumbCurrent}>{article.title}</span>
            </nav>

            {article.category?.title ? (
              <div className={styles.tag}>{article.category.title}</div>
            ) : null}
            <h1 className={styles.title}>{article.title}</h1>

            <div className={styles.authorRow}>
              <div className={styles.avatar} aria-hidden>
                <span>{initials || 'OD'}</span>
              </div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{authorLine || 'OncoDigest'}</span>
                {article.journal ? (
                  <span className={styles.authorRole}>{article.journal}</span>
                ) : null}
              </div>
              <div className={styles.dateInfo}>
                {formattedDate ? <span>{formattedDate}</span> : null}
                {article.congress?.shortName ? (
                  <span>{article.congress.shortName}</span>
                ) : null}
              </div>
            </div>
          </header>

          {article.coverImage ? (
            <div className={`${styles.featuredImage} animate-on-scroll delay-1`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlForImage(article.coverImage).width(1600).height(900).fit('crop').url()}
                alt={article.coverImage.alt ?? article.title}
                className={styles.featuredImg}
              />
            </div>
          ) : null}

          <article className={`${styles.body} animate-on-scroll delay-2`}>
            <div className={styles.preview}>
              <ProseFromPortableText value={article.excerpt} />
            </div>

            {isGated ? (
              <>
                {bodyPreview.length > 0 ? (
                  <div className={styles.gatedPreview}>
                    <ProseFromPortableText value={bodyPreview} />
                  </div>
                ) : null}
                <ContentGate />
              </>
            ) : fullBody && fullBody.length > 0 ? (
              <ProseFromPortableText value={fullBody} />
            ) : null}
          </article>
        </main>
      </div>
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
          Ce contenu est réservé aux membres inscrits.
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
