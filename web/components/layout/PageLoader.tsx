'use client';

import { useEffect, useState } from 'react';
import styles from './PageLoader.module.css';

const SESSION_KEY = 'oncodigest-visited';

/**
 * Page loader — fades out 800ms after first paint, then disabled for the
 * rest of the session via sessionStorage. Behavior matches the original
 * inline IIFE in index.html (lines 3153-3168).
 *
 * Skipped entirely if the user prefers reduced motion (CSS rule).
 */
export function PageLoader() {
  const [hidden, setHidden] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (sessionStorage.getItem(SESSION_KEY)) {
      // Returning visit — never show the loader (don't even render it after the
      // hydration tick to avoid a flash).
      setHidden(true);
      const t = window.setTimeout(() => setShouldRender(false), 50);
      return () => window.clearTimeout(t);
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    const onLoad = () => {
      window.setTimeout(() => setHidden(true), 800);
      // Unmount after the fade completes so it doesn't intercept clicks.
      window.setTimeout(() => setShouldRender(false), 1500);
    };
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.pageLoader} ${hidden ? styles.isHidden : ''}`}
      aria-hidden
      role="presentation"
    >
      <span className={styles.logoMark}>OncoDigest</span>
    </div>
  );
}
