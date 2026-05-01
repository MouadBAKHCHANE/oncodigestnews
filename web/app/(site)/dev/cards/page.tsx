import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';
import { CongressCard, type CongressCardData } from '@/components/cards/CongressCard';
import { VideoCard, type VideoCardData } from '@/components/cards/VideoCard';
import { FAQAccordion, type FAQItemData } from '@/components/home/FAQAccordion';
import { LivesCalendar, type LiveEvent } from '@/components/home/LivesCalendar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { FiltersDemo } from './FiltersDemo';
import { TypewriterDemo } from './TypewriterDemo';

export const metadata = { title: 'Dev — Components', robots: { index: false, follow: false } };

const articleExcerpt: ArticleCardData['excerpt'] = [
  {
    _type: 'block',
    _key: 'b1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 's1',
        text: "État des lieux de la chirurgie robotique en oncologie viscérale et perspectives d'avenir.",
      },
    ],
  },
];

const articles: ArticleCardData[] = [
  {
    _id: '1',
    title: "Intérêt de la chirurgie robotique dans l'oncologie viscérale",
    slug: { current: 'interet-chirurgie-robotique-oncologie-viscerale' },
    excerpt: articleExcerpt,
    coverImage: null,
    publishedAt: '2026-03-12',
    access: 'public',
    tag: 'Article',
    author: { name: 'Dr. M.A. Benzakour' },
  },
  {
    _id: '2',
    title: "La chirurgie de l'endométriose profonde par robotique",
    slug: { current: 'chirurgie-endometriose-profonde-robotique' },
    excerpt: articleExcerpt,
    coverImage: null,
    publishedAt: '2026-02-08',
    access: 'pro',
    tag: 'Recherche',
    author: { name: 'Dr. M.A. Benzakour' },
  },
  {
    _id: '3',
    title: 'Cholécystectomie par chirurgie robotique : technique et résultats',
    slug: { current: 'cholecystectomie-chirurgie-robotique' },
    excerpt: articleExcerpt,
    coverImage: null,
    publishedAt: '2026-01-22',
    access: 'public',
    tag: null,
    author: { name: 'Dr. M.A. Benzakour' },
  },
];

const congresses: CongressCardData[] = [
  {
    _id: 'c1',
    title: 'ASCO 2026',
    slug: { current: 'asco-2026' },
    shortName: 'ASCO',
    startDate: '2026-05-29',
    endDate: '2026-06-02',
    location: { city: 'Chicago', country: 'États-Unis' },
    coverImage: null,
  },
  {
    _id: 'c2',
    title: 'ESMO 2025',
    slug: { current: 'esmo-2025' },
    shortName: 'ESMO',
    startDate: '2025-10-17',
    endDate: '2025-10-21',
    location: { city: 'Berlin', country: 'Allemagne' },
    coverImage: null,
  },
];

const videos: VideoCardData[] = [
  {
    _id: 'v1',
    title: "Intérêt de la chirurgie robotique dans l'oncologie viscérale",
    slug: { current: 'interet-chirurgie-robotique-oncologie-viscerale-video' },
    thumbnail: null,
    durationSeconds: 45 * 60,
    publishedAt: '2026-03-15',
    access: 'public',
    tag: 'Conférence',
    speakerLine: 'Dr. M. Dhib',
  },
  {
    _id: 'v2',
    title: "La chirurgie de l'endométriose profonde par robotique",
    slug: { current: 'endometriose-profonde-robotique-video' },
    thumbnail: null,
    durationSeconds: 32 * 60,
    publishedAt: '2026-02-20',
    access: 'pro',
    tag: 'Démonstration',
    speakerLine: 'Dr. S. Lebrun',
  },
];

// Generate a few mock lives spread across the next 60 days
const mockLives: LiveEvent[] = (() => {
  const now = new Date();
  const offsets = [3, 9, 17, 28, 42];
  return offsets.map((days, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(19, 0, 0, 0);
    return {
      _id: `live-${i}`,
      title: [
        'Chirurgie robotique du rectum : techniques actuelles',
        'Cancer du foie : approches multidisciplinaires',
        'Innovations en chirurgie pancréatique',
        'ESMO 2026 — Synthèse des moments forts',
        'Endométriose profonde : approche robotique',
      ][i],
      startsAt: d.toISOString(),
      durationMinutes: 60,
      registrationUrl: 'https://example.com/register',
      speakerLine: ['Dr. M.A. Benzakour', 'Pr. S. Lebrun', 'Dr. M. Dhib'][i % 3],
      description:
        'Conférence en direct réservée aux professionnels de santé inscrits.',
    };
  });
})();

