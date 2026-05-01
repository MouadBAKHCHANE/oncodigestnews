import { Button } from '@/components/ui/Button';
import styles from './BannerSection.module.css';

export function BannerSection() {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.card}>
            <div className={styles.content}>
              <span className={`${styles.tag} animate-on-scroll`}>Notre vision</span>
              <h2 className={`${styles.heading} animate-on-scroll delay-1`}>
                Une information libre de tout conflit d&apos;intérêt.
              </h2>
              <div className={`${styles.features} animate-on-scroll delay-2`}>
                <span className={styles.featureItem}>Indépendance éditoriale</span>
                <Dot />
                <span className={styles.featureItem}>Comité scientifique</span>
                <Dot />
                <span className={styles.featureItem}>Accès ouvert</span>
              </div>
              <div className={`${styles.cta} animate-on-scroll delay-3`}>
                <Button href="/a-propos" variant="husk" size="sm">
                  Découvrir notre ligne éditoriale
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <svg
      className={styles.dot}
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      aria-hidden
    >
      <circle cx="4.5" cy="4.5" r="2.65" fill="currentColor" />
    </svg>
  );
}
