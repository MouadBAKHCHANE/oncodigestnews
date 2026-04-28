'use client';

import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Magnetic button effect — tracks mouse within 80px of the button and
 * translates it toward the cursor at strength = (1 - dist/80) * 0.15.
 *
 * Verbatim port of index.html lines 3881-3910. Listens on the *parent*
 * element so the button can translate freely without the cursor leaving
 * its hover area.
 *
 * Disabled on:
 *   - Touch devices (`'ontouchstart' in window`)
 *   - Viewports < 1024px
 *   - prefers-reduced-motion
 */
export function useMagneticButton<T extends HTMLElement>(ref: RefObject<T | null>) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) return;
    if ('ontouchstart' in window) return;
    if (window.innerWidth < 1024) return;

    const btn = ref.current;
    if (!btn) return;
    const parent = btn.parentElement;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const strength = (1 - dist / 80) * 0.15;
        btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      }
    };

    const onLeave = () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
      window.setTimeout(() => {
        btn.style.transition = '';
      }, 400);
    };

    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    return () => {
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
      btn.style.transform = '';
      btn.style.transition = '';
    };
  }, [ref, reducedMotion]);
}
