'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true if the user has `prefers-reduced-motion: reduce` set.
 * Other animation hooks should consult this and short-circuit when true.
 *
 * Defaults to false during SSR (we can't read media queries server-side);
 * the value updates after first client paint.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
