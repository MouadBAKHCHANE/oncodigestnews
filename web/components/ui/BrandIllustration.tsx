import styles from './BrandIllustration.module.css';

export type BrandVariant =
  | 'digestive' // double-helix-ish ribbon, husk palette
  | 'oncology' // concentric cells, canary palette
  | 'congress' // architecture / stage spotlights
  | 'abstract' // generic geometric grid, neutral
  | 'hero'; // wide cinematic split with diagonal sweep

interface BrandIllustrationProps {
  variant?: BrandVariant;
  /** ARIA — the SVG is decorative by default. Pass a label to expose it. */
  label?: string;
  className?: string;
}

const SAND = { from: '#f8f5ec', to: '#e8dfca', accent: '#82734c', text: '#82734c' };
const CREAM = { from: '#fbf8eb', to: '#eadfb9', accent: '#9a8848', text: '#82734c' };
const SKY = { from: '#eef0f5', to: '#cfd5e1', accent: '#5b6577', text: '#3d4555' };
const DARK = { from: '#1d2820', to: '#0a120c', accent: '#d6e57c', text: '#d6e57c' };

/**
 * BrandIllustration — pure-SVG visual language for OncoDigest. No photos,
 * no faces. Used as the primary visual for expertise, hero fallbacks, and
 * card placeholders. Illustrative without becoming generic stock — each
 * variant reuses two motifs: a soft gradient + a recurring geometric line
 * pattern tied to the variant's theme.
 *
 * Variants:
 *   digestive — sweeping ribbon (helical strand evoking the digestive tract)
 *   oncology  — concentric cell-like rings with a tangent line
 *   congress  — perspective stage / auditorium converging lines
 *   abstract  — neutral grid + a single accent diagonal
 *   hero      — wide cinematic version of "digestive" for above-the-fold
 *
 * All variants are responsive (preserveAspectRatio xMidYMid slice). Colors
 * read off CSS custom properties in tokens.css so theme changes propagate.
 */
export function BrandIllustration({
  variant = 'abstract',
  label,
  className,
}: BrandIllustrationProps) {
  return (
    <svg
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      className={`${styles.svg} ${className ?? ''}`}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={!label}
    >
      {variant === 'digestive' ? <DigestiveLayer /> : null}
      {variant === 'oncology' ? <OncologyLayer /> : null}
      {variant === 'congress' ? <CongressLayer /> : null}
      {variant === 'abstract' ? <AbstractLayer /> : null}
      {variant === 'hero' ? <HeroLayer /> : null}
    </svg>
  );
}

/* ─── Variant: digestive ──────────────────────────────────── */

function DigestiveLayer() {
  const c = SAND;
  return (
    <>
      <defs>
        <linearGradient id="bi-digestive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bi-digestive)" />
      {/* Ribbon — sinuous helix */}
      <path
        d="M -40 600 Q 200 380 420 600 T 880 600 T 1240 600"
        fill="none"
        stroke={c.accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M -40 660 Q 220 420 460 660 T 920 660 T 1240 660"
        fill="none"
        stroke={c.accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.32"
      />
      <path
        d="M -40 720 Q 260 480 500 720 T 960 720 T 1240 720"
        fill="none"
        stroke={c.accent}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.22"
      />
      {/* Connector dots along the ribbon */}
      {[80, 220, 360, 500, 640, 780, 920, 1060].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i % 2 === 0 ? 600 : 660}
          r="3"
          fill={c.accent}
          opacity="0.5"
        />
      ))}
      {/* Whisper triangle for asymmetry */}
      <polygon
        points="940,140 1080,300 820,300"
        fill="none"
        stroke={c.accent}
        strokeWidth="0.8"
        opacity="0.22"
      />
      <line x1="940" y1="140" x2="940" y2="300" stroke={c.accent} strokeWidth="0.5" opacity="0.18" />
    </>
  );
}

/* ─── Variant: oncology ───────────────────────────────────── */

