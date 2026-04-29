'use client';

import { useAnimateOnScroll } from '@/lib/hooks/useAnimateOnScroll';

/**
 * Renderless component that mounts site-wide DOM-dependent effects.
 *
 * Currently active:
 *   - elements with `animate-on-scroll` fade in via IntersectionObserver
 *
 * Removed (Phase 3.1): scroll-driven body bg transition. The site now uses
 * a unified husk-50 background everywhere; the original scroll transition
 * caused premature cream tinting on short pages and is no longer needed.
 * The hook still exists in lib/hooks/useScrollBackground.ts if a future
 * design decision restores it.
 */
export function SiteEffects() {
  useAnimateOnScroll();
  return null;
}
