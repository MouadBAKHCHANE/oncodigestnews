'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BrandIllustration, type BrandVariant } from '@/components/ui/BrandIllustration';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './ExpertiseSection.module.css';

interface ExpertiseItem {
  number: string;
  title: string;
  heading: string;
  text: string;
  illustration: BrandVariant;
  illustrationLabel: string;
  ctaHref: string;
  ctaLabel: string;
}

const ITEMS: ExpertiseItem[] = [
  {
    number: '01',
    title: 'Actualités',
    heading: "L'actualité médicale, filtrée et expliquée.",
    text: 'Chaque semaine, les publications les plus pertinentes en chirurgie digestive et oncologie — sélectionnées et commentées par nos experts pour la pratique clinique.',
    illustration: 'digestive',
    illustrationLabel: 'Illustration — Actualités',
    ctaHref: '/actualites',
    ctaLabel: 'Voir les actualités',
  },
  {
    number: '02',
    title: 'Articles scientifiques',
    heading: 'De la technique opératoire aux résultats cliniques.',
    text: 'Chirurgie colorectale, hépatobiliaire, pancréatique, oncologie digestive — des analyses approfondies rédigées par des praticiens de terrain.',
    illustration: 'oncology',
    illustrationLabel: 'Illustration — Articles scientifiques',
    ctaHref: '/articles-scientifiques',
    ctaLabel: 'Voir les articles',
  },
  {
    number: '03',
    title: 'Congrès',
    heading: "L'essentiel des congrès, en synthèse.",
    text: "ASCO, ESMO, SFCD, JFHOD — nous couvrons les congrès majeurs avec des rapports structurés, des points clés et des interviews d'experts.",
    illustration: 'congress',
    illustrationLabel: 'Illustration — Congrès',
    ctaHref: '/congres',
    ctaLabel: 'Voir les rapports',
  },
  {
    number: '04',
    title: 'Vidéos',
    heading: 'Voir pour comprendre : chirurgie et oncologie en image.',
    text: "Webinaires, interviews d'experts, replays de conférences — des formats vidéo conçus pour enrichir la pratique et rester à la pointe de son domaine.",
    illustration: 'hero',
    illustrationLabel: 'Illustration — Vidéos',
    ctaHref: '/videos',
    ctaLabel: 'Voir les vidéos',
  },
];

export function ExpertiseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reducedMotion = useReducedMotion();

  // Track which scene is closest to the viewport center → that's the active one
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const compute = () => {
      const center = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      sceneRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const sceneCenter = rect.top + rect.height / 2;
        const dist = Math.abs(sceneCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        compute();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const active = ITEMS[activeIndex];

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.grid}>

            {/* ── Left: scrollable image stack ── */}
            <div className={styles.imageColumn}>
              {ITEMS.map((item, i) => (
                <div
                  key={item.number}
                  ref={(el) => {
                    sceneRefs.current[i] = el;
                  }}
                  className={`${styles.scene} ${i === activeIndex ? styles.sceneActive : ''}`}
                >
                  <div className={styles.imageFrame}>
                    <BrandIllustration variant={item.illustration} label={item.illustrationLabel} />
                    {/* Bottom-left label — current item legend */}
                    <div className={styles.legend}>
                      <span className={styles.legendNum}>{item.number}</span>
                      <span className={styles.legendText}>{item.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right: sticky text panel — heading + desc + CTA fade with active ── */}
            <div className={styles.textColumn}>
              <div className={styles.stickyPanel}>

                {/* Item index list (no expand/collapse, just labels with active state) */}
                <ul className={styles.itemList}>
                  {ITEMS.map((item, i) => (
                    <li
                      key={item.number}
                      className={`${styles.itemRow} ${i === activeIndex ? styles.itemRowActive : ''}`}
                      aria-current={i === activeIndex ? 'true' : undefined}
                    >
                      <span className={styles.itemNumber}>{item.number}</span>
                      <span className={styles.itemTitle}>{item.title}</span>
                    </li>
                  ))}
                </ul>

                {/* Active heading + description + CTA — keyed so it remounts on change */}
                <div key={active.number} className={`${styles.activePanel} ${reducedMotion ? '' : styles.activePanelAnimate}`}>
                  <h3 className={styles.activeHeading}>{active.heading}</h3>
                  <p className={styles.activeText}>{active.text}</p>
                  <Link href={active.ctaHref} className={styles.activeCta}>
                    {active.ctaLabel}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
