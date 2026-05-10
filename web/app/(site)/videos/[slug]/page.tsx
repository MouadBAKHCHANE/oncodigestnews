import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { ProseFromPortableText, blocksToPlainText } from '@/lib/sanity/portableText';
import { Button } from '@/components/ui/Button';
import { TitleReveal } from '@/components/ui/TitleReveal';
import { getProfile, canViewPro } from '@/lib/auth';
import styles from './video-detail.module.css';

export const revalidate = 600;

interface Speaker {
  _id: string;
  name: string;
  role?: string | null;
  photo?: (SanityImage & { alt?: string }) | null;
}

interface VideoDetail {
  _id: string;
  title: string;
  slug: { current: string };
  videoUrl?: string | null;
  thumbnail?: (SanityImage & { alt?: string }) | null;
  durationSeconds?: number | null;
  publishedAt?: string | null;
  access: 'public' | 'pro';
  description?: PortableTextBlock[] | null;
  category?: { title: string; slug?: { current: string } } | null;
  speakers?: Speaker[] | null;
}

const detailQuery = /* groq */ `*[_type == "video" && slug.current == $slug][0]{
  _id, title, slug, videoUrl, thumbnail, durationSeconds, publishedAt, access, description,
  "category": category->{title, "slug": slug},
  "speakers": speakers[]->{ _id, name, role, photo }
}`;

function youtubeIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (/(^|\.)youtu\.be$/i.test(u.hostname)) {
      return u.pathname.replace(/^\//, '').split('/')[0] || null;
    }
    if (/(^|\.)youtube\.com$/i.test(u.hostname)) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const m = /^\/(embed|shorts)\/([\w-]+)/.exec(u.pathname);
      if (m) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await sanityClient.fetch<{
    title: string;
    description?: PortableTextBlock[] | null;
  } | null>(
    /* groq */ `*[_type == "video" && slug.current == $slug][0]{ title, description }`,
    { slug },
  );
  if (!video) return { title: 'Vidéo introuvable' };
  return {
    title: video.title,
    description: blocksToPlainText(video.description).slice(0, 160) || undefined,
  };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile();

  const video = await sanityClient.fetch<VideoDetail | null>(detailQuery, { slug });
  if (!video) notFound();

  const isGated = video.access === 'pro' && !canViewPro(profile);
  const ytId = youtubeIdFromUrl(video.videoUrl);
  const ytEmbed = ytId
    ? `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`
    : null;

  const formattedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const duration = formatDuration(video.durationSeconds);

  const posterUrl = video.thumbnail
    ? urlForImage(video.thumbnail).width(1280).height(720).fit('crop').url()
    : ytId
      ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`
      : null;

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
            <Link href="/videos">Vidéos</Link>
            {video.category ? (
              <>
                <span aria-hidden>›</span>
                <span>{video.category.title}</span>
              </>
            ) : null}
            <span aria-hidden>›</span>
            <span className={styles.breadcrumbCurrent}>{video.title}</span>
          </nav>

          <header className={styles.header}>
            {video.category?.title ? (
              <span className={styles.eyebrow}>{video.category.title}</span>
            ) : null}
            <TitleReveal as="h1" className={styles.title}>
              {video.title}
            </TitleReveal>
            <div className={styles.metaLine}>
              {formattedDate ? <span>{formattedDate}</span> : null}
              {duration ? (
                <>
                  <span className={styles.metaDot} aria-hidden />
                  <span>{duration}</span>
                </>
              ) : null}
              {video.access === 'pro' ? (
                <>
                  <span className={styles.metaDot} aria-hidden />
                  <span className={styles.proTag}>🔒 Pro</span>
                </>
              ) : null}
            </div>
          </header>

          <article className={styles.player}>
            {isGated ? (
              <div className={styles.gateWrap}>
                {posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterUrl} alt={video.title} className={styles.gatePoster} />
                ) : null}
                <div className={styles.gateOverlay}>
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
                      Cette vidéo est réservée aux membres inscrits.
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
              </div>
            ) : ytEmbed ? (
              <div className={styles.iframeWrap}>
                <iframe
                  className={styles.iframe}
                  src={ytEmbed}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : video.videoUrl ? (
              // Non-YouTube fallback (Vimeo / mp4 / etc.) — show a "watch externally" link
              <div className={styles.externalFallback}>
                <p className={styles.externalText}>
                  Cette vidéo est hébergée en externe.
                </p>
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  Ouvrir la vidéo
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/arrow-dots.svg" alt="" width={16} height={16} aria-hidden />
                </a>
              </div>
            ) : (
              <p className={styles.empty}>Cette vidéo n&apos;est plus disponible.</p>
            )}
          </article>

          {video.description && video.description.length > 0 ? (
            <section className={styles.body}>
              <ProseFromPortableText value={video.description} />
            </section>
          ) : null}

          {video.speakers && video.speakers.length > 0 ? (
            <section className={styles.speakers}>
              <h2 className={styles.sectionHeading}>
                {video.speakers.length > 1 ? 'Intervenant·e·s' : 'Intervenant·e'}
              </h2>
              <ul className={styles.speakerList}>
                {video.speakers.map((s) => {
                  const initials = s.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join('');
                  return (
                    <li key={s._id} className={styles.speakerCard}>
                      <div className={styles.speakerAvatar} aria-hidden>
                        {s.photo ? (
                          <Image
                            src={urlForImage(s.photo).width(160).height(160).url()}
                            alt={s.photo.alt ?? s.name}
                            width={64}
                            height={64}
                          />
                        ) : (
                          <span>{initials || 'OD'}</span>
                        )}
                      </div>
                      <div className={styles.speakerBody}>
                        <span className={styles.speakerName}>{s.name}</span>
                        {s.role ? (
                          <span className={styles.speakerRole}>{s.role}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <div className={styles.footerNav}>
            <Link href="/videos" className={styles.backLink}>
              ← Retour à toutes les vidéos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
