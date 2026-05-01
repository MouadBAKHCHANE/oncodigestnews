'use client';

import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseVenetianRevealOptions {
  scrollSpaceRef: RefObject<HTMLElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  bgHeadingRef?: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLElement | null>;
  imageUrl: string;
  stripCount?: number;
  /** Disable on viewports below this width. Default 1024. */
  desktopMinWidth?: number;
}

/**
 * Venetian-blind reveal — sticky-scrolled section where horizontal strips of
 * an image slide in from alternating sides, gaps close, motion blur fades,
 * and a frosted text panel materializes once the image is assembled.
 *
 * Verbatim port of the IIFE in index.html lines 3451-3570.
 *
 * Layout requirement: scrollSpaceRef should be 220vh tall, with a sticky
 * inner element (height 100vh) containing the container div for the strips.
 */
export function useVenetianReveal({
  scrollSpaceRef,
  containerRef,
  bgHeadingRef,
  panelRef,
  imageUrl,
  stripCount = 10,
  desktopMinWidth = 1024,
}: UseVenetianRevealOptions) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrollSpace = scrollSpaceRef.current;
    const container = containerRef.current;
    if (!scrollSpace || !container) return;

    const isMobile = window.innerWidth < desktopMinWidth;
    const OVERLAP = 0.5;

    // Build strips fresh on every mount.
    container.replaceChildren();
    const strips: HTMLDivElement[] = [];
    for (let i = 0; i < stripCount; i += 1) {
      const strip = document.createElement('div');
      strip.className = 'promesse_strip';
      const stripH = 100 / stripCount;
      strip.style.position = 'absolute';
      strip.style.left = '0';
      strip.style.width = '100%';
      strip.style.backgroundRepeat = 'no-repeat';
      strip.style.willChange = 'transform, filter, box-shadow';
      strip.style.height = `${stripH + OVERLAP}%`;
      strip.style.top = `${i * stripH}%`;
      strip.style.backgroundImage = `url("${imageUrl}")`;
      strip.style.backgroundSize = `100% ${stripCount * 100}%`;
      strip.style.backgroundPosition = `center ${(i / (stripCount - 1)) * 100}%`;
      strip.dataset.dir = i % 2 === 0 ? '-1' : '1';

      if (!reducedMotion && !isMobile) {
        strip.style.transform = `translateX(${parseInt(strip.dataset.dir, 10) * 110}%)`;
      }
      container.appendChild(strip);
      strips.push(strip);
    }

    if (reducedMotion || isMobile) {
      panelRef?.current?.classList.add('visible');
      return () => container.replaceChildren();
    }

    let ticking = false;
    const update = () => {
      const rect = scrollSpace.getBoundingClientRect();
      const scrollH = scrollSpace.offsetHeight - window.innerHeight;
      if (scrollH <= 0) return;
      let progress = -rect.top / scrollH;
      progress = Math.max(0, Math.min(1, progress));

      strips.forEach((strip, i) => {
        const dir = parseInt(strip.dataset.dir ?? '1', 10);
        const stagger = i * 0.025;
        const stripProg = Math.max(0, Math.min(1, (progress - stagger) / 0.42));
        const eased = 1 - Math.pow(1 - stripProg, 3);
        const xOffset = (1 - eased) * dir * 110;

        const gapProg = Math.max(0, Math.min(1, (progress - 0.35) / 0.25));
        const gapEased = 1 - Math.pow(1 - gapProg, 2);
        const maxGap = 5;
        const currentGap = maxGap * (1 - gapEased);
        const totalGap = (stripCount - 1) * currentGap;
        const yOffset = i * currentGap - totalGap / 2;

        strip.style.transform = `translateX(${xOffset}%) translateY(${yOffset}px)`;

        const velocity = Math.abs(1 - eased);
        const blurAmount = velocity * 3;
        strip.style.filter = blurAmount > 0.1 ? `blur(${blurAmount.toFixed(1)}px)` : 'none';

        const shadowStrength = (1 - gapEased) * 0.08;
        if (shadowStrength > 0.005) {
          strip.style.boxShadow = `0 2px 6px rgba(0,0,0,${shadowStrength.toFixed(3)}), 0 0 2px rgba(0,0,0,${(shadowStrength * 0.5).toFixed(3)})`;
        } else {
          strip.style.boxShadow = 'none';
        }
      });

      if (bgHeadingRef?.current) {
        const headingOpacity = 1 - Math.max(0, Math.min(1, (progress - 0.25) / 0.25));
        bgHeadingRef.current.style.opacity = String(headingOpacity);
      }

      if (panelRef?.current) {
        if (progress > 0.55) panelRef.current.classList.add('visible');
        else panelRef.current.classList.remove('visible');
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      container.replaceChildren();
    };
  }, [
    scrollSpaceRef,
    containerRef,
    bgHeadingRef,
    panelRef,
    imageUrl,
    stripCount,
    desktopMinWidth,
    reducedMotion,
  ]);
}
