import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import Link from 'next/link';

/**
 * Default components for rendering Sanity Portable Text. Tuned to match the
 * existing HTML's `.legal_content` typography (h1/h2/p/ul/li). Article body
 * rendering will reuse this with a different parent selector for spacing.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
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
