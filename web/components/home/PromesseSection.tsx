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
          <div className={styles.imageColumn}>
            <span className={styles.imageBackdrop} aria-hidden />
            <span className={styles.imageDotGrid} aria-hidden />
            <div className={styles.imageWrapper}>
              {illustrationVariant ? (
                <BrandIllustration variant={illustrationVariant} label={panelHeading} />
              ) : (
                <img src={imageUrl} alt="" loading="lazy" />
              )}
            </div>
          </div>

          <div className={styles.textWrapper}>
            <div className={styles.tag}>
              <img src="/dot-grid.svg" alt="" className={styles.dotIcon} width={16} height={16} />
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