function OncologyLayer() {
  const c = CREAM;
  return (
    <>
      <defs>
        <linearGradient id="bi-oncology" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bi-oncology)" />
      {/* Concentric cells */}
      {[
        { cx: 320, cy: 480, base: 60 },
        { cx: 760, cy: 280, base: 110 },
        { cx: 920, cy: 620, base: 80 },
      ].map((cell) => (
        <g key={`${cell.cx}-${cell.cy}`}>
          {[1, 1.6, 2.4, 3.4].map((scale, i) => (
            <circle
              key={scale}
              cx={cell.cx}
              cy={cell.cy}
              r={cell.base * scale}
              fill="none"
              stroke={c.accent}
              strokeWidth="0.8"
              opacity={0.4 - i * 0.08}
            />
          ))}
          <circle cx={cell.cx} cy={cell.cy} r="3.5" fill={c.accent} opacity="0.6" />
        </g>
      ))}
      {/* Tangent line through two cells */}
      <line x1="180" y1="540" x2="1060" y2="220" stroke={c.accent} strokeWidth="0.6" opacity="0.32" />
      <line x1="80" y1="800" x2="240" y2="800" stroke={c.accent} strokeWidth="0.5" opacity="0.4" />
    </>
  );
}

/* ─── Variant: congress ───────────────────────────────────── */

function CongressLayer() {
  const c = SKY;
  return (
    <>
      <defs>
        <linearGradient id="bi-congress" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bi-congress)" />
      {/* Vanishing-point converging lines (auditorium feel) */}
      {[200, 320, 440, 560, 680, 800, 920, 1040].map((x) => (
        <line
          key={x}
          x1={x}
          y1="0"
          x2="600"
          y2="900"
          stroke={c.accent}
          strokeWidth="0.5"
          opacity="0.18"
        />
      ))}
      {/* Stage halo */}
      <circle cx="600" cy="900" r="320" fill="none" stroke={c.accent} strokeWidth="0.8" opacity="0.32" />
      <circle cx="600" cy="900" r="420" fill="none" stroke={c.accent} strokeWidth="0.5" opacity="0.18" />
      {/* Spotlight */}
      <polygon points="600,180 540,900 660,900" fill={c.accent} opacity="0.06" />
      <line x1="80" y1="800" x2="240" y2="800" stroke={c.accent} strokeWidth="0.5" opacity="0.4" />
    </>
  );
}

/* ─── Variant: abstract ───────────────────────────────────── */

function AbstractLayer() {
  const c = SAND;
  return (
    <>
      <defs>
        <linearGradient id="bi-abstract" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bi-abstract)" />
      {/* Faint grid */}
      {Array.from({ length: 7 }, (_, i) => 150 + i * 150).map((y) => (
        <line key={`h-${y}`} x1="0" y1={y} x2="1200" y2={y} stroke={c.accent} strokeWidth="0.4" opacity="0.1" />
      ))}
      {Array.from({ length: 9 }, (_, i) => 120 + i * 120).map((x) => (
        <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="900" stroke={c.accent} strokeWidth="0.4" opacity="0.1" />
      ))}
      {/* Single accent diagonal */}
      <line x1="60" y1="780" x2="900" y2="120" stroke={c.accent} strokeWidth="1" opacity="0.42" />
      <circle cx="900" cy="120" r="5" fill={c.accent} opacity="0.6" />
      <circle cx="60" cy="780" r="3.5" fill={c.accent} opacity="0.45" />
    </>
  );
}

/* ─── Variant: hero ───────────────────────────────────────── */

function HeroLayer() {
  const c = DARK;
  return (
    <>
      <defs>
        <linearGradient id="bi-hero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
        <radialGradient id="bi-hero-glow" cx="0.7" cy="0.3" r="0.6">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bi-hero)" />
      <rect width="1200" height="900" fill="url(#bi-hero-glow)" />
      {/* Radar-like concentric rings */}
      {[120, 220, 340, 480, 640].map((r, i) => (
        <circle
          key={r}
          cx="840"
          cy="280"
          r={r}
          fill="none"
          stroke={c.accent}
          strokeWidth="0.8"
          opacity={0.42 - i * 0.07}
        />
      ))}
      {/* Cross-hairs */}
      <line x1="840" y1="0" x2="840" y2="900" stroke={c.accent} strokeWidth="0.4" opacity="0.18" />
      <line x1="200" y1="280" x2="1480" y2="280" stroke={c.accent} strokeWidth="0.4" opacity="0.18" />
      {/* Marker dots */}
      <circle cx="840" cy="280" r="4" fill={c.accent} opacity="0.85" />
      <circle cx="1080" cy="180" r="3" fill={c.accent} opacity="0.55" />
      <circle cx="600" cy="420" r="3" fill={c.accent} opacity="0.55" />
      {/* Bottom whisper */}
      <line x1="80" y1="800" x2="240" y2="800" stroke={c.accent} strokeWidth="0.5" opacity="0.5" />
    </>
  );
}
