'use client';

import { useScrollBackground } from '@/lib/hooks/useScrollBackground';
import { useAnimateOnScroll } from '@/lib/hooks/useAnimateOnScroll';

/**
 * Renderless component that mounts site-wide DOM-dependent effects:
 *   - body background interpolates white → husk-50 on scroll
 *   - elements with `animate-on-scroll` fade in via IntersectionObserver
 *
 * Belongs at the top of the (site) layout. Magnetic-button effects attach
 * per-component via useMagneticButton(ref), not here.
 */
export function SiteEffects() {
  useScrollBackground();
  useAnimateOnScroll();
  return null;
}
