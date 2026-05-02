'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useTypewriter } from '@/lib/hooks/useTypewriter';
import styles from './Hero.module.css';

interface HeroProps {
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

const TOPICS = [
  { label: 'Actualités', href: '/actualites' },
  { label: 'Articles scientifiques', href: '/articles-scientifiques' },
  { label: 'Congrès', href: '/congres' },
  { label: 'Vidéos', href: '/videos' },
];

export function Hero({
  imageUrl,
  imageAlt = 'OncoDigest',
  typewriterWords = DEFAULT_WORDS,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const text = useTypewriter({ words: typewriterWords });

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Animated background ── */}
      <div className={styles.heroBg} aria-hidden>
        <div className={`${styles.bgRing} ${styles.bgRingA}`} />
        <div className={`${styles.bgRing} ${styles.bgRingB}`} />
        <div className={`${styles.bgRing} ${styles.bgRingC}`} />
        <div className={`${styles.bgLine} ${styles.bgLineA}`} />
        <div className={`${styles.bgLine} ${styles.bgLineB}`} />
        <div className={`${styles.bgDot} ${styles.bgDotA}`} />
        <div className={`${styles.bgDot} ${styles.bgDotB}`} />
        <div className={`${styles.bgDot} ${styles.bgDotC}`} />
      </div>

      <div className={styles.padding}>
        <div className={styles.grid}>

          {/* ── Left ── */}
          <div className={styles.left}>

            <h1 className={`${styles.h1} animate-on-scroll`}>
              L&apos;information{' '}
              <em className={styles.h1Em}>oncologique</em>,
              <br />
              rigoureuse et accessible.
            </h1>

            <div className={styles.divider} aria-hidden />

            <div className={styles.typewriterWrapper}>
              <span className={styles.typewriterPrefix}>Pour&nbsp;</span>
              <span className={styles.typewriterText}>{text}</span>
              <span className={styles.typewriterCursor} />
            </div>

            <div className={`${styles.actions} animate-on-scroll delay-2`}>
              <Link href="/actualites" className={styles.btnDark}>
                Découvrir nos contenus
              </Link>
            </div>

            <nav className={styles.topics} aria-label="Rubriques">
              {TOPICS.map(({ label, href }) => (
                <Link key={href} href={href} className={styles.topicPill}>
                  {label}
                </Link>
              ))}
            </nav>

          </div>

        </div>
      </div>
    </section>
  );
}
