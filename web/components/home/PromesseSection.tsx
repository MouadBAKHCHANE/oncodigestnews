'use client';

import { useRef } from 'react';
import { useVenetianReveal } from '@/lib/hooks/useVenetianReveal';
import { BrandIllustration, type BrandVariant } from '@/components/ui/BrandIllustration';
import { TitleReveal } from '@/components/ui/TitleReveal';
import styles from './PromesseSection.module.css';

interface PromesseSectionProps {
  imageUrl: string;
  /** When set, renders a BrandIllustration on mobile instead of an <img>. */
  illustrationVariant?: BrandVariant;
  bgHeading?: string;
  panelTag?: string;
  panelHeading?: string;
  panelBody?: string;
}

export function PromesseSection({
  imageUrl,
  illustrationVariant,
  bgHeading = 'La rigueur scientifique au service de la pratique quotidienne.',
  panelTag = 'Notre mission',
  panelHeading = 'La rigueur scientifique au service de la pratique quotidienne.',
  panelBody = "Après plusieurs années dédiées à la chirurgie viscérale, OncoDigest est né d'une exigence : offrir aux praticiens une information technique de haut niveau, sans jamais perdre de vue la dimension humaine du soin.",
}: PromesseSectionProps) {
  const scrollSpaceRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgHeadingRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useVenetianReveal({
    scrollSpaceRef,
    containerRef,
    bgHeadingRef,
    panelRef,
    imageUrl,
  });

  return (
    <section ref={scrollSpaceRef} className={styles.scrollSpace}>
      <div className={styles.sticky}>
        <div ref={bgHeadingRef} className={styles.bgHeading} aria-hidden>
          <p>{bgHeading}</p>
        </div>
        <div className={styles.lightWash} aria-hidden />
        <div ref={containerRef} className={styles.stripsContainer} aria-hidden />

        <div className={styles.mobileImg}>
          {illustrationVariant ? (
            <BrandIllustration variant={illustrationVariant} label={panelHeading} />
          ) : (
            <img src={imageUrl} alt="" loading="lazy" />
          )}
        </div>

        <div ref={panelRef} className={styles.panel}>
          <span className={styles.tag}>{panelTag}</span>
          <TitleReveal as="h2" className={styles.heading}>
            {panelHeading}
          </TitleReveal>
          <p className={styles.body}>{panelBody}</p>
        </div>
      </div>
    </section>
  );
}
