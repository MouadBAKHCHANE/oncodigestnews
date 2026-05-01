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
  durationSeconds: number;
  publishedAt?: string;
  access: 'public' | 'pro';
  category?: { title: string; slug?: { current: string } } | null;
  /** Optional speaker(s) summary line, e.g. "Dr. M. Dhib" or "Dr. X · Dr. Y". */
  speakerLine?: string | null;
  /** Override default tag (defaults to category title or empty). */
  tag?: string | null;
}

interface VideoCardProps {
  video: VideoCardData;
  /** Defaults to /videos/[slug] (real route arrives in Phase 6). */
  href?: string;
  animationDelay?: 1 | 2 | 3;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')}`;
}

export function VideoCard({ video, href, animationDelay }: VideoCardProps) {
  const linkHref = href ?? `/videos/${video.slug.current}`;
  const isLocked = video.access === 'pro';
  const tag = video.tag ?? video.category?.title ?? null;
  const duration = formatDuration(video.durationSeconds);
  const formattedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('fr-FR', {
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
        ) : (
          <div className={styles.imgPlaceholder} aria-hidden />
        )}

        <div className={styles.playIcon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {duration ? <span className={styles.durationBadge}>{duration}</span> : null}

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
        {formattedDate ? <p className={styles.date}>{formattedDate}</p> : null}
      </div>
    </Card>
  );
}
