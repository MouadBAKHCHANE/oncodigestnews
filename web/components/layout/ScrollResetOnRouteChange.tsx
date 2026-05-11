'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Instantly scroll to the top of the document on every client-side route change.
 *
 * Next.js App Router scrolls to the top on navigation by default, but the
 * site-wide `html { scroll-behavior: smooth }` rule animates that jump — and the
 * animation can land mid-scroll on heavy pages, leaving the new page's header
 * cropped. This component forces an instant scroll reset whenever the pathname
 * or query string changes.
 */
export function ScrollResetOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, searchParams]);

  return null;
}
