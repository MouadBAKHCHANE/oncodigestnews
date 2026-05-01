'use client';

import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseAdvisorPeelOptions {
  scrollSpaceRef: RefObject<HTMLElement | null>;
  cardsAreaRef: RefObject<HTMLElement | null>;
  /** Selector inside cardsAreaRef to find the cards (default: '.advisor_card'). */
  cardSelector?: string;
  /** Optional refs that fade in based on scroll progress. */
  descRef?: RefObject<HTMLElement | null>;
  buttonsRef?: RefObject<HTMLElement | null>;
  desktopMinWidth?: number;
}

interface StackConfig {
  dx: number;
  dy: number;
  r: number;
  z: number;
}

const STACK_CONFIGS: StackConfig[] = [
  { dx: -18, dy: -8, r: -2.5, z: 3 },
  { dx: 12, dy: 6, r: 1.8, z: 2 },
  { dx: -6, dy: 14, r: -1.2, z: 1 },
];

const CARD_TIMINGS = [
  { start: 0.08, end: 0.33 },
  { start: 0.22, end: 0.48 },
  { start: 0.36, end: 0.62 },
];

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * Stacked-dossiers reveal — three advisor cards start as a tilted stack and
 * "peel" off into a row as the user scrolls. Each card has its own start/end
 * progress window with easeOutBack easing; quote + info reveal once the card
 * settles 75% into place.
 *
 * Verbatim port of the IIFE in index.html lines 3573-3700. Disabled on
 * mobile / reduced-motion (cards just appear in their final positions).
 */
export function useAdvisorPeel({
  scrollSpaceRef,
  cardsAreaRef,
  cardSelector = '.advisor_card',
  descRef,
  buttonsRef,
  desktopMinWidth = 1024,
}: UseAdvisorPeelOptions) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrollSpace = scrollSpaceRef.current;
    const cardsArea = cardsAreaRef.current;
    if (!scrollSpace || !cardsArea) return;

    const cards = Array.from(cardsArea.querySelectorAll<HTMLElement>(cardSelector));
    if (cards.length === 0) return;

    const isMobile = window.innerWidth < desktopMinWidth;

    // Mobile / reduced motion: place cards in final state and exit.
    if (reducedMotion || isMobile) {
      cards.forEach((c) => c.classList.add('placed'));
      descRef?.current?.classList.add('visible');
      buttonsRef?.current?.classList.add('visible');
      return;
    }

    // Per-card stack offsets (memoized in element refs).
    const offsets: { dx: number; dy: number; r: number; z: number }[] = [];

    function calcOffsets() {
      const areaW = cardsArea!.offsetWidth;
      offsets.length = 0;
      cards.forEach((card, i) => {
        const cardW = card.offsetWidth;
        const centerX = (areaW - cardW) / 2;
        const cardLeft = card.offsetLeft;
        const cfg = STACK_CONFIGS[i] ?? STACK_CONFIGS[STACK_CONFIGS.length - 1];
        offsets[i] = {
          dx: centerX - cardLeft + cfg.dx,
          dy: cfg.dy,
          r: cfg.r,
          z: cfg.z,
        };
      });

      // Initial stacked state.
      cards.forEach((card, i) => {
        const o = offsets[i];
        if (!o) return;
        card.style.transform = `translateX(${o.dx}px) translateY(${o.dy}px) rotate(${o.r}deg)`;
        card.style.zIndex = String(o.z);
      });
    }

    calcOffsets();
    window.addEventListener('resize', calcOffsets);

    let ticking = false;

    const update = () => {
      const rect = scrollSpace.getBoundingClientRect();
      const scrollH = scrollSpace.offsetHeight - window.innerHeight;
      if (scrollH <= 0) return;
      let progress = -rect.top / scrollH;
      progress = Math.max(0, Math.min(1, progress));

      cards.forEach((card, i) => {
        const timing = CARD_TIMINGS[i] ?? CARD_TIMINGS[CARD_TIMINGS.length - 1];
        const o = offsets[i];
        if (!o) return;
        const cardProg = Math.max(
          0,
          Math.min(1, (progress - timing.start) / (timing.end - timing.start)),
        );
        const eased = easeOutBack(cardProg);

        const dx = o.dx * (1 - eased);
        const dy = o.dy * (1 - eased);
        const r = o.r * (1 - eased);

        card.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${r}deg)`;
        card.style.zIndex = String(cardProg < 0.95 ? o.z : 1);

        if (cardProg > 0.02 && cardProg < 0.85) {
          const lift = Math.sin(cardProg * Math.PI);
          card.style.boxShadow = `0 ${(4 + lift * 24).toFixed(1)}px ${(12 + lift * 40).toFixed(1)}px rgba(0,0,0,${(0.04 + lift * 0.08).toFixed(3)})`;
        } else if (cardProg >= 0.85) {
          card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
        }

        if (cardProg > 0.75) card.classList.add('placed');
        else card.classList.remove('placed');
      });

      if (descRef?.current) {
        descRef.current.classList.toggle('visible', progress > 0.3);
      }
      if (buttonsRef?.current) {
        buttonsRef.current.classList.toggle('visible', progress > 0.72);
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
      window.removeEventListener('resize', calcOffsets);
    };
  }, [scrollSpaceRef, cardsAreaRef, cardSelector, descRef, buttonsRef, desktopMinWidth, reducedMotion]);
}
