/**
 * Centralized GROQ queries.
 *
 * Critical security primitive: queries that include `body` (gated content) must
 * conditionally project it based on the caller's auth state. Never include
 * gated fields by default — they end up in the HTML response and can be read
 * via View Source.
 */

export const homepageQuery = /* groq */ `{
  "settings": *[_type == "siteSettings"][0],
  "advisors": *[_type == "advisor"] | order(order asc) {
    _id, name, slug, role, institution, photo, quote, specialties, links, isFounder
  },
  "partners": *[_type == "partner"] | order(order asc) {
    _id, name, logo, website
  },
  "faqs": *[_type == "faq"] | order(order asc) {
    _id, question, answer
  },
  "latestArticles": *[_type == "article"] | order(publishedAt desc)[0...6] {
    _id, title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
    "category": category->{title, slug},
    "author": author->{name, photo}
  }
}`;

export const articleQuery = (canViewPro: boolean) => /* groq */ `*[_type == "article" && slug.current == $slug][0]{
  _id, title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
  "category": category->{title, slug},
  "author": author->{name, photo, role, bio},
  ${canViewPro ? 'body,' : ''}
  "relatedArticles": relatedArticles[]->{
    _id, title, slug, coverImage, publishedAt,
    "category": category->title
  }
}`;

export const articlesIndexQuery = /* groq */ `*[_type == "article"] | order(publishedAt desc) {
  _id, title, slug, excerpt, coverImage, publishedAt, readingTime, access, tag,
  "category": category->{title, slug},
  "author": author->{name, photo}
}`;

export const livesByMonthQuery = /* groq */ `*[_type == "live" && startsAt >= $monthStart && startsAt < $monthEnd] | order(startsAt asc) {
  _id, title, slug, startsAt, durationMinutes, description, registrationUrl, access,
  "speakers": speakers[]->{_id, name, role, photo}
}`;

export const upcomingLivesQuery = /* groq */ `*[_type == "live" && startsAt >= now()] | order(startsAt asc) {
  _id, title, slug, startsAt, durationMinutes, description, registrationUrl, access,
  "speakers": speakers[]->{_id, name, role, photo}
}`;

export const videosIndexQuery = /* groq */ `*[_type == "video"] | order(publishedAt desc) {
  _id, title, slug, description, thumbnail, videoUrl, durationSeconds, publishedAt, access,
  "category": category->{title, slug},
  "speakers": speakers[]->{_id, name, role}
}`;

export const congressIndexQuery = /* groq */ `*[_type == "congress"] | order(startDate asc) {
  _id, title, slug, shortName, startDate, endDate, location, coverImage, summary, access, isFeatured
}`;

export const scientificArticlesIndexQuery = /* groq */ `*[_type == "scientificArticle"] | order(publishedAt desc) {
  _id, title, slug, authors, journal, doi, externalUrl, excerpt, coverImage, publishedAt, access,
  "category": category->{title, slug},
  "congress": congress->{title, slug, shortName}
}`;

export const aboutQuery = /* groq */ `{
  "settings": *[_type == "siteSettings"][0],
  "founders": *[_type == "advisor" && isFounder == true] | order(order asc),
  "advisors": *[_type == "advisor" && isFounder != true] | order(order asc)
}`;
