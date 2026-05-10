import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { ProseFromPortableText, blocksToPlainText } from '@/lib/sanity/portableText';
import { TitleReveal } from '@/components/ui/TitleReveal';
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
  doi?: string | null;
  externalUrl?: string | null;
  excerpt: PortableTextBlock[];
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
  _id, title, slug, authors, journal, doi, externalUrl,
  excerpt, commentary, coverImage, publishedAt, access,
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

  const isGated = article.access === 'pro' && !canViewPro(profile);
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
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

          <header className={styles.header}>
            {article.category?.title ? (
              <span className={styles.eyebrow}>{article.category.title}</span>
            ) : null}
            <TitleReveal as="h1" className={styles.title}>
              {article.title}
            </TitleReveal>

            <ul className={styles.facts}>
              {article.authors && article.authors.length > 0 ? (
                <li>
                  <span className={styles.factLabel}>Auteurs</span>
                  <span className={styles.factValue}>{article.authors.join(', ')}</span>
                </li>
              ) : null}
              {article.journal ? (
                <li>
                  <span className={styles.factLabel}>Journal</span>
                  <span className={styles.factValue}>{article.journal}</span>
                </li>
              ) : null}
              {article.congress?.title ? (
                <li>
                  <span className={styles.factLabel}>Congrès</span>
                  <span className={styles.factValue}>
                    {article.congress.shortName ?? article.congress.title}
                  </span>
                </li>
              ) : null}
              {formattedDate ? (
                <li>
                  <span className={styles.factLabel}>Publié le</span>
                  <span className={styles.factValue}>{formattedDate}</span>
                </li>
              ) : null}
              {article.doi ? (
                <li>
                  <span className={styles.factLabel}>DOI</span>
                  <span className={styles.factValue}>
                    <a
                      href={`https://doi.org/${article.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.factLink}
                    >
                      {article.doi}
                    </a>
                  </span>
                </li>
              ) : null}
              {article.externalUrl ? (
                <li>
                  <span className={styles.factLabel}>Source</span>
                  <span className={styles.factValue}>
                    <a
                      href={article.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.factLink}
                    >
                      Lire la publication originale
                    </a>
                  </span>
                </li>
              ) : null}
            </ul>
          </header>

          {article.coverImage ? (
            <div className={styles.cover}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlForImage(article.coverImage).width(1600).height(900).fit('crop').url()}
                alt={article.coverImage.alt ?? article.title}
                className={styles.coverImg}
              />
            </div>
          ) : null}

          <article className={styles.body}>
            <section className={styles.preview}>
              <h2 className={styles.bodyHeading}>Résumé</h2>
              <ProseFromPortableText value={article.excerpt} />
            </section>

            {isGated ? (
              <ContentGate />
            ) : article.commentary && article.commentary.length > 0 ? (
              <section className={styles.commentary}>
                <h2 className={styles.bodyHeading}>Commentaire éditorial</h2>
                <ProseFromPortableText value={article.commentary} />
              </section>
            ) : null}
          </article>

          <div className={styles.footerNav}>
            <Link href="/articles-scientifiques" className={styles.backLink}>
              ← Retour aux articles scientifiques
            </Link>
          </div>
        </div>
      </div>
    </section>
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
          Le commentaire éditorial est réservé aux membres inscrits.
        </h3>
        <p className={styles.gateDesc}>
          Créez un compte gratuit pour accéder aux analyses de notre comité scientifique.
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
