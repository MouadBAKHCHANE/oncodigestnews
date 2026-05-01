'use client';

import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseHeroParallaxOptions {
  sectionRef: RefObject<HTMLElement | null>;
  imgRef: RefObject<HTMLElement | null>;
  /** Optional overlay that gets `is-outside` toggled when the image scrolls past it. */
  overlayRef?: RefObject<HTMLElement | null>;
  /** Class name to toggle on the overlay (defaults to 'is-outside' to match the original CSS). */
  overlayOutsideClass?: string;
  /** Parallax speed multiplier. Default 0.3 — image moves at 30% of scroll. */
  speed?: number;
  /** Disable on viewports below this width. Default 1024. */
  desktopMinWidth?: number;
}

/**
 * Hero section parallax — the image slides up at 0.3x scroll speed; an
 * `is-outside` class toggles on the advisor overlay when the image has
 * scrolled high enough to leave the overlay sitting on the dark background
 * below.
 *
 * Verbatim port of the IIFE in index.html lines 3795-3821, with the
 * desktop-only gate that the original applies via the same scroll listener.
 *
 * Disabled when:
 *   - prefers-reduced-motion
 *   - viewport width < desktopMinWidth
 */
export function useHeroParallax({
  sectionRef,
  imgRef,
  overlayRef,
  overlayOutsideClass = 'is-outside',
  speed = 0.3,
  desktopMinWidth = 1024,
}: UseHeroParallaxOptions) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedMotion) return;
    if (window.innerWidth < desktopMinWidth) return;

    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    let raf = 0;

    const update = () => {
      const scrollY = window.scrollY;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollInSection = scrollY - sectionTop;
      const visible =
        scrollY < sectionTop + sectionHeight && scrollY + window.innerHeight > sectionTop;
      if (!visible) return;

      const parallaxOffset = Math.max(0, scrollInSection * speed);
      img.style.transform = `translateY(${parallaxOffset}px)`;

      const overlay = overlayRef?.current;
      if (overlay && overlay.parentElement) {
        const wrapperRect = overlay.parentElement.getBoundingClientRect();
        const imgNaturalBottom = wrapperRect.top + img.offsetHeight - parallaxOffset;
        const overlayTop = overlay.getBoundingClientRect().top;
        if (imgNaturalBottom < overlayTop + 30) {
          overlay.classList.add(overlayOutsideClass);
        } else {
          overlay.classList.remove(overlayOutsideClass);
        }
      }
    };

    const onScroll = () => {
      // requestAnimationFrame coalesces redundant scroll events at 60fps.
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, imgRef, overlayRef, overlayOutsideClass, speed, desktopMinWidth, reducedMotion]);
}
