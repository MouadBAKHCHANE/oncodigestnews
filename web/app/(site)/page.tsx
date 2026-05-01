import { sanityClient } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image as SanityImage } from 'sanity';
import { Hero } from '@/components/home/Hero';
import { PromesseSection } from '@/components/home/PromesseSection';
import { PartnersSection } from '@/components/home/PartnersSection';
import { BannerSection } from '@/components/home/BannerSection';
import { ExpertiseSection } from '@/components/home/ExpertiseSection';
import { DarkQuoteSection } from '@/components/home/DarkQuoteSection';
import { LivesPreviewSection } from '@/components/home/LivesPreviewSection';
import { FAQAccordion, type FAQItemData } from '@/components/home/FAQAccordion';
import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';
import { type VideoCardData } from '@/components/cards/VideoCard';
import { Button } from '@/components/ui/Button';
import styles from './home.module.css';

export const revalidate = 600;

interface HomeData {
  settings: {
    siteName?: string;
    tagline?: string;
    heroTypewriterWords?: string[];
    heroImage?: (SanityImage & { alt?: string }) | null;
  } | null;
  advisors: Array<{
    _id: string;
    name: string;
    role?: string;
    photo?: (SanityImage & { alt?: string }) | null;
    quote?: string;
  }>;
  faqs: Array<{
    _id: string;
    question: string;
    answer: PortableTextBlock[];
  }>;
  latestArticles: ArticleCardData[];
  latestVideos: VideoCardData[];
}

const homeQuery = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    siteName, tagline, heroTypewriterWords, heroImage
  },
  "advisors": *[_type == "advisor"] | order(order asc)[0...3] {
    _id, name, role, photo, quote
  },
  "faqs": *[_type == "faq"] | order(order asc) {
    _id, question, answer
  },
  "latestArticles": *[_type == "article"] | order(publishedAt desc)[0...3] {
    _id, title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
    "category": category->{title, slug},
    "author": author->{name, photo}
  },
  "latestVideos": *[_type == "video"] | order(publishedAt desc)[0...3] {
    _id, title, slug, thumbnail, durationSeconds, publishedAt, access,
    "category": category->{title, slug},
    "speakerLine": array::join(speakers[]->name, ' · ')
  }
}`;

const FALLBACK_HERO_IMAGE = '/hero-fallback.jpg';
const FALLBACK_PROMESSE_IMAGE = '/promesse-fallback.jpg';

export default async function HomePage() {
  const data = await sanityClient.fetch<HomeData>(homeQuery);

  const heroImageUrl = data.settings?.heroImage
    ? urlForImage(data.settings.heroImage).width(1600).height(1200).url()
    : FALLBACK_HERO_IMAGE;

  const heroAlt =
    data.settings?.heroImage?.alt ?? 'Chirurgie robotique — OncoDigest';

  const promesseImageUrl = data.settings?.heroImage
    ? urlForImage(data.settings.heroImage).width(1200).height(1600).url()
    : FALLBACK_PROMESSE_IMAGE;

  const faqItems: FAQItemData[] = data.faqs ?? [];

  return (
    <>
      <Hero
        imageUrl={heroImageUrl}
        imageAlt={heroAlt}
        typewriterWords={
          data.settings?.heroTypewriterWords && data.settings.heroTypewriterWords.length > 0
            ? data.settings.heroTypewriterWords
            : undefined
        }
      />

      <PartnersSection />

      <PromesseSection imageUrl={promesseImageUrl} />

      <BannerSection />

      <ExpertiseSection />

      {data.advisors.length > 0 ? (
        <section className={styles.advisorsSection}>
          <div className="padding-global">
            <div className="container-large">
              <span className={`${styles.eyebrow} animate-on-scroll`}>Comité scientifique</span>
              <h2 className={`${styles.sectionHeading} animate-on-scroll delay-1`}>
                Un comité d&apos;experts au service de la qualité.
              </h2>
              <div className={styles.advisorsGrid}>
                {data.advisors.map((a, i) => (
                  <article
                    key={a._id}
                    className={`${styles.advisorCard} animate-on-scroll delay-${i}`}
                  >
                    {a.photo ? (
                      <div className={styles.advisorAvatar}>
                        <img
                          src={urlForImage(a.photo).width(160).height(160).url()}
                          alt={a.photo.alt ?? a.name}
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <h3 className={styles.advisorName}>{a.name}</h3>
                    {a.role ? <p className={styles.advisorRole}>{a.role}</p> : null}
                    {a.quote ? (
                      <p className={styles.advisorQuote}>« {a.quote} »</p>
                    ) : null}
                  </article>
                ))}
              </div>
              <div className={`${styles.advisorsCta} animate-on-scroll delay-3`}>
                <Button href="/a-propos" variant="husk" size="sm">
                  Voir le comité scientifique →
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <DarkQuoteSection />

      {data.latestVideos.length > 0 ? (
        <LivesPreviewSection videos={data.latestVideos} />
      ) : null}

      {data.latestArticles.length > 0 ? (
        <section className={styles.journalSection}>
          <div className="padding-global">
            <div className="container-large">
              <div className={styles.journalHeader}>
                <span className={`${styles.eyebrow} animate-on-scroll`}>Journal</span>
                <h2 className={`${styles.sectionHeading} animate-on-scroll delay-1`}>
                  Les dernières publications.
                </h2>
              </div>
              <div className={styles.journalGrid}>
                {data.latestArticles.map((article, i) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    animationDelay={((i % 3) + 1) as 1 | 2 | 3}
                  />
                ))}
              </div>
              <div className={`${styles.journalCta} animate-on-scroll delay-3`}>
                <Button href="/actualites" variant="dark" size="sm">
                  Voir toutes les actualités →
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} aria-hidden />
        <div className="padding-global">
          <div className="container-large">
            <div className={styles.ctaInner}>
              <h2 className={`${styles.ctaHeading} animate-on-scroll`}>
                Rejoignez la communauté <em>OncoDigest</em>.
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
        </div>
      </section>

      {faqItems.length > 0 ? (
        <section className={styles.faqSection}>
          <div className="padding-global">
            <div className="container-large">
              <FAQAccordion items={faqItems} tag="FAQ" heading="Vos questions, nos réponses" />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
