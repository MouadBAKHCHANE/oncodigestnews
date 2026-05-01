import Link from 'next/link';
import { VideoCard, type VideoCardData } from '@/components/cards/VideoCard';
import { Button } from '@/components/ui/Button';
import styles from './LivesPreviewSection.module.css';

interface LivesPreviewSectionProps {
  videos: VideoCardData[];
}

export function LivesPreviewSection({ videos }: LivesPreviewSectionProps) {
  if (videos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.header}>
            <div>
              <span className={`${styles.eyebrow} animate-on-scroll`}>Vidéos & Lives</span>
              <h2 className={`${styles.heading} animate-on-scroll delay-1`}>
                Conférences, interviews et lives.
              </h2>
            </div>
            <Link href="/videos" className={`${styles.headerLink} animate-on-scroll delay-2`}>
              Voir tout →
            </Link>
          </div>

          <div className={styles.grid}>
            {videos.slice(0, 3).map((v, i) => (
              <VideoCard key={v._id} video={v} animationDelay={((i % 3) + 1) as 1 | 2 | 3} />
            ))}
          </div>

          <div className={`${styles.cta} animate-on-scroll delay-3`}>
            <Button href="/videos" variant="dark" size="sm">
              Voir le calendrier des lives →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
