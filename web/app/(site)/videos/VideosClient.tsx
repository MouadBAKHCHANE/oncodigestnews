'use client';

import { useMemo, useState } from 'react';
import { VideoCard, type VideoCardData } from '@/components/cards/VideoCard';
import { FilterPills, type FilterPill } from '@/components/ui/FilterPills';
import styles from './videos.module.css';

interface CategoryOption {
  title: string;
  slug: string;
}

interface VideosClientProps {
  videos: VideoCardData[];
  categories: CategoryOption[];
}

const ALL = '__all__';

export function VideosClient({ videos, categories }: VideosClientProps) {
  const [category, setCategory] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (category === ALL) return videos;
    return videos.filter((v) => v.category?.slug?.current === category);
  }, [videos, category]);

  const pills: FilterPill[] = [
    { value: ALL, label: 'Tous' },
    ...categories.map((c) => ({ value: c.slug, label: c.title })),
  ];

  return (
    <>
      {pills.length > 1 ? (
        <div className={styles.filterRow}>
          <FilterPills pills={pills} value={category} onChange={setCategory} />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className={styles.empty}>Aucune vidéo ne correspond à ce filtre.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((video, i) => (
            <VideoCard
              key={video._id}
              video={video}
              animationDelay={((i % 3) + 1) as 1 | 2 | 3}
            />
          ))}
        </div>
      )}
    </>
  );
}
