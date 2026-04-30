import { ArticleCard, type ArticleCardData } from '@/components/cards/ArticleCard';

/**
 * Internal preview route — renders every state of every card variant against
 * mock data, so we can visually diff against the existing HTML without needing
 * real Sanity content for each variant.
 *
 * Not linked from anywhere; reach via /dev/cards. Excluded from sitemaps later.
 */
export const metadata = { title: 'Dev — Cards', robots: { index: false, follow: false } };

const mockBase: Omit<ArticleCardData, '_id' | 'title' | 'slug' | 'access' | 'tag'> = {
  excerpt: [
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
  ] as ArticleCardData['excerpt'],
  coverImage: null,
  publishedAt: '2026-03-12',
  author: { name: 'Dr. M.A. Benzakour' },
};

const articles: ArticleCardData[] = [
  {
    ...mockBase,
    _id: '1',
    title: "Intérêt de la chirurgie robotique dans l'oncologie viscérale",
    slug: { current: 'interet-chirurgie-robotique-oncologie-viscerale' },
    access: 'public',
    tag: 'Article',
  },
  {
    ...mockBase,
    _id: '2',
    title: "La chirurgie de l'endométriose profonde par robotique",
    slug: { current: 'chirurgie-endometriose-profonde-robotique' },
    access: 'pro',
    tag: 'Recherche',
  },
  {
    ...mockBase,
    _id: '3',
    title: 'Cholécystectomie par chirurgie robotique : technique et résultats',
    slug: { current: 'cholecystectomie-chirurgie-robotique' },
    access: 'public',
    tag: null,
  },
];

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
          Cards playground
        </h1>
        <p style={{ color: 'var(--cod-gray--500)', marginBottom: 40, fontSize: 13 }}>
          Internal preview. Not indexed. Used for visual diffing against the existing HTML.
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-display-stack)',
            fontWeight: 300,
            fontSize: 22,
            color: 'var(--cod-gray--900)',
            marginBottom: 24,
          }}
        >
          ArticleCard
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {articles.map((article, i) => (
            <ArticleCard
              key={article._id}
              article={article}
              animationDelay={(i + 1) as 1 | 2 | 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
