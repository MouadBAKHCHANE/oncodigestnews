import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: false,
});

/**
 * Server-only client with the read token. Use for fetching gated/draft content
 * in server components or route handlers. Never import this from a client component.
 */
export const sanityServerClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN,
  stega: false,
});
