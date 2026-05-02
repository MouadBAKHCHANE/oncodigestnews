import { article } from './article';
import { scientificArticle } from './scientificArticle';
import { congress } from './congress';
import { evenement } from './evenement';
import { video } from './video';
import { live } from './live';
import { advisor } from './advisor';
import { author } from './author';
import { partner } from './partner';
import { faq } from './faq';
import { category } from './category';
import { siteSettings } from './siteSettings';
import { seo } from './objects/seo';

export const schemaTypes = [
  // Documents
  article,
  scientificArticle,
  congress,
  evenement,
  video,
  live,
  advisor,
  author,
  partner,
  faq,
  category,
  siteSettings,
  // Objects
  seo,
];
