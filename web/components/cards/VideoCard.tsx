import Image from 'next/image';
import type { Image as SanityImage } from 'sanity';
import { Card } from './Card';
import { urlForImage } from '@/lib/sanity/image';
import styles from './VideoCard.module.css';

export interface VideoCardData {
  _id: string;
  title: string;
  slug: { current: string };
  thumbnail: (SanityImage & { alt?: string }) | null;
  /** YouTube/Vimeo/MP4 URL — used as a thumbnail fallback when no Sanity image is set. */
  videoUrl?: string | null;
  access: 'public' | 'pro';
  category?: { title: string; slug?: { current: string } } | null;
  /** Optional speaker(s) summary line, e.g. "Dr. M. Dhib" or "Dr. X · Dr. Y". */
  speakerLine?: string | null;
  /** Override default tag (defaults to category title or empty). */
  tag?: string | null;
}

/** Extract the YouTube video id from a watch / youtu.be / shorts URL. Returns null otherwise. */
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

/** Detect a Google Drive share URL — returns true so the card can render a generic poster. */
function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return /(^|\.)drive\.google\.com$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

interface VideoCardProps {
  video: VideoCardData;
  /** Defaults to /videos/[slug] (real route arrives in Phase 6). */
  href?: string;
  animationDelay?: 1 | 2 | 3;
}

export function VideoCard({ video, href, animationDelay }: VideoCardProps) {
  const linkHref = href ?? `/videos/${video.slug.current}`;
  const isLocked = video.access === 'pro';
  const tag = video.tag ?? video.category?.title ?? null;

  const ytId = youtubeIdFromUrl(video.videoUrl);
  const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
  const isDrive = !ytId && !video.thumbnail && isGoogleDriveUrl(video.videoUrl);

  const animateClass = [
    'animate-on-scroll',
    animationDelay ? `delay-${animationDelay}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      href={linkHref}
      className={`${styles.videoCard} ${animateClass}`}
      ariaLabel={video.title}
    >
      <div className={styles.thumb}>
        {video.thumbnail ? (
          <Image
            src={urlForImage(video.thumbnail).width(800).height(450).url()}
            alt={video.thumbnail.alt ?? video.title}
            width={800}
            height={450}
            className={styles.img}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : ytThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ytThumb}
            alt={video.title}
            className={styles.img}
            loading="lazy"
          />
        ) : isDrive ? (
          <div className={styles.drivePoster} aria-hidden>
            <svg
              className={styles.driveIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span className={styles.driveLabel}>Vidéo</span>
          </div>
        ) : (
          <div className={styles.imgPlaceholder} aria-hidden />
        )}

        <div className={styles.playIcon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {isLocked ? (
          <div className={styles.lockBadge} aria-label="Vidéo réservée aux Pros">
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
        {tag ? <span className={styles.tag}>{tag}</span> : null}
        <h3 className={styles.title}>{video.title}</h3>
        {video.speakerLine ? <p className={styles.speaker}>{video.speakerLine}</p> : null}
      </div>
    </Card>
  );
}
