import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CommonProps {
  children: ReactNode;
  className?: string;
}

interface CardLinkProps extends CommonProps {
  href: string;
  ariaLabel?: string;
}

interface CardStaticProps extends CommonProps {
  href?: undefined;
}

export type CardProps = CardLinkProps | CardStaticProps;

/**
 * Base card shell — white bg, 1px gray-100 border, 16px radius, hover shadow.
 *
 * Verbatim port of `.article_card` (actualites.html lines 774-789), but
 * generalized: ArticleCard / VideoCard / CongressCard all extend this.
 *
 * Pass `href` to render the whole card as a link. Otherwise renders a div.
 */
export function Card({ className, children, ...rest }: CardProps) {
  const cls = [styles.card, className].filter(Boolean).join(' ');

  if ('href' in rest && rest.href !== undefined) {
    const { href, ariaLabel } = rest;
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}
