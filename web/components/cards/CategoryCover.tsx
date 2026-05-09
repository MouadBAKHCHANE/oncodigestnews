/**
 * CategoryCover — full-card themed cover used when an article has no real
 * coverImage. Mirrors the legacy actualites.html "specialty cover" design:
 *   - Chirurgie  → sand gradient + triangle network
 *   - Innovation → mint gradient + nested rotated squares
 *   - Oncologie  → olive gradient + horizontal lines + circle
 *
 * Big serif category name sits on top, with a faint geometric motif in the
 * middle of the card. SVG is 600×400 (16:9-ish via preserveAspectRatio="slice").
 */

interface Props {
  /** Category title — e.g. "Chirurgie" / "Innovation" / "Oncologie". */
  category: string;
  className?: string;
}

type Variant = 'chirurgie' | 'innovation' | 'oncologie';

function pickVariant(s: string): Variant {
  const lower = s.toLowerCase();
  if (lower.includes('innovation') || lower.includes('techno')) return 'innovation';
  if (lower.includes('oncolog') || lower.includes('cancer') || lower.includes('chimio'))
    return 'oncologie';
  return 'chirurgie';
}

const VARIANTS: Record<
  Variant,
  { from: string; to: string; accent: string; text: string }
> = {
  chirurgie: { from: '#f8f5ec', to: '#e8dfca', accent: '#82734c', text: '#82734c' },
  innovation: { from: '#eaf5f2', to: '#c8e6dc', accent: '#2d5a4d', text: '#2d5a4d' },
  oncologie: { from: '#f0f2ea', to: '#d8ddc8', accent: '#4b5a3e', text: '#4b5a3e' },
};

export function CategoryCover({ category, className }: Props) {
  const variant = pickVariant(category);
  const c = VARIANTS[variant];
  const id = `cc-${variant}`;

  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={category}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#${id}-grad)`} />

      {/* Variant motif — centered, faint */}
      {variant === 'chirurgie' ? (
        <g stroke={c.accent} fill="none" opacity="0.22">
          <polygon points="200,80 460,140 280,260" strokeWidth="0.8" />
          <line x1="200" y1="80" x2="280" y2="260" strokeWidth="0.6" />
          <line x1="240" y1="170" x2="370" y2="200" strokeWidth="0.6" />
          <circle cx="200" cy="80" r="3" fill={c.accent} stroke="none" />
          <circle cx="460" cy="140" r="3" fill={c.accent} stroke="none" />
          <circle cx="280" cy="260" r="3" fill={c.accent} stroke="none" />
          <circle cx="370" cy="200" r="2" fill={c.accent} stroke="none" />
        </g>
      ) : null}

      {variant === 'innovation' ? (
        <g stroke={c.accent} fill="none" opacity="0.28">
          <rect x="220" y="80" width="160" height="160" transform="rotate(0,300,160)" strokeWidth="0.9" />
          <rect x="240" y="100" width="120" height="120" transform="rotate(15,300,160)" strokeWidth="0.8" />
          <rect x="260" y="120" width="80" height="80" transform="rotate(30,300,160)" strokeWidth="0.7" />
          <rect x="280" y="140" width="40" height="40" transform="rotate(45,300,160)" strokeWidth="0.6" />
          <circle cx="300" cy="160" r="2.5" fill={c.accent} stroke="none" />
        </g>
      ) : null}

      {variant === 'oncologie' ? (
        <g stroke={c.accent} fill="none" opacity="0.3">
          <line x1="120" y1="100" x2="240" y2="100" strokeWidth="0.6" />
          <line x1="320" y1="100" x2="480" y2="100" strokeWidth="0.6" />
          <line x1="120" y1="160" x2="220" y2="160" strokeWidth="0.6" />
          <line x1="340" y1="160" x2="480" y2="160" strokeWidth="0.6" />
          <line x1="120" y1="220" x2="240" y2="220" strokeWidth="0.6" />
          <line x1="320" y1="220" x2="480" y2="220" strokeWidth="0.6" />
          <circle cx="280" cy="160" r="58" strokeWidth="0.9" />
          <circle cx="280" cy="160" r="2.2" fill={c.accent} stroke="none" />
        </g>
      ) : null}

      {/* Bottom-left: small accent rule + big serif category name */}
      <line x1="36" y1="320" x2="120" y2="320" stroke={c.accent} strokeWidth="0.6" opacity="0.4" />
      <text
        x="36"
        y="372"
        fontFamily="var(--font-display-stack)"
        fontSize="56"
        fill={c.text}
        fontWeight="300"
        letterSpacing="-1.5"
      >
        {category}
      </text>
    </svg>
  );
}
