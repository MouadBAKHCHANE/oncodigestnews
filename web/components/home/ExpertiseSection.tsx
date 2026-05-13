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
    text: 'Chaque semaine, les publications les plus pertinentes en chirurgie digestive et oncologie sélectionnées et commentées par nos experts pour la pratique clinique.',
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
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
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

  // Keep the active pill in view inside the horizontal scroller — scroll
  // it to the center as soon as the user advances past it via vertical scroll.
  useEffect(() => {
    const pill = pillRefs.current[activeIndex];
    if (!pill) return;
    pill.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex, reducedMotion]);

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          
          {/* Mobile Category Switcher (Visible only on mobile/tablet) */}
          <div className={styles.mobileSwitcherContainer}>
            <div className={styles.mobileSwitcher} ref={scrollRef}>
              {ITEMS.map((item, i) => (
                <button
                  key={item.number}
                  ref={(el) => {
                    pillRefs.current[i] = el;
                  }}
                  onClick={() => setActiveIndex(i)}
                  className={`${styles.mobilePill} ${i === activeIndex ? styles.mobilePillActive : ''}`}
                >
                  <span className={styles.pillNum}>{item.number}</span>
                  <span className={styles.pillTitle}>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.grid}>

            {/* ── Left: scrollable image stack (desktop) / full scene per item (mobile) ── */}
            <div className={styles.imageColumn}>
              {ITEMS.map((item, i) => (
                <div
                  key={item.number}
                  ref={(el) => {
                    sceneRefs.current[i] = el;
                  }}
                  /* className MUST stay static across renders — the global
                     IntersectionObserver toggles `.visible` on this element
                     and any reactive className change would strip it. The
                     active state is exposed via data-active for CSS. */
                  className={`${styles.scene} animate-on-scroll`}
                  data-active={i === activeIndex ? 'true' : undefined}
                >
                  <div className={styles.imageFrame}>
                    <BrandIllustration variant={item.illustration} label={item.illustrationLabel} />
                    <div className={styles.legend}>
                      <span className={styles.legendNum}>{item.number}</span>
                      <span className={styles.legendText}>{item.title}</span>
                    </div>
                  </div>

                  {/* Mobile-only inline text per scene — drives scroll-through navigation */}
                  <div className={`${styles.sceneText} animate-on-scroll delay-1`}>
                    <h3 className={styles.sceneHeading}>{item.heading}</h3>
                    <p className={styles.sceneDesc}>{item.text}</p>
                    <Link href={item.ctaHref} className={styles.sceneCta}>
                      <span>{item.ctaLabel}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
                    </Link>
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
