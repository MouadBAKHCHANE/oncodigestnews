'use client';

import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Body background transition: white (#FFFFFF) → husk-50 (#F7F6EF) over the
 * first 50% of scroll depth, with smoothstep easing.
 *
 * Verbatim port of the IIFE in index.html lines 3174-3192.
 *
 * Mounts as a side-effect-only component; render once at the top of the site
 * layout. Reduced motion: skip the listener entirely (body keeps default bg).
 */
export function useScrollBackground() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) {
      document.body.style.backgroundColor = '';
      return;
    }

    const startR = 255;
    const startG = 255;
    const startB = 255;
    const endR = 247;
    const endG = 246;
    const endB = 239;

    const update = () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollMax <= 0) return;
      const progress = Math.min(window.scrollY / (scrollMax * 0.5), 1);
      const eased = progress * progress * (3 - 2 * progress);
      const r = Math.round(startR + (endR - startR) * eased);
      const g = Math.round(startG + (endG - startG) * eased);
      const b = Math.round(startB + (endB - startB) * eased);
      document.body.style.backgroundColor = `rgb(${r},${g},${b})`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', update);
      document.body.style.backgroundColor = '';
    };
  }, [reducedMotion]);
}
