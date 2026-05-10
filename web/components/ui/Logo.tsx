import styles from './Logo.module.css';

type Variant = 'wordmark' | 'mark';

export interface LogoProps {
  variant?: Variant;
  /** Pixel height of the rendered logo. Width auto-scales via aspect ratio for the wordmark. */
  size?: number;
  /** Use the dark-bg variant (off-white serif + bright canary suffix). */
  dark?: boolean;
  /** For `variant="mark"` only — text color override. Ignored for the wordmark image. */
  color?: string;
  className?: string;
}

const WORDMARK_LIGHT = '/logo-oncodigest-news.png';
const WORDMARK_DARK = '/logo-oncodigest-news-dark.png';
// Native PNG aspect ratio (width / height). Both PNGs share the same canvas size.
const WORDMARK_RATIO = 1133 / 298;

/**
 * OncoDigest brand mark.
 *
 *   <Logo />                          → wordmark PNG (dark "OncoDigest" + canary "news")
 *   <Logo dark />                     → wordmark PNG for dark surfaces (off-white + bright canary)
 *   <Logo size={28} />                → height 28px (width auto)
 *   <Logo variant="mark" />           → "OD" text monogram for tight squares (avatars)
 */
export function Logo({
  variant = 'wordmark',
  size,
  dark = false,
  color,
  className,
}: LogoProps) {
  if (variant === 'mark') {
    const style: React.CSSProperties = {};
    if (size) style.fontSize = `${size}px`;
    if (color) style.color = color;
    return (
      <span
        className={[styles.logo, styles.mark, className].filter(Boolean).join(' ')}
        style={style}
        aria-label="OncoDigest news"
      >
        OD
      </span>
    );
  }

  const height = size ?? 28;
  const width = Math.round(height * WORDMARK_RATIO);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? WORDMARK_DARK : WORDMARK_LIGHT}
      alt="OncoDigest news"
      width={width}
      height={height}
      className={[styles.logo, styles.wordmark, className].filter(Boolean).join(' ')}
      style={{ height, width: 'auto' }}
    />
  );
}
