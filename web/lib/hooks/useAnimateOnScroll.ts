'use client';

import { useEffect } from 'react';

/**
 * Mounts a single IntersectionObserver that adds `visible` to any element
 * with the `animate-on-scroll` class once it crosses 10% into the viewport.
 *
 * Verbatim port of the observer in index.html line 3265 (without the
 * word-animate split — that's its own hook).
 *
 * Idempotent: safe to call from the root site layout. The observer is
 * created once per page; its lifecycle ends on layout unmount.
 */
export function useAnimateOnScroll() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    const target = () => document.querySelectorAll('.animate-on-scroll:not(.visible)');

    target().forEach((el) => observer.observe(el));

    // Watch for nodes added later (e.g., after route transitions).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (!(n instanceof Element)) continue;
          if (n.classList?.contains('animate-on-scroll') && !n.classList.contains('visible')) {
            observer.observe(n);
          }
          n.querySelectorAll?.('.animate-on-scroll:not(.visible)').forEach((el) => observer.observe(el));
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);
}
