import styles from './Logo.module.css';

type Variant = 'wordmark' | 'mark';

export interface LogoProps {
  variant?: Variant;
  size?: number;
  /** Visual color — defaults to cod-gray-900 (dark). Pass any CSS color. */
  color?: string;
  className?: string;
}

/**
 * OncoDigest minimal text logo.
 *
 *   <Logo />                  → "OncoDigest" wordmark, 20px, dark on light
 *   <Logo variant="mark" />   → "OD" monogram, used in tight squares
 *   <Logo size={28} color="white" /> → custom size + color
 *
 * Pure text — no SVG, no font file beyond Fraunces (already loaded). Inherits
 * the display font stack so it matches body headings.
 */
export function Logo({
  variant = 'wordmark',
  size,
  color,
  className,
}: LogoProps) {
  const cls = [styles.logo, variant === 'mark' ? styles.mark : styles.wordmark, className]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {};
  if (size) style.fontSize = `${size}px`;
  if (color) style.color = color;

  if (variant === 'mark') {
    return (
      <span className={cls} style={style} aria-label="OncoDigest">
        OD
      </span>
    );
  }

  return (
    <span className={cls} style={style} aria-label="OncoDigest">
      OncoDigest
    </span>
  );
}
