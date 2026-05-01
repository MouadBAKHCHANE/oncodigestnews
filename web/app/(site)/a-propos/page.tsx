import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import { ProseFromPortableText } from '@/lib/sanity/portableText';
import { Button } from '@/components/ui/Button';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    "OncoDigest — plateforme d'information médicale en chirurgie digestive et oncologie, fondée par le Dr. Mohammed Amal Benzakour. Notre comité scientifique et notre processus éditorial.",
};

export const revalidate = 600;

interface AdvisorDoc {
  _id: string;
  name: string;
  role?: string;
  institution?: string;
  photo?: (SanityImage & { alt?: string }) | null;
  bio?: PortableTextBlock[];
  quote?: string;
  isFounder?: boolean;
}

interface AboutResponse {
  founder: AdvisorDoc | null;
  advisors: AdvisorDoc[];
}

const aboutQuery = /* groq */ `{
  "founder": *[_type == "advisor" && isFounder == true] | order(order asc)[0]{
    _id, name, role, institution, photo, bio, quote, isFounder
  },
  "advisors": *[_type == "advisor" && isFounder != true] | order(order asc) {
    _id, name, role, institution, photo, bio, quote
  }
}`;

const expertisePillars = [
  {
    title: 'Chirurgie Robotique',
    desc: "L'usage du robot prolonge la main du chirurgien avec une vision augmentée et une délicatesse de geste indispensables en oncologie.",
  },
  {
    title: 'Chirurgie Mini-Invasive',
    desc: "Maîtriser les techniques laparoscopiques pour minimiser l'impact chirurgical, réduire les douleurs et favoriser une récupération sereine.",
  },
  {
    title: 'Cancérologie Digestive',
    desc: 'La prise en charge des tumeurs digestives demande une approche globale, en étroite collaboration avec oncologues et radiothérapeutes.',
  },
];

const editorialSteps = [
  {
    n: '01',
    title: 'Rédaction',
    desc: 'Nos articles sont rédigés par des praticiens spécialisés en chirurgie digestive et oncologie.',
  },
  {
    n: '02',
    title: 'Relecture',
    desc: 'Chaque publication est relue et validée par notre comité scientifique.',
  },
  {
    n: '03',
    title: 'Publication',
    desc: 'Le contenu validé est publié et accessible aux membres de la plateforme.',
  },
];

export default async function AboutPage() {
  const { founder, advisors } = await sanityClient.fetch<AboutResponse>(aboutQuery);

  return (
    <>
      <section className={styles.heroSection}>
        <div className="padding-global">
          <div className="container-large">
            <header className={styles.header}>
              <span className={`${styles.tag} animate-on-scroll`}>À propos</span>
              <h1 className={`${styles.heading} animate-on-scroll delay-1`}>
                L&apos;information oncologique, validée par des praticiens.
              </h1>
              <p className={`${styles.lead} animate-on-scroll delay-2`}>
                OncoDigest réunit chirurgiens, oncologues et chercheurs autour d&apos;une mission
                commune&nbsp;: rendre l&apos;information médicale rigoureuse et accessible.
              </p>
            </header>
          </div>
        </div>
      </section>

      {founder ? <FounderSection founder={founder} /> : null}

      <section className={styles.expertiseSection}>
        <div className="padding-global">
          <div className="container-large">
            <h2 className={`${styles.sectionHeading} animate-on-scroll`}>
              Une spécialisation au cœur de l&apos;innovation
            </h2>
            <div className={styles.expertiseGrid}>
              {expertisePillars.map((p, i) => (
                <article
                  key={p.title}
                  className={`${styles.expertiseCard} animate-on-scroll delay-${i}`}
                >
                  <h3 className={styles.expertiseTitle}>{p.title}</h3>
                  <p className={styles.expertiseDesc}>{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {advisors.length > 0 ? (
        <section className={styles.advisorsSection}>
          <div className="padding-global">
            <div className="container-large">
              <span className={`${styles.tag} animate-on-scroll`}>Comité scientifique</span>
              <h2 className={`${styles.sectionHeading} animate-on-scroll delay-1`}>
                Un comité d&apos;experts au service de la qualité
              </h2>
              <div className={styles.advisorsGrid}>
                {advisors.map((a, i) => (
                  <article
                    key={a._id}
                    className={`${styles.advisorCard} animate-on-scroll delay-${(i % 3) + 1}`}
                  >
                    <div className={styles.advisorAvatar} aria-hidden>
                      {a.photo ? (
                        <Image
                          src={urlForImage(a.photo).width(160).height(160).url()}
                          alt={a.photo.alt ?? a.name}
                          width={80}
                          height={80}
                        />
                      ) : null}
                    </div>
                    <h3 className={styles.advisorName}>{a.name}</h3>
                    {a.role ? <p className={styles.advisorRole}>{a.role}</p> : null}
                    {a.institution ? (
                      <p className={styles.advisorInstitution}>{a.institution}</p>
                    ) : null}
                    {a.quote ? <p className={styles.advisorQuote}>« {a.quote} »</p> : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.editorialSection}>
        <div className="padding-global">
          <div className="container-large">
            <h2 className={`${styles.sectionHeading} animate-on-scroll`}>
              Notre processus éditorial
            </h2>
            <ol className={styles.editorialSteps}>
              {editorialSteps.map((s, i) => (
                <li key={s.n} className={`${styles.editorialStep} animate-on-scroll delay-${i}`}>
                  <span className={styles.editorialStepNumber}>{s.n}</span>
                  <h3 className={styles.editorialStepTitle}>{s.title}</h3>
                  <p className={styles.editorialStepDesc}>{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="padding-global">
          <div className="container-large">
            <h2 className={`${styles.ctaHeading} animate-on-scroll`}>
              Rejoignez la communauté OncoDigest
            </h2>
            <p className={`${styles.ctaSubtext} animate-on-scroll delay-1`}>
              Accédez aux articles, rapports de congrès et vidéos exclusives.
            </p>
            <div className={`${styles.ctaButton} animate-on-scroll delay-2`}>
              <Button href="/inscription" variant="yellow" size="sm">
                Créer mon compte
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FounderSection({ founder }: { founder: AdvisorDoc }) {
  return (
    <section className={styles.founderSection}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.founderGrid}>
            <div className={`${styles.founderImageWrap} animate-on-scroll`}>
              {founder.photo ? (
                <Image
                  src={urlForImage(founder.photo).width(900).height(1200).url()}
                  alt={founder.photo.alt ?? founder.name}
                  width={900}
                  height={1200}
                  className={styles.founderImage}
                  priority
                />
              ) : (
                <div className={styles.founderImagePlaceholder} aria-hidden />
              )}
            </div>
            <div className={`${styles.founderContent} animate-on-scroll delay-1`}>
              <span className={styles.tag}>Fondateur</span>
              <h2 className={styles.founderName}>{founder.name}</h2>
              {founder.role ? <p className={styles.founderTitle}>{founder.role}</p> : null}
              {founder.bio && founder.bio.length > 0 ? (
                <div className={styles.founderBio}>
                  <ProseFromPortableText value={founder.bio} />
                </div>
              ) : null}
              {founder.quote ? (
                <blockquote className={styles.founderKeyfact}>{founder.quote}</blockquote>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
