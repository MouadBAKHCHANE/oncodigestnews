'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useHeroParallax } from '@/lib/hooks/useHeroParallax';
import { useTypewriter } from '@/lib/hooks/useTypewriter';
import { BrandIllustration } from '@/components/ui/BrandIllustration';
import styles from './Hero.module.css';

interface HeroProps {
  /** Sanity-hosted hero image URL. When omitted, a BrandIllustration is rendered. */
  imageUrl?: string | null;
  imageAlt?: string;
  typewriterWords?: string[];
}

const DEFAULT_WORDS = [
  'les chirurgiens',
  'les oncologues',
  'les gastro-entérologues',
  'les internes',
];

export function Hero({
  imageUrl,
  imageAlt = 'OncoDigest',
  typewriterWords = DEFAULT_WORDS,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useHeroParallax({ sectionRef, imgRef });
  const text = useTypewriter({ words: typewriterWords });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.padding}>
        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.topContent}>
              <h1 className={`${styles.h1} animate-on-scroll`}>
                L&apos;information oncologique,
                <br />
                rigoureuse et accessible.
              </h1>

              <div className={styles.typewriterWrapper}>
                <span className={styles.typewriterPrefix}>Pour&nbsp;</span>
                <span className={styles.typewriterText}>{text}</span>
                <span className={styles.typewriterCursor} />
              </div>

              <div className={styles.btnGroup}>
                <Link href="/actualites" className={`${styles.btnDark} animate-on-scroll delay-1`}>
                  Découvrir nos contenus
                  <svg width="16" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M8 0.77C7.27 0.77 6.69 1.36 6.69 2.08C6.69 2.81 7.27 3.4 8 3.4C8.73 3.4 9.31 2.81 9.31 2.08C9.31 1.36 8.73 0.77 8 0.77Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8 5.77C7.27 5.77 6.69 6.36 6.69 7.08C6.69 7.81 7.27 8.4 8 8.4C8.73 8.4 9.31 7.81 9.31 7.08C9.31 6.36 8.73 5.77 8 5.77Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8 10.77C7.27 10.77 6.69 11.36 6.69 12.08C6.69 12.81 7.27 13.4 8 13.4C8.73 13.4 9.31 12.81 9.31 12.08C9.31 11.36 8.73 10.77 8 10.77Z"
                      fill="currentColor"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className={`${styles.tagline} animate-on-scroll delay-3`}>
              <p>
                OncoDigest réunit l&apos;essentiel de l&apos;actualité en chirurgie digestive et
                oncologie&nbsp;: articles, congrès, vidéos.
              </p>
            </div>
          </div>

          <div className={`${styles.right} animate-on-scroll delay-2`}>
            <div className={styles.imgWrapper}>
              <div className={styles.imgInner}>
                {imageUrl ? (
                  <Image
                    ref={imgRef}
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    priority
                    className={styles.img}
                    sizes="(max-width: 1024px) 100vw, 520px"
                  />
                ) : (
                  <BrandIllustration variant="hero" label={imageAlt} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
