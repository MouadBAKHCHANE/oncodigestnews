/**
 * SpecialtyBadge — small decorative badge with the specialty name and a
 * specialty-specific geometric motif. Designed to sit in the bottom-right
 * corner of an article card, on top of the cover image.
 *
 * Three palettes ported from the legacy actualites.html:
 *   chirurgie   — sand gradient + triangle network (color #82734c)
 *   innovation  — mint gradient + nested rotated squares (color #2d5a4d)
 *   oncologie   — olive gradient + circle + horizontal lines (color #4b5a3e)
 */

interface Props {
  /** Specialty / category title — used both for matching and display. */
  specialty: string;
  className?: string;
}

type Variant = 'chirurgie' | 'innovation' | 'oncologie';

function pickVariant(s: string): Variant {
  const lower = s.toLowerCase();
  if (lower.includes('innovation') || lower.includes('techno')) return 'innovation';
  if (lower.includes('oncolog') || lower.includes('cancer') || lower.includes('chimio')) return 'oncologie';
  return 'chirurgie';
}

const VARIANTS = {
  chirurgie: {
    from: '#f8f5ec',
    to: '#e8dfca',
    accent: '#82734c',
    text: '#82734c',
  },
  innovation: {
    from: '#eaf5f2',
    to: '#c8e6dc',
    accent: '#2d5a4d',
    text: '#2d5a4d',
  },
  oncologie: {
    from: '#f0f2ea',
    to: '#d8ddc8',
    accent: '#4b5a3e',
    text: '#4b5a3e',
  },
} as const;

export function SpecialtyBadge({ specialty, className }: Props) {
  const variant = pickVariant(specialty);
  const c = VARIANTS[variant];

  return (
    <svg
      viewBox="0 0 200 80"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={specialty}
    >
      <defs>
        <linearGradient id={`sb-grad-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="200" height="80" rx="8" fill={`url(#sb-grad-${variant})`} />

      {/* Variant-specific motif on the right side */}
      {variant === 'chirurgie' ? (
        <g stroke={c.accent} fill="none" opacity="0.25">
          <polygon points="160,15 185,55 135,55" strokeWidth="0.8" />
          <line x1="160" y1="15" x2="160" y2="55" strokeWidth="0.6" />
          <line x1="147" y1="35" x2="173" y2="35" strokeWidth="0.6" />
          <circle cx="160" cy="15" r="1.5" fill={c.accent} stroke="none" />
          <circle cx="185" cy="55" r="1.5" fill={c.accent} stroke="none" />
          <circle cx="135" cy="55" r="1.5" fill={c.accent} stroke="none" />
          <circle cx="160" cy="35" r="1.2" fill={c.accent} stroke="none" />
        </g>
      ) : null}

      {variant === 'innovation' ? (
        <g stroke={c.accent} fill="none" opacity="0.3">
          <rect x="138" y="13" width="44" height="44" transform="rotate(0,160,35)" strokeWidth="0.8" />
          <rect x="143" y="18" width="34" height="34" transform="rotate(15,160,35)" strokeWidth="0.7" />
          <rect x="148" y="23" width="24" height="24" transform="rotate(30,160,35)" strokeWidth="0.6" />
          <rect x="154" y="29" width="12" height="12" transform="rotate(45,160,35)" strokeWidth="0.5" />
          <circle cx="160" cy="35" r="1.2" fill={c.accent} stroke="none" />
        </g>
      ) : null}

      {variant === 'oncologie' ? (
        <g stroke={c.accent} fill="none" opacity="0.3">
          <line x1="120" y1="20" x2="155" y2="20" strokeWidth="0.6" />
          <line x1="170" y1="20" x2="195" y2="20" strokeWidth="0.6" />
          <line x1="120" y1="35" x2="148" y2="35" strokeWidth="0.6" />
          <line x1="177" y1="35" x2="195" y2="35" strokeWidth="0.6" />
          <line x1="120" y1="50" x2="155" y2="50" strokeWidth="0.6" />
          <line x1="170" y1="50" x2="195" y2="50" strokeWidth="0.6" />
          <circle cx="162" cy="35" r="14" strokeWidth="0.7" />
          <circle cx="162" cy="35" r="1.2" fill={c.accent} stroke="none" />
        </g>
      ) : null}

      {/* Bottom rule + specialty name */}
      <line x1="14" y1="50" x2="60" y2="50" stroke={c.accent} strokeWidth="0.5" opacity="0.4" />
      <text
        x="14"
        y="68"
        fontFamily="Georgia, serif"
        fontSize="18"
        fontWeight="400"
        fill={c.text}
      >
        {specialty}
      </text>
    </svg>
  );
}
