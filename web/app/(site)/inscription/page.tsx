import type { Metadata } from 'next';
import { RegistrationForm } from './RegistrationForm';
import styles from './inscription.module.css';

export const metadata: Metadata = {
  title: 'Inscription',
  description:
    'Créez votre compte OncoDigest et accédez aux articles scientifiques, rapports de congrès et vidéos exclusives en oncologie digestive.',
};

const benefits = [
  'Articles validés par notre comité scientifique',
  'Rapports de congrès en synthèse',
  'Lives et rediffusions exclusives',
];

export default function InscriptionPage() {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.grid}>
            <div className={`${styles.left} animate-on-scroll`}>
              <span className={styles.tag}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/dot-grid.svg" alt="" width={16} height={16} className={styles.dotIcon} />
                <span>Inscription</span>
              </span>
              <h1 className={styles.heading}>Rejoignez OncoDigest.</h1>
              <p className={styles.lead}>
                Accédez aux articles scientifiques, rapports de congrès et vidéos exclusives.
              </p>

              <div className={styles.benefits}>
                {benefits.map((b) => (
                  <div key={b} className={styles.benefitItem}>
                    <svg
                      className={styles.benefitIcon}
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0z"
                        fill="currentColor"
                        opacity="0.12"
                      />
                      <path
                        d="M14.03 7.47a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06L9 11.44l3.97-3.97a.75.75 0 0 1 1.06 0z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className={styles.benefitText}>{b}</span>
                  </div>
                ))}
              </div>

              <div className={styles.trust}>
                <svg className={styles.trustIcon} viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M12 6H11V4.5C11 2.84 9.66 1.5 8 1.5C6.34 1.5 5 2.84 5 4.5V6H4C3.45 6 3 6.45 3 7V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V7C13 6.45 12.55 6 12 6ZM8 11C7.45 11 7 10.55 7 10C7 9.45 7.45 9 8 9C8.55 9 9 9.45 9 10C9 10.55 8.55 11 8 11ZM9.8 6H6.2V4.5C6.2 3.51 7.01 2.7 8 2.7C8.99 2.7 9.8 3.51 9.8 4.5V6Z"
                    fill="currentColor"
                  />
                </svg>
                <span className={styles.trustText}>
                  Vos données sont protégées conformément au RGPD.
                </span>
              </div>
            </div>

            <div className={`${styles.formWrapper} animate-on-scroll delay-1`}>
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
