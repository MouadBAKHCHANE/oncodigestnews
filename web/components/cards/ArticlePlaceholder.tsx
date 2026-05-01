import styles from './ArticlePlaceholder.module.css';

type Theme = 'sand' | 'mint' | 'rose' | 'sky' | 'dark' | 'cream';

interface ArticlePlaceholderProps {
  /** Big serif label rendered over the gradient (e.g. "Article", "Revue", "Chirurgie"). */
  label: string;
  theme?: Theme;
  /** Force a deterministic seed so SSR and CSR generate the same pattern. */
  seed?: number;
  className?: string;
}

const PALETTES: Record<
  Theme,
  { from: string; to: string; stroke: string; fill: string; text: string }
> = {
  sand: { from: '#f8f5ec', to: '#e8dfca', stroke: '#82734c', fill: '#82734c', text: '#82734c' },
  cream: { from: '#faf6e8', to: '#ecdfb6', stroke: '#82734c', fill: '#82734c', text: '#82734c' },
  mint: { from: '#eef4ee', to: '#cfdfd0', stroke: '#5b6f5d', fill: '#5b6f5d', text: '#5b6f5d' },
  rose: { from: '#f6ecec', to: '#e1cdcd', stroke: '#7a4f4f', fill: '#7a4f4f', text: '#7a4f4f' },
  sky: { from: '#eef0f5', to: '#cfd5e1', stroke: '#5b6577', fill: '#5b6577', text: '#5b6577' },
  dark: { from: '#1d2820', to: '#0a120c', stroke: '#aabd6e', fill: '#d6e57c', text: '#d6e57c' },
};

/**
 * SVG fallback "cover" — abstract gradient + faint geometric pattern + a
 * big serif label, used when an article has no real coverImage. Mirrors the
 * placeholder design used in the original actualites.html / articles-scientifiques.html.
 */
export function ArticlePlaceholder({
  label,
  theme = 'sand',
  seed = 0,
  className,
}: ArticlePlaceholderProps) {
  const palette = PALETTES[theme];
  const id = `ap-${theme}-${seed}`;

  // Deterministic coords (no Math.random) so server and client agree on hydration.
  const a = 100 + ((seed * 37) % 300);
  const b = 200 + ((seed * 53) % 200);

  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      className={`${styles.svg} ${className ?? ''}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#${id})`} />
      <polygon
        points={`${a},50 550,${b} 150,300`}
        fill="none"
        stroke={palette.stroke}
        strokeWidth="0.6"
        opacity="0.18"
      />
      <line x1="350" y1="50" x2="350" y2="300" stroke={palette.stroke} strokeWidth="0.6" opacity="0.14" />
      <line x1="250" y1="175" x2="450" y2="175" stroke={palette.stroke} strokeWidth="0.6" opacity="0.14" />
      <circle cx="350" cy="50" r="2.5" fill={palette.fill} opacity="0.18" />
      <circle cx="550" cy="300" r="2.5" fill={palette.fill} opacity="0.18" />
      <circle cx="150" cy="300" r="2.5" fill={palette.fill} opacity="0.18" />
      <circle cx="250" cy="175" r="2.5" fill={palette.fill} opacity="0.18" />
      <circle cx="450" cy="175" r="2.5" fill={palette.fill} opacity="0.18" />
      <line x1="36" y1="320" x2="180" y2="320" stroke={palette.stroke} strokeWidth="0.5" opacity="0.3" />
      <text
        x="36"
        y="372"
        fontFamily="var(--font-display-stack)"
        fontSize="56"
        fill={palette.text}
        fontWeight="300"
        letterSpacing="-1.5"
      >
        {label}
      </text>
    </svg>
  );
}
