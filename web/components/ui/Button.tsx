import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'white' | 'yellow' | 'dark' | 'husk' | 'satin' | 'text' | 'glass';
type Size = 'sm' | 'md';

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className' | 'children'>;

type AsButton = Common & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

export type ButtonProps = AsLink | AsButton;

const variantClass: Record<Variant, string> = {
  white: styles.btnWhite,
  yellow: styles.btnYellow,
  dark: styles.btnDark,
  husk: styles.btnHusk,
  satin: styles.btnSatin,
  text: styles.btnText,
  glass: styles.btnGlass,
};

/**
 * Button — visual variants ported verbatim from index.html.
 * Renders as `<a>` (via next/link) when `href` is provided, otherwise `<button>`.
 */
export function Button({
  variant = 'dark',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    size === 'sm' && styles.btnSm,
    variantClass[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as AsButton;
  return (
    <button type="button" className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
