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
  {
    number: '05',
    title: 'Événements',
    heading: 'Rencontres et formations continues.',
    text: 'Participez à nos masterclasses, ateliers pratiques et journées de formation dédiées aux professionnels de la chirurgie et de l\'oncologie.',
    illustration: 'abstract',
    illustrationLabel: 'Illustration — Événements',
    ctaHref: '/evenements',
    ctaLabel: 'Voir les événements',
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

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollPills = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          
          {/* Mobile Category Switcher (Visible only on mobile/tablet) */}
          <div className={styles.mobileSwitcherContainer}>
            <button className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`} onClick={() => scrollPills('left')} aria-label="Scroll left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div className={styles.mobileSwitcher} ref={scrollRef}>
              {ITEMS.map((item, i) => (
                <button
                  key={item.number}
                  onClick={() => setActiveIndex(i)}
                  className={`${styles.mobilePill} ${i === activeIndex ? styles.mobilePillActive : ''}`}
                >
                  <span className={styles.pillNum}>{item.number}</span>
                  <span className={styles.pillTitle}>{item.title}</span>
                </button>
              ))}
            </div>
            <button className={`${styles.scrollArrow} ${styles.scrollArrowRight}`} onClick={() => scrollPills('right')} aria-label="Scroll right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <div className={styles.grid}>

            {/* ── Left: scrollable image stack (Desktop only, or used as the image source on mobile) ── */}
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
                    <div className={styles.legend}>
                      <span className={styles.legendNum}>{item.number}</span>
                      <span className={styles.legendText}>{item.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right: sticky text panel ── */}
            <div className={styles.textColumn}>
              <div className={styles.stickyPanel}>

                {/* Desktop Item List */}
                <ul className={styles.itemList}>
                  {ITEMS.map((item, i) => (
                    <li
                      key={item.number}
                      onClick={() => setActiveIndex(i)}
                      className={`${styles.itemRow} ${i === activeIndex ? styles.itemRowActive : ''}`}
                      aria-current={i === activeIndex ? 'true' : undefined}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={styles.itemNumber}>{item.number}</span>
                      <span className={styles.itemTitle}>{item.title}</span>
                    </li>
                  ))}
                </ul>

                {/* Mobile Active Illustration (Visible only on mobile/tablet) */}
                <div className={styles.mobileImage}>
                  <div className={styles.imageFrame}>
                    <BrandIllustration variant={active.illustration} label={active.illustrationLabel} />
                  </div>
                </div>

                {/* Active heading + description + CTA */}
                <div key={active.number} className={`${styles.activePanel} ${reducedMotion ? '' : styles.activePanelAnimate}`}>
                  <h3 className={styles.activeHeading}>{active.heading}</h3>
                  <p className={styles.activeText}>{active.text}</p>
                  
                  <div className={styles.ctaWrapper}>
                    <Link href={active.ctaHref} className={styles.activeCta}>
                      <span className={styles.ctaLabel}>{active.ctaLabel}</span>
                      <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
