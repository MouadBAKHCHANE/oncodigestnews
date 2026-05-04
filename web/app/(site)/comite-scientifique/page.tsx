import type { Metadata } from 'next';
import Link from 'next/link';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { BrandIllustration, type BrandVariant } from '@/components/ui/BrandIllustration';
import { TitleReveal } from '@/components/ui/TitleReveal';
import styles from './comite.module.css';

export const metadata: Metadata = {
  title: 'Comité scientifique',
  description:
    "Le comité scientifique d'OncoDigest réunit des praticiens reconnus en chirurgie digestive et oncologie. Chaque contenu publié est validé par notre comité.",
};

export const revalidate = 600;

interface Advisor {
  _id: string;
  name: string;
  role?: string;
  specialty?: string;
  hospital?: string;
  quote?: string;
  photo?: (SanityImage & { alt?: string }) | null;
}

const ADVISOR_VARIANTS: BrandVariant[] = ['digestive', 'oncology', 'abstract', 'congress'];

const query = /* groq */ `
  *[_type == "advisor"] | order(order asc) {
    _id, name, role, specialty, hospital, quote, photo
  }
`;

export default async function ComitePage() {
  const advisors = await sanityClient.fetch<Advisor[]>(query);

  return (
    <main className={styles.page}>

      {/* ── Hero header ── */}
      <section className={styles.hero}>
        <div className="padding-global">
          <div className="container-large">
            <div className={styles.heroGrid}>
              <div className={styles.heroLeft}>
                <span className={styles.tag}>Comité scientifique</span>
                <TitleReveal as="h1" className={styles.heading}>
                  Celles et ceux qui valident chaque publication.
                </TitleReveal>
              </div>
              <div className={styles.heroRight}>
                <p className={styles.lead}>
                  OncoDigest fédère des praticiens reconnus en chirurgie digestive
                  et oncologie. Chaque article, vidéo et rapport est revu et
                  validé par notre comité — c&apos;est notre garantie d&apos;une
                  information rigoureuse, pertinente et utile à la pratique
                  clinique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Advisor rows (RockFi-style) ── */}
      <section className={styles.advisorsSection}>
        <div className="padding-global">
          <div className="container-large">
            {advisors.length === 0 ? (
              <p className={styles.empty}>
                La composition du comité sera annoncée prochainement.
              </p>
            ) : (
              <ul className={styles.advisorList}>
                {advisors.map((a, i) => (
                  <li
                    key={a._id}
                    className={`${styles.advisorRow} ${i % 2 === 1 ? styles.advisorRowReverse : ''}`}
                  >
                    <div className={styles.advisorPhoto}>
                      {a.photo ? (
                        <img
                          src={urlForImage(a.photo).width(900).height(1100).url()}
                          alt={a.photo.alt ?? a.name}
                          loading="lazy"
                        />
                      ) : (
                        <BrandIllustration
                          variant={ADVISOR_VARIANTS[i % ADVISOR_VARIANTS.length]}
                          label={a.name}
                        />
                      )}
                    </div>
                    <div className={styles.advisorContent}>
                      <span className={styles.advisorIndex}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <TitleReveal as="h2" className={styles.advisorName}>
                        {a.name}
                      </TitleReveal>
                      {a.role ? (
                        <p className={styles.advisorRole}>{a.role}</p>
                      ) : null}
                      {(a.specialty || a.hospital) ? (
                        <p className={styles.advisorMeta}>
                          {[a.specialty, a.hospital].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                      {a.quote ? (
                        <blockquote className={styles.advisorQuote}>
                          « {a.quote} »
                        </blockquote>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Process section ── */}
      <section className={styles.processSection}>
        <div className="padding-global">
          <div className="container-large">
            <div className={styles.processHeader}>
              <span className={styles.tag}>Notre processus</span>
              <TitleReveal as="h2" className={styles.processHeading}>
                Comment nous validons chaque publication.
              </TitleReveal>
            </div>
            <ol className={styles.processList}>
              <li className={styles.processItem}>
                <span className={styles.processNum}>01</span>
                <div className={styles.processBody}>
                  <h3 className={styles.processItemTitle}>Sélection éditoriale</h3>
                  <p className={styles.processItemText}>
                    Notre équipe identifie les publications à fort impact clinique
                    parmi les revues peer-reviewed et les communications de congrès.
                  </p>
                </div>
              </li>
              <li className={styles.processItem}>
                <span className={styles.processNum}>02</span>
                <div className={styles.processBody}>
                  <h3 className={styles.processItemTitle}>Synthèse rédactionnelle</h3>
                  <p className={styles.processItemText}>
                    Un praticien rédige une synthèse structurée : points clés,
                    méthode, résultats, implications cliniques pour le terrain.
                  </p>
                </div>
              </li>
              <li className={styles.processItem}>
                <span className={styles.processNum}>03</span>
                <div className={styles.processBody}>
                  <h3 className={styles.processItemTitle}>Revue par le comité</h3>
                  <p className={styles.processItemText}>
                    Au moins deux membres du comité scientifique relisent et
                    valident le contenu, son cadre et sa pertinence.
                  </p>
                </div>
              </li>
              <li className={styles.processItem}>
                <span className={styles.processNum}>04</span>
                <div className={styles.processBody}>
                  <h3 className={styles.processItemTitle}>Publication</h3>
                  <p className={styles.processItemText}>
                    L&apos;article est publié, avec mention de l&apos;auteur, des
                    relecteurs et des sources scientifiques.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="padding-global">
          <div className="container-large">
            <div className={styles.ctaInner}>
              <TitleReveal as="h2" className={styles.ctaHeading}>
                Vous êtes praticien ? Rejoignez le comité.
              </TitleReveal>
              <p className={styles.ctaText}>
                Nous accueillons régulièrement de nouveaux relecteurs experts en
                chirurgie digestive et oncologie. Contactez-nous pour en discuter.
              </p>
              <Link href="/contact" className={styles.ctaBtn}>
                Nous contacter →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
