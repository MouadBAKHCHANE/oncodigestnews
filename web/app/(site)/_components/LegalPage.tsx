import { ProseFromPortableText } from '@/lib/sanity/portableText';
import type { PortableTextBlock } from '@portabletext/types';
import styles from './LegalPage.module.css';

interface LegalPageProps {
  title: string;
  lastUpdated?: string;
  body: PortableTextBlock[] | undefined | null;
}

/**
 * Shared layout for the static legal pages (mentions-legales,
 * politique-de-confidentialite). Visual rules ported from the
 * `.legal_content` block in mentions-legales.html (lines 617-670).
 */
export function LegalPage({ title, lastUpdated, body }: LegalPageProps) {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={`${styles.content} animate-on-scroll`}>
            <h1>{title}</h1>
            {lastUpdated ? (
              <p className={styles.lastUpdated}>Dernière mise à jour : {lastUpdated}</p>
            ) : null}
            {body && body.length > 0 ? (
              <ProseFromPortableText value={body} />
            ) : (
              <p className={styles.empty}>
                Le texte de cette page n&apos;a pas encore été ajouté dans le CMS.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
