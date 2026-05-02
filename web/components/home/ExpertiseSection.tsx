'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandIllustration, type BrandVariant } from '@/components/ui/BrandIllustration';
import styles from './ExpertiseSection.module.css';

interface ExpertiseItem {
  number: string;
  title: string;
  heading: string;
  text: string;
  illustration: BrandVariant;
  illustrationLabel: string;
  ctaHref: string;
  ctaLabel: string;
}

const ITEMS: ExpertiseItem[] = [
  {
    number: '01',
    title: 'Actualités',
    heading: "L'actualité médicale, filtrée et expliquée.",
    text: 'Chaque semaine, les publications les plus pertinentes en chirurgie digestive et oncologie — sélectionnées et commentées par nos experts pour la pratique clinique.',
    illustration: 'digestive',
    illustrationLabel: 'Illustration — Actualités',
    ctaHref: '/actualites',
    ctaLabel: 'Voir les actualités',
  },
  {
    number: '02',
    title: 'Articles scientifiques',
    heading: 'De la technique opératoire aux résultats cliniques.',
    text: 'Chirurgie colorectale, hépatobiliaire, pancréatique, oncologie digestive — des analyses approfondies rédigées par des praticiens de terrain.',
    illustration: 'oncology',
    illustrationLabel: 'Illustration — Articles scientifiques',
    ctaHref: '/articles-scientifiques',
    ctaLabel: 'Voir les articles',
  },
  {
    number: '03',
    title: 'Congrès',
    heading: "L'essentiel des congrès, en synthèse.",
    text: "ASCO, ESMO, SFCD, JFHOD — nous couvrons les congrès majeurs avec des rapports structurés, des points clés et des interviews d'experts.",
    illustration: 'congress',
    illustrationLabel: 'Illustration — Congrès',
    ctaHref: '/congres',
    ctaLabel: 'Voir les rapports',
  },
  {
    number: '04',
    title: 'Vidéos',
    heading: 'Voir pour comprendre : chirurgie et oncologie en image.',
    text: "Webinaires, interviews d'experts, replays de conférences — des formats vidéo conçus pour enrichir la pratique et rester à la pointe de son domaine.",
    illustration: 'hero',
    illustrationLabel: 'Illustration — Vidéos',
    ctaHref: '/videos',
    ctaLabel: 'Voir les vidéos',
  },
];

export function ExpertiseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ITEMS[activeIndex];

  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.grid}>
            <div className={styles.imagePanel}>
              {ITEMS.map((item, i) => (
                <div
                  key={item.number}
                  className={`${styles.image} ${i === activeIndex ? styles.imageActive : ''}`}
                  aria-hidden={i !== activeIndex}
                >
                  <BrandIllustration variant={item.illustration} label={item.illustrationLabel} />
                </div>
              ))}
            </div>

            <div className={styles.accordion}>
              {ITEMS.map((item, i) => {
                const isOpen = i === activeIndex;
                return (
                  <div
                    key={item.number}
                    className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
                  >
                    <button
                      type="button"
                      className={styles.itemHeader}
                      onClick={() => setActiveIndex(i)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.itemNumber}>{item.number}</span>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemIcon} aria-hidden>
                        <span className={`${styles.bar} ${styles.barH}`} />
                        <span className={`${styles.bar} ${styles.barV}`} />
                      </span>
                    </button>
                    <div className={styles.itemDivider} />
                    <div className={styles.itemBody}>
                      <h3 className={styles.itemHeading}>{active.heading === item.heading ? active.heading : item.heading}</h3>
                      <p className={styles.itemText}>{item.text}</p>
                      <Link href={item.ctaHref} className={styles.itemCta}>
                        {item.ctaLabel}
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
