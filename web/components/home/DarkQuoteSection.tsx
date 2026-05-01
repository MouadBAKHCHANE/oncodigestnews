import Link from 'next/link';
import styles from './DarkQuoteSection.module.css';

interface DarkQuoteSectionProps {
  authorName?: string;
  authorRole?: string;
}

export function DarkQuoteSection({
  authorName = 'Dr. Mohammed Amal Benzakour',
  authorRole = 'Fondateur — OncoDigest',
}: DarkQuoteSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <blockquote className={`${styles.text} animate-on-scroll`}>
          L&apos;information médicale de qualité ne devrait jamais être un{' '}
          <em>privilège</em>.
        </blockquote>
        <div className={`${styles.author} animate-on-scroll delay-1`}>
          <div className={styles.authorName}>{authorName}</div>
          <div className={styles.authorRole}>{authorRole}</div>
        </div>
        <div className={`${styles.cta} animate-on-scroll delay-2`}>
          <Link href="/a-propos" className={styles.ctaLink}>
            Découvrir notre mission
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M8 0.77C7.27 0.77 6.69 1.36 6.69 2.08C6.69 2.81 7.27 3.4 8 3.4C8.73 3.4 9.31 2.81 9.31 2.08C9.31 1.36 8.73 0.77 8 0.77Z"
                fill="currentColor"
              />
              <path
                d="M8 5.77C7.27 5.77 6.69 6.36 6.69 7.08C6.69 7.81 7.27 8.4 8 8.4C8.73 8.4 9.31 7.81 9.31 7.08C9.31 6.36 8.73 5.77 8 5.77Z"
                fill="currentColor"
              />
              <path
                d="M8 10.77C7.27 10.77 6.69 11.36 6.69 12.08C6.69 12.81 7.27 13.4 8 13.4C8.73 13.4 9.31 12.81 9.31 12.08C9.31 11.36 8.73 10.77 8 10.77Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
