'use client';

import { useEffect, useState } from 'react';
import styles from './BackToTop.module.css';

const SHOW_AFTER = 600; // px

/**
 * Floating "back to top" arrow — fades in once the user has scrolled past
 * `SHOW_AFTER` pixels, then smooth-scrolls to the top on click. Honors
 * `prefers-reduced-motion` (no smooth scroll, instant jump).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const compute = () => {
      const next = window.scrollY > SHOW_AFTER;
      setVisible((prev) => (prev === next ? prev : next));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${visible ? styles.btnVisible : ''}`}
      aria-label="Retour en haut de page"
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
}
