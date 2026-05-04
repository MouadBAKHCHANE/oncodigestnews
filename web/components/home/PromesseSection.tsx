'use client';

import styles from './PromesseSection.module.css';

interface PromesseSectionProps {
  /** Kept for backwards-compat — ignored in this layout. */
  imageUrl?: string;
  illustrationVariant?: string;
  panelTag?: string;
  panelHeading?: string;
  panelBody?: string;
}

export function PromesseSection({
  panelTag = 'Notre vision',
  panelHeading = 'La rigueur scientifique au service de la pratique quotidienne.',
  panelBody = "Après plusieurs années dédiées à la chirurgie viscérale, OncoDigest est né d'une exigence : offrir aux praticiens une information technique de haut niveau, sans jamais perdre de vue la dimension humaine du soin.",
}: PromesseSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.bgArt} aria-hidden />

      <div className="padding-global">
        <div className="container-large">
          <div className={styles.inner}>
            <span className={styles.tag}>{panelTag}</span>
            <h2 className={styles.heading}>{panelHeading}</h2>
            <p className={styles.body}>{panelBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
