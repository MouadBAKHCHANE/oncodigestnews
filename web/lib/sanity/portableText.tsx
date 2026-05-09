import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import Link from 'next/link';

/**
 * Slugify a heading's plain text into a URL-safe anchor id. Used to wire
 * sidebar TOC links to the matching <h2> inside the body.
 */
export function slugifyHeading(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/**
 * Default components for rendering Sanity Portable Text. h2 / h3 get a
 * stable slug-based `id` so the sidebar TOC can deep-link to them.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children, value }) => {
      const text = blocksToPlainText([value as PortableTextBlock]);
      return <h2 id={slugifyHeading(text)}>{children}</h2>;
    },
    h3: ({ children, value }) => {
      const text = blocksToPlainText([value as PortableTextBlock]);
      return <h3 id={slugifyHeading(text)}>{children}</h3>;
    },
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <u>{children}</u>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? '#';
      const isInternal = href.startsWith('/') || href.startsWith('#');
      if (isInternal) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

/**
 * Flatten Portable Text blocks to a plain-text string. Useful for card
 * excerpts where we want CSS line-clamp on a single string, and for
 * meta descriptions / SEO snippets.
 */
export function blocksToPlainText(blocks: PortableTextBlock[] | undefined | null): string {
  if (!blocks || blocks.length === 0) return '';
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) =>
      ((b as { children?: { text?: string }[] }).children ?? [])
        .map((c) => c.text ?? '')
        .join(''),
    )
    .join(' ')
    .trim();
}

export function ProseFromPortableText({
  value,
  components: overrides,
}: {
  value: PortableTextBlock[] | undefined | null;
  components?: PortableTextComponents;
}) {
  if (!value || value.length === 0) return null;
  return <PortableText value={value} components={{ ...components, ...overrides }} />;
}