const faqItems: FAQItemData[] = [
  {
    _id: 'f1',
    question: "Qui peut s'inscrire sur OncoDigest ?",
    answer: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: 'OncoDigest est ouvert à tous les professionnels de santé : chirurgiens, oncologues, gastro-entérologues, internes, et chercheurs en oncologie digestive.',
          },
        ],
      },
    ],
  },
  {
    _id: 'f2',
    question: 'Le contenu est-il gratuit ?',
    answer: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: "La partie grand public (actualités, vidéos sélectionnées) est en accès libre. Les articles scientifiques, rapports de congrès détaillés et lives sont réservés aux membres inscrits.",
          },
        ],
      },
    ],
  },
  {
    _id: 'f3',
    question: 'Comment proposer une contribution ?',
    answer: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: 'Contactez-nous via le formulaire de contact en précisant le sujet "Proposition d\'article". Notre comité scientifique examinera votre proposition.',
          },
        ],
      },
    ],
  },
];

const sectionTitle = {
  fontFamily: 'var(--font-display-stack)',
  fontWeight: 300,
  fontSize: 22,
  color: 'var(--cod-gray--900)',
  marginBottom: 24,
  marginTop: 64,
} as const;

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 24,
} as const;

export default function DevCardsPage() {
  return (
    <section style={{ padding: '120px 32px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display-stack)',
            fontWeight: 300,
            fontSize: 32,
            color: 'var(--cod-gray--900)',
            marginBottom: 8,
          }}
        >
          Components playground
        </h1>
        <p style={{ color: 'var(--cod-gray--500)', marginBottom: 40, fontSize: 13 }}>
          Internal preview. Not indexed. Used for visual diffing against the existing HTML.
        </p>

        <h2 style={{ ...sectionTitle, marginTop: 0 }}>ArticleCard</h2>
        <div style={grid}>
          {articles.map((article, i) => (
            <ArticleCard
              key={article._id}
              article={article}
              animationDelay={(i + 1) as 1 | 2 | 3}
            />
          ))}
        </div>

        <h2 style={sectionTitle}>CongressCard</h2>
        <div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
          {congresses.map((c, i) => (
            <CongressCard
              key={c._id}
              congress={c}
              animationDelay={(i + 1) as 1 | 2}
            />
          ))}
        </div>

        <h2 style={sectionTitle}>VideoCard</h2>
        <div style={grid}>
          {videos.map((v, i) => (
            <VideoCard key={v._id} video={v} animationDelay={(i + 1) as 1 | 2} />
          ))}
        </div>

        <h2 style={sectionTitle}>Typewriter (Phase 5 hook)</h2>
        <TypewriterDemo />

        <h2 style={sectionTitle}>FilterPills + SearchInput</h2>
        <FiltersDemo />

        <h2 style={sectionTitle}>LivesCalendar (new component)</h2>
        <div style={{ maxWidth: 720 }}>
          <LivesCalendar events={mockLives} />
        </div>

        <h2 style={sectionTitle}>FAQ Accordion</h2>
        <FAQAccordion items={faqItems} />

        <h2 style={sectionTitle}>Form primitives</h2>
        <form
          action=""
          style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}
        >
          <Input label="Nom" name="nom" required placeholder="Votre nom" />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            placeholder="exemple@hopital.fr"
            help="Email professionnel de préférence."
          />
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            required
            error="Le mot de passe doit contenir au moins 8 caractères"
          />
          <Select label="Profession" name="profession" required defaultValue="">
            <option value="" disabled>
              Sélectionnez votre profession
            </option>
            <option value="chirurgien">Chirurgien</option>
            <option value="oncologue">Oncologue</option>
            <option value="gastro-enterologue">Gastro-entérologue</option>
            <option value="interne">Interne</option>
            <option value="autre">Autre</option>
          </Select>
          <Textarea
            label="Message"
            name="message"
            required
            placeholder="Votre message..."
            rows={6}
          />
          <Checkbox
            name="terms"
            label="J'accepte les conditions d'utilisation"
            required
          />
        </form>
      </div>
    </section>
  );
}
