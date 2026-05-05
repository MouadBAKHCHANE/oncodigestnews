'use client';

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
  panelTag = 'Notre mission',
  panelHeading = 'La rigueur scientifique au service de la pratique quotidienne.',
  panelBody = "Après plusieurs années dédiées à la chirurgie viscérale, OncoDigest est né d'une exigence : offrir aux praticiens une information technique de haut niveau, sans jamais perdre de vue la dimension humaine du soin.",
}: PromesseSectionProps) {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className={`container-large ${styles.container}`}>
          <div className={styles.imageWrapper}>
            {illustrationVariant ? (
              <BrandIllustration variant={illustrationVariant} label={panelHeading} />
            ) : (
              <img src={imageUrl} alt="" loading="lazy" />
            )}
          </div>

          <div className={styles.textWrapper}>
            <div className={styles.tag}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.dotIcon}>
                <circle cx="2" cy="2" r="1.5" fill="#E5E5E5"/>
                <circle cx="8" cy="2" r="1.5" fill="#4C4C4C"/>
                <circle cx="14" cy="2" r="1.5" fill="#E5E5E5"/>
                <circle cx="2" cy="8" r="1.5" fill="#4C4C4C"/>
                <circle cx="8" cy="8" r="1.5" fill="#4C4C4C"/>
                <circle cx="14" cy="8" r="1.5" fill="#4C4C4C"/>
                <circle cx="2" cy="14" r="1.5" fill="#E5E5E5"/>
                <circle cx="8" cy="14" r="1.5" fill="#4C4C4C"/>
                <circle cx="14" cy="14" r="1.5" fill="#E5E5E5"/>
              </svg>
              <span>{panelTag}</span>
            </div>
            <TitleReveal as="h2" className={styles.heading}>
              {panelHeading}
            </TitleReveal>
            <p className={styles.body}>{panelBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
