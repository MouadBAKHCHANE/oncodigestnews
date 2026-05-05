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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
